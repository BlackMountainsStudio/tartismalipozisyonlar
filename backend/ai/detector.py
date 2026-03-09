from __future__ import annotations

import re
from dataclasses import dataclass
from typing import List, Literal


EventType = Literal[
    "penalty_debate",
    "red_card_debate",
    "offside_debate",
    "foul_debate",
    "var_intervention",
    "referee_mistake",
]


@dataclass
class DetectedEvent:
    match: str | None
    minute: int
    event_type: EventType
    description: str
    confidence: float


TEAM_PATTERN = re.compile(
    r"(fenerbah[çc]e|galatasaray|be[sş]ikta[sş]|trabzonspor)",
    re.IGNORECASE,
)

MINUTE_PATTERN = re.compile(r"(\d{1,3})\s*['’\.]?\s*(?:dakika|dk)?", re.IGNORECASE)


def _infer_event_type(text: str) -> EventType | None:
    lowered = text.lower()
    if "penalt" in lowered:
        return "penalty_debate"
    if "kırmızı kart" in lowered or "kirmizi kart" in lowered:
        return "red_card_debate"
    if "ofsayt" in lowered or "offsid" in lowered:
        return "offside_debate"
    if "faul" in lowered:
        return "foul_debate"
    if "var" in lowered:
        return "var_intervention"
    if "hakem hatas" in lowered or "yanlış karar" in lowered:
        return "referee_mistake"
    return None


def detect_events_from_text(text: str) -> List[DetectedEvent]:
    """
    Basit kural tabanlı tespit.

    İleride sentence-transformers tabanlı bir sınıflandırıcı ile
    değiştirilebilir; şimdilik blueprint'teki JSON şekline uygun
    olaylar döndürür.
    """

    events: List[DetectedEvent] = []

    for paragraph in re.split(r"\n{2,}", text):
        if not paragraph.strip():
            continue

        event_type = _infer_event_type(paragraph)
        if not event_type:
            continue

        minute_match = MINUTE_PATTERN.search(paragraph)
        minute = int(minute_match.group(1)) if minute_match else 0

        team_match = TEAM_PATTERN.search(paragraph)
        match_name = team_match.group(1).title() if team_match else None

        confidence = 0.7
        if minute_match:
            confidence += 0.1
        if team_match:
            confidence += 0.1

        events.append(
            DetectedEvent(
                match=match_name,
                minute=minute,
                event_type=event_type,
                description=paragraph.strip()[:512],
                confidence=min(confidence, 0.99),
            ),
        )

    return events


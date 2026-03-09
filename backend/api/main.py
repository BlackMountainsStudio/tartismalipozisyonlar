from typing import List, Optional

from fastapi import Depends, FastAPI, Query
from sqlalchemy.orm import Session

from backend.database import models
from backend.database.session import get_db

app = FastAPI(title="VAR Odası Backend API")


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


@app.get("/matches")
def list_matches(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    season: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[dict]:
    query = db.query(models.Match)
    if season:
        query = query.filter(models.Match.season == season)
    matches = query.offset(offset).limit(limit).all()
    return [
        {
            "id": m.id,
            "home_team_id": m.home_team_id,
            "away_team_id": m.away_team_id,
            "referee_id": m.referee_id,
            "date": m.date.isoformat() if m.date else None,
            "season": m.season,
        }
        for m in matches
    ]


@app.get("/matches/{match_id}")
def get_match(match_id: int, db: Session = Depends(get_db)) -> dict | None:
    match = db.query(models.Match).get(match_id)
    if not match:
        return None
    return {
        "id": match.id,
        "home_team_id": match.home_team_id,
        "away_team_id": match.away_team_id,
        "referee_id": match.referee_id,
        "date": match.date.isoformat() if match.date else None,
        "season": match.season,
    }


@app.get("/matches/{match_id}/events")
def get_match_events(
    match_id: int,
    db: Session = Depends(get_db),
) -> List[dict]:
    events = (
        db.query(models.Event)
        .filter(models.Event.match_id == match_id)
        .order_by(models.Event.minute.asc())
        .all()
    )
    return [
        {
            "id": e.id,
            "minute": e.minute,
            "event_type": e.event_type.value,
            "description": e.description,
            "confidence_score": e.confidence_score,
        }
        for e in events
    ]


@app.get("/events")
def list_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[dict]:
    query = db.query(models.Event)
    if event_type:
        query = query.filter(models.Event.event_type == event_type)
    events = query.offset(offset).limit(limit).all()
    return [
        {
            "id": e.id,
            "match_id": e.match_id,
            "minute": e.minute,
            "event_type": e.event_type.value,
            "description": e.description,
            "confidence_score": e.confidence_score,
        }
        for e in events
    ]


@app.get("/controversial-events")
def list_controversial_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    min_confidence: float = Query(0.6, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
) -> List[dict]:
    events = (
        db.query(models.Event)
        .filter(
            models.Event.is_controversial.is_(True),
            models.Event.confidence_score >= min_confidence,
        )
        .order_by(models.Event.confidence_score.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        {
            "id": e.id,
            "match_id": e.match_id,
            "minute": e.minute,
            "event_type": e.event_type.value,
            "description": e.description,
            "confidence_score": e.confidence_score,
        }
        for e in events
    ]


@app.get("/teams/{team_id}")
def get_team(team_id: int, db: Session = Depends(get_db)) -> dict | None:
    team = db.query(models.Team).get(team_id)
    if not team:
        return None
    return {
        "id": team.id,
        "name": team.name,
        "league": team.league,
    }


@app.get("/referees")
def list_referees(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> List[dict]:
    referees = db.query(models.Referee).offset(offset).limit(limit).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "nationality": r.nationality,
        }
        for r in referees
    ]


@app.get("/statistics/referees")
def referee_statistics(db: Session = Depends(get_db)) -> List[dict]:
    subq = (
        db.query(
            models.Event.match_id,
            models.Event.id.label("event_id"),
        )
        .subquery()
    )

    matches = db.query(models.Match).all()
    stats = []
    for m in matches:
        total_events = len([e for e in m.events if e.is_controversial])
        stats.append(
            {
                "referee_id": m.referee_id,
                "match_id": m.id,
                "controversial_decisions": total_events,
            },
        )
    return stats


@app.get("/statistics/teams")
def team_statistics(db: Session = Depends(get_db)) -> List[dict]:
    teams = db.query(models.Team).all()
    data: List[dict] = []
    for t in teams:
        events_home = [
            e
            for m in t.home_matches
            for e in m.events
            if e.is_controversial
        ]
        events_away = [
            e
            for m in t.away_matches
            for e in m.events
            if e.is_controversial
        ]
        all_events = events_home + events_away
        data.append(
            {
                "team_id": t.id,
                "team_name": t.name,
                "controversial_events": len(all_events),
            },
        )
    return data



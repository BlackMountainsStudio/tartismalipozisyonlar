/** Pozisyon türüne göre gruplama (penaltı, ofsayt/gol iptali, kart, faul/el, diğer) */
export const INCIDENT_CATEGORIES: Record<
  string,
  { key: string; label: string }
> = {
  PENALTY: { key: "penalty", label: "Penaltı pozisyonları" },
  POSSIBLE_PENALTY: { key: "penalty", label: "Penaltı pozisyonları" },
  GOAL_DISALLOWED: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  OFFSIDE: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  POSSIBLE_OFFSIDE_GOAL: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  RED_CARD: { key: "card", label: "Kart pozisyonları" },
  YELLOW_CARD: { key: "card", label: "Kart pozisyonları" },
  MISSED_RED_CARD: { key: "card", label: "Kart pozisyonları" },
  MISSED_YELLOW: { key: "card", label: "Kart pozisyonları" },
  FOUL: { key: "foul_handball", label: "Faul / El" },
  HANDBALL: { key: "foul_handball", label: "Faul / El" },
  VAR_CONTROVERSY: { key: "other", label: "Diğer" },
};

export const CATEGORY_ORDER = [
  "penalty",
  "offside_goal",
  "card",
  "foul_handball",
  "other",
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number];

export function getCategoryKey(type: string): string {
  return INCIDENT_CATEGORIES[type]?.key ?? "other";
}

export function getCategoryLabel(type: string): string {
  return INCIDENT_CATEGORIES[type]?.label ?? "Diğer";
}

/** Tüm benzersiz pozisyon türleri (API type değerleri) */
export const INCIDENT_TYPES = [
  "PENALTY",
  "POSSIBLE_PENALTY",
  "GOAL_DISALLOWED",
  "OFFSIDE",
  "POSSIBLE_OFFSIDE_GOAL",
  "RED_CARD",
  "YELLOW_CARD",
  "MISSED_RED_CARD",
  "MISSED_YELLOW",
  "FOUL",
  "HANDBALL",
  "VAR_CONTROVERSY",
] as const;

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  PENALTY: "Penaltı Verildi",
  POSSIBLE_PENALTY: "Penaltı Verilmedi",
  GOAL_DISALLOWED: "İptal Edilen Gol",
  OFFSIDE: "Ofsayt Kararı",
  POSSIBLE_OFFSIDE_GOAL: "Ofsayt Tartışması",
  RED_CARD: "Kırmızı Kart",
  YELLOW_CARD: "Sarı Kart",
  MISSED_RED_CARD: "Verilmeyen Kırmızı Kart",
  MISSED_YELLOW: "Verilmeyen Sarı Kart",
  FOUL: "Faul Kararı",
  HANDBALL: "El ile Temas",
  VAR_CONTROVERSY: "VAR Tartışması",
};

/** Karar tipine göre maç etkisi puanı (1–10, yüksek = daha kritik) */
export const INCIDENT_IMPACT_POINTS: Record<string, number> = {
  PENALTY: 9,
  POSSIBLE_PENALTY: 8,
  GOAL_DISALLOWED: 8,
  OFFSIDE: 7,
  POSSIBLE_OFFSIDE_GOAL: 6,
  RED_CARD: 8,
  MISSED_RED_CARD: 7,
  YELLOW_CARD: 3,
  MISSED_YELLOW: 4,
  FOUL: 2,
  HANDBALL: 5,
  VAR_CONTROVERSY: 5,
};

export function getIncidentImpactPoints(type: string): number {
  return INCIDENT_IMPACT_POINTS[type] ?? 3;
}

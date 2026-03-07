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
  "FOUL",
  "HANDBALL",
  "VAR_CONTROVERSY",
] as const;

export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  PENALTY: "Penaltı verildi",
  POSSIBLE_PENALTY: "Penaltı verilmedi",
  GOAL_DISALLOWED: "İptal edilen gol",
  OFFSIDE: "Ofsayt",
  POSSIBLE_OFFSIDE_GOAL: "Ofsayt tartışması",
  RED_CARD: "Kırmızı kart",
  YELLOW_CARD: "Sarı kart",
  MISSED_RED_CARD: "Verilmeyen kırmızı kart",
  FOUL: "Faul",
  HANDBALL: "El ile temas",
  VAR_CONTROVERSY: "VAR tartışması",
};

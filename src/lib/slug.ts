/**
 * Türkçe karakterleri ASCII karşılıklarına çevirip slug üretir.
 */
export function slugify(text: string, maxLength = 80): string {
  if (!text || typeof text !== "string") return "";
  const tr: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", I: "i", ö: "o", Ö: "o",
    ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  let s = text.trim();
  for (const [k, v] of Object.entries(tr)) {
    s = s.replace(new RegExp(k, "g"), v);
  }
  s = s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s.slice(0, maxLength);
}

/**
 * Tarihten sezon string'i üretir (örn. 2025-26).
 * Ağustos itibarıyla yeni sezon başlar kabul edilir.
 */
export function getSeasonFromDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (month >= 8) return `${year}-${String(year + 1).slice(-2)}`;
  return `${year - 1}-${String(year).slice(-2)}`;
}

export interface MatchForSlug {
  league: string;
  week: number;
  date: string | Date;
  homeTeam: string;
  awayTeam: string;
}

/**
 * Maç için tek segment slug: super-lig-2025-26-hafta-15-fenerbahce-galatasaray
 */
export function buildMatchSlug(match: MatchForSlug): string {
  const leagueSlug = slugify(match.league, 30);
  const season = getSeasonFromDate(match.date);
  const home = slugify(match.homeTeam, 25);
  const away = slugify(match.awayTeam, 25);
  return `${leagueSlug}-${season}-hafta-${match.week}-${home}-${away}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export interface IncidentForSlug {
  id: string;
  minute: number | null;
  description: string;
}

/**
 * Incident id'den kısa hash (son 8 karakter, incident_ prefix'siz).
 */
export function getShortIdFromIncidentId(id: string): string {
  const raw = id.replace(/^incident_/, "");
  return raw.length >= 8 ? raw.slice(-8) : raw;
}

/**
 * Pozisyon için slug: 15-dk-baris-alper-yilmaz-pozisyonu-86c00f93
 */
export function buildIncidentSlug(incident: IncidentForSlug): string {
  const shortId = getShortIdFromIncidentId(incident.id);
  const descWords = incident.description.trim().split(/\s+/).slice(0, 4);
  const descSlug = slugify(descWords.join(" "), 40) || "pozisyon";
  const base = incident.minute != null
    ? `${incident.minute}-dk-${descSlug}-pozisyonu`
    : `${descSlug}-pozisyonu`;
  return `${base}-${shortId}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * incidentSlug'tan shortId çıkarır (son segment - ile ayrılmış).
 */
export function getShortIdFromIncidentSlug(incidentSlug: string): string {
  const parts = incidentSlug.split("-");
  const last = parts[parts.length - 1];
  return last && /^[a-f0-9]{8}$/i.test(last) ? last : "";
}

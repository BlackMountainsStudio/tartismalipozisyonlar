/**
 * Merkezi link yardımcıları - tüm URL'ler buradan üretilir.
 */

/** Maç sayfası: /matches/[slug] */
export function matchUrl(slugOrId: string): string {
  return `/matches/${encodeURIComponent(slugOrId)}`;
}

/** Pozisyon sayfası: /matches/[matchSlug]/[incidentSlug] */
export function incidentUrl(matchSlug: string, incidentSlug: string): string {
  return `/matches/${encodeURIComponent(matchSlug)}/${encodeURIComponent(incidentSlug)}`;
}

/** Hakem sayfası */
export function refereeUrl(slug: string): string {
  return `/hakemler/${encodeURIComponent(slug)}`;
}

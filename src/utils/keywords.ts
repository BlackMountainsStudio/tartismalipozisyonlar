export const CONTROVERSY_KEYWORDS_TR = [
  "penaltı verilmedi",
  "net penaltı",
  "ofsayt değil",
  "hakem katletti",
  "VAR skandalı",
  "kırmızı kart verilmedi",
  "hakem hatası",
  "yanlış karar",
  "penaltı pozisyonu",
  "el var",
  "gol iptali",
  "ofsayt gol",
  "hakem skandalı",
  "kırmızı kart",
  "sarı kart",
  "VAR",
  "penaltı",
  "ofsayt",
  "hakem",
];

export const CONTROVERSY_KEYWORDS_EN = [
  "penalty not given",
  "clear penalty",
  "not offside",
  "referee mistake",
  "VAR scandal",
  "red card not given",
  "wrong decision",
  "handball",
  "goal disallowed",
  "offside goal",
  "referee controversy",
];

export const TRACKED_TEAMS = ["Fenerbahçe", "Galatasaray"];

export const TEAM_ALIASES: Record<string, string[]> = {
  Fenerbahçe: ["fenerbahce", "fenerbahçe", "fener", "fb", "fenerbahce sk"],
  Galatasaray: ["galatasaray", "gs", "cim bom", "galatasaray sk", "aslan"],
};

export function buildSearchQueries(
  homeTeam: string,
  awayTeam: string
): string[] {
  const queries: string[] = [];
  const allKeywords = [...CONTROVERSY_KEYWORDS_TR, ...CONTROVERSY_KEYWORDS_EN];

  queries.push(`${homeTeam} ${awayTeam}`);
  queries.push(`${homeTeam} vs ${awayTeam}`);
  queries.push(`${homeTeam} ${awayTeam} hakem`);
  queries.push(`${homeTeam} ${awayTeam} penaltı`);
  queries.push(`${homeTeam} ${awayTeam} VAR`);

  for (const keyword of allKeywords.slice(0, 6)) {
    queries.push(`${homeTeam} ${awayTeam} ${keyword}`);
  }

  return queries;
}

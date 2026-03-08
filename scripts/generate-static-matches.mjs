#!/usr/bin/env node
/**
 * data/season-2025-26/weeks/*.json dosyalarından public/matches.json üretir.
 * Sunucusuz (static) ortamda maç listesini göstermek için kullanılır.
 * Kullanım: node scripts/generate-static-matches.mjs
 */
import fs from "node:fs";
import path from "node:path";

const weeksDir = path.join(process.cwd(), "data", "season-2025-26", "weeks");
const outputPath = path.join(process.cwd(), "public", "matches.json");

function slugify(text, maxLength = 80) {
  if (!text || typeof text !== "string") return "";
  const tr = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", I: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };
  let s = text.trim();
  for (const [k, v] of Object.entries(tr)) s = s.replace(new RegExp(k, "g"), v);
  s = s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s.slice(0, maxLength);
}

function getSeasonFromDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  if (month >= 8) return `${year}-${String(year + 1).slice(-2)}`;
  return `${year - 1}-${String(year).slice(-2)}`;
}

function buildMatchSlug(match) {
  const leagueSlug = slugify(match.league, 30);
  const season = getSeasonFromDate(match.date);
  const home = slugify(match.homeTeam, 25);
  const away = slugify(match.awayTeam, 25);
  return `${leagueSlug}-${season}-hafta-${match.week}-${home}-${away}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function loadWeekFiles() {
  if (!fs.existsSync(weeksDir)) return [];
  return fs
    .readdirSync(weeksDir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(weeksDir, file), "utf8"));
      return (data.matches || []).map((m) => ({ ...m, week: m.week ?? data.week }));
    });
}

const allMatches = loadWeekFiles();
const matches = allMatches.map((m, i) => {
  const id = `season_${String(i).padStart(4, "0")}_${Date.now().toString(36)}`;
  const slug = buildMatchSlug(m);
  const incidents = (m.incidents || []).map((inc, j) => ({
    id: `incident_${id}_${j}`,
    type: inc.type,
    status: inc.status ?? "APPROVED",
    confidenceScore: inc.confidenceScore ?? 0.75,
    minute: inc.minute ?? null,
    description: inc.description ?? "",
    slug: inc.slug ?? null,
  }));
  return {
    id,
    slug,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    league: m.league ?? "Süper Lig 2025-26",
    week: m.week,
    date: m.date,
    note: m.note ?? null,
    incidents,
    referee: null,
    varReferee: null,
  };
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(matches), "utf8");
console.log(`public/matches.json oluşturuldu: ${matches.length} maç`);

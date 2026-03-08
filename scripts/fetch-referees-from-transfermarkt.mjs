#!/usr/bin/env node
/**
 * Transfermarkt'tan hafta hafta maç-hakem verilerini çeker ve match-referees.json'a ekler.
 * Kullanım: node scripts/fetch-referees-from-transfermarkt.mjs
 *
 * Not: Rate limit nedeniyle haftalar arasında 2 sn bekler.
 */
import fs from "node:fs";
import path from "node:path";

const TEAM_MAP = {
  "Gaziantep FK": "Gaziantep",
  "GFK": "Gaziantep",
  "Ç. Rizespor": "Çaykur Rizespor",
  "RİZE": "Çaykur Rizespor",
  "Karagümrük": "Fatih Karagümrük",
  "KGM": "Fatih Karagümrük",
  "Başakşehir": "İstanbul Başakşehir",
  "İBFK": "İstanbul Başakşehir",
  "Göztepe": "Göztepe",
  "GÖZ": "Göztepe",
  "Galatasaray": "Galatasaray",
  "GS": "Galatasaray",
  "Fenerbahçe": "Fenerbahçe",
  "FB": "Fenerbahçe",
  "Samsunspor": "Samsunspor",
  "SAM": "Samsunspor",
  "Gençlerbirliği": "Gençlerbirliği",
  "GB": "Gençlerbirliği",
  "Kocaelispor": "Kocaelispor",
  "KOC": "Kocaelispor",
  "Konyaspor": "Konyaspor",
  "KON": "Konyaspor",
  "Kasımpaşa": "Kasımpaşa",
  "KPAŞA": "Kasımpaşa",
  "Alanyaspor": "Alanyaspor",
  "ALA": "Alanyaspor",
  "Antalyaspor": "Antalyaspor",
  "ANT": "Antalyaspor",
  "Beşiktaş": "Beşiktaş",
  "BJK": "Beşiktaş",
  "Kayserispor": "Kayserispor",
  "KYS": "Kayserispor",
  "Trabzonspor": "Trabzonspor",
  "TS": "Trabzonspor",
  "Eyüpspor": "Eyüpspor",
  "EYP": "Eyüpspor",
};

function normalizeTeam(name) {
  return TEAM_MAP[name] ?? name;
}

async function fetchWeek(week) {
  const url = `https://www.transfermarkt.com.tr/super-lig/spieltag/wettbewerb/TR1/saison_id/2025/spieltag/${week}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();
    const matches = [];
    const refRegex = /Hakem:\s*\[([^\]]+)\]\([^)]+\)/g;
    const matchRegex = /\[([^\]]+)\]\([^)]+spielplan[^)]+\)\s*[^(]*\([^)]*\)\s*\|\s*[^|]*\|\s*\[([^\]]+)\]\([^)]+spielplan[^)]+\)/g;
    const parts = html.split(refRegex);
    let i = 1;
    while (i < parts.length) {
      const refName = parts[i].trim();
      const before = parts[i - 1];
      const teamMatch = before.match(/\[([^\]]+)\]\([^)]+spielplan[^)]+\)\s*\([^)]*\)\s*\|\s*[^|]*\|\s*\[([^\]]+)\]\([^)]+spielplan[^)]+\)/);
      if (teamMatch) {
        const home = normalizeTeam(teamMatch[1].trim());
        const away = normalizeTeam(teamMatch[2].trim());
        if (home && away && refName && !refName.includes("transfermarkt")) {
          matches.push({ homeTeam: home, awayTeam: away, week, referee: refName });
        }
      }
      i += 2;
    }
    const altRegex = /\((\d+)\.\)\s*\[([^\]]+)\].*?\[([^\]]+)\].*?Hakem:\s*\[([^\]]+)\]/gs;
    let m;
    while ((m = altRegex.exec(html)) !== null) {
      const home = normalizeTeam(m[2].trim());
      const away = normalizeTeam(m[3].trim());
      const ref = m[4].trim();
      if (home && away && ref && !matches.some((x) => x.homeTeam === home && x.awayTeam === away)) {
        matches.push({ homeTeam: home, awayTeam: away, week, referee: ref });
      }
    }
    return matches;
  } catch (e) {
    console.error(`Hafta ${week} hatası:`, e.message);
    return [];
  }
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "season-2025-26", "match-referees.json");
  const existing = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existingMatches = new Set(
    (existing.matches || []).map((m) => `${m.homeTeam}|${m.awayTeam}|${m.week}`)
  );

  const allNew = [];
  for (let w = 1; w <= 25; w++) {
    process.stdout.write(`Hafta ${w}... `);
    const matches = await fetchWeek(w);
    for (const m of matches) {
      const key = `${m.homeTeam}|${m.awayTeam}|${m.week}`;
      if (!existingMatches.has(key)) {
        existingMatches.add(key);
        allNew.push(m);
      }
    }
    console.log(`${matches.length} maç`);
    if (w < 25) await new Promise((r) => setTimeout(r, 2000));
  }

  const newRefs = new Set();
  for (const m of allNew) {
    if (m.referee) newRefs.add(m.referee);
  }
  const refList = existing.referees || [];
  const refSlugs = new Set(refList.map((r) => r.slug || r.name));
  for (const name of newRefs) {
    const slug = name.toLowerCase().replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!refSlugs.has(slug)) {
      refList.push({ name, slug, role: "REFEREE" });
      refSlugs.add(slug);
    }
  }

  existing.matches = [...(existing.matches || []), ...allNew];
  existing.referees = refList;
  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2), "utf8");
  console.log(`\n${allNew.length} yeni maç-hakem eşleştirmesi eklendi.`);
}

main().catch(console.error);

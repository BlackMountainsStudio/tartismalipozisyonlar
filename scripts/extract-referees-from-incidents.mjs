#!/usr/bin/env node
/**
 * Week JSON dosyalarındaki incident açıklamalarından hakem isimlerini çıkarır
 * ve match-referees.json'a ekler.
 *
 * Kullanım: node scripts/extract-referees-from-incidents.mjs
 */
import fs from "node:fs";
import path from "node:path";

const KNOWN_REFEREES = [
  "Ali Şansalan", "Çağdaş Altay", "Halil Umut Meler", "Arda Kardeşler",
  "Mehmet Türkmen", "Atilla Karaoğlan", "Yasin Kol", "Oğuzhan Çakır",
  "Alper Akarsu", "Ozan Ergün", "Adnan Deniz Kayatepe", "Cihan Aydın",
  "Abdullah Buğra Taşkınsoy", "Ali Yılmaz", "Batuhan Kolak", "Zorbay Küçük",
];

const weeksDir = path.join(process.cwd(), "data", "season-2025-26", "weeks");
const dataPath = path.join(process.cwd(), "data", "season-2025-26", "match-referees.json");

function extractRefereeFromDescription(desc) {
  if (!desc || typeof desc !== "string") return null;
  for (const ref of KNOWN_REFEREES) {
    if (
      desc.includes(`hakem ${ref}`) ||
      desc.includes(`Hakem ${ref}`) ||
      desc.includes(`hakem ${ref}'`) ||
      desc.includes(`Hakem ${ref}'`)
    )
      return ref;
  }
  return null;
}

function main() {
  const existing = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const existingKeys = new Set(
    (existing.matches || []).map((m) => `${m.homeTeam}|${m.awayTeam}|${m.week}`)
  );

  const files = fs.readdirSync(weeksDir).filter((f) => f.endsWith(".json")).sort();
  const added = [];

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(weeksDir, file), "utf8"));
    const week = data.week;
    for (const match of data.matches || []) {
      const key = `${match.homeTeam}|${match.awayTeam}|${week}`;
      if (existingKeys.has(key)) continue;

      let referee = null;
      for (const inc of match.incidents || []) {
        const r = extractRefereeFromDescription(inc.description);
        if (r) {
          referee = r;
          break;
        }
      }

      if (referee) {
        added.push({ homeTeam: match.homeTeam, awayTeam: match.awayTeam, week, referee });
        existingKeys.add(key);
      }
    }
  }

  if (added.length > 0) {
    existing.matches = [...(existing.matches || []), ...added];
    fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2), "utf8");
    console.log(`${added.length} maç-hakem eşleştirmesi incident'lerden eklendi.`);
  } else {
    console.log("Yeni eşleştirme bulunamadı.");
  }
}

main();

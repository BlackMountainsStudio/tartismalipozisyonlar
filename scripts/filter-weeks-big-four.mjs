#!/usr/bin/env node
/**
 * Tüm hafta dosyalarından sadece FB, GS, BJK, TS maçlarını bırakır; diğer maçları siler.
 * Kullanım: node scripts/filter-weeks-big-four.mjs
 */
import fs from "node:fs";
import path from "node:path";

const BIG_FOUR = ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"];
const weeksDir = path.join(process.cwd(), "data", "season-2025-26", "weeks");

if (!fs.existsSync(weeksDir)) {
  console.error("Weeks directory not found:", weeksDir);
  process.exit(1);
}

const files = fs
  .readdirSync(weeksDir)
  .filter((f) => /^week-\d+\.json$/.test(f))
  .sort((a, b) => {
    const nA = parseInt(a.replace(/\D/g, ""), 10);
    const nB = parseInt(b.replace(/\D/g, ""), 10);
    return nA - nB;
  });

let totalRemoved = 0;
let totalKept = 0;

for (const file of files) {
  const filePath = path.join(weeksDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const matches = data.matches || [];
  const before = matches.length;
  const filtered = matches.filter(
    (m) =>
      BIG_FOUR.includes(m.homeTeam) || BIG_FOUR.includes(m.awayTeam)
  );
  const after = filtered.length;
  data.matches = filtered;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  totalRemoved += before - after;
  totalKept += after;
  if (before !== after) {
    console.log(`${file}: ${before} → ${after} maç (${before - after} silindi)`);
  }
}

console.log(`\nToplam: ${totalKept} maç kaldı, ${totalRemoved} maç silindi.`);

#!/usr/bin/env node
/**
 * Farklı sezon maçlarını ve ilişkili incident'leri siler.
 * Varsayılan: Sadece "Süper Lig 2025-26" dışındaki maçları siler.
 *
 * Kullanım: node scripts/remove-old-season-matches.mjs
 * Korumalı: Önce --dry-run ile listele, sonra silmek için --execute
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const CURRENT_LEAGUE = "Süper Lig 2025-26";

async function main() {
  const execute = process.argv.includes("--execute");

  const { rows: oldMatches } = await pool.query(
    `SELECT m.id, m."homeTeam", m."awayTeam", m.week, m.league, m.date
     FROM "Match" m
     WHERE m.league != $1
     ORDER BY m.date DESC`,
    [CURRENT_LEAGUE]
  );

  if (oldMatches.length === 0) {
    console.log(`Tüm maçlar ${CURRENT_LEAGUE} sezonunda. Silinecek maç yok.`);
    return;
  }

  console.log(`\n${CURRENT_LEAGUE} dışında ${oldMatches.length} maç bulundu:\n`);
  for (const m of oldMatches) {
    const dateStr = new Date(m.date).toISOString().slice(0, 10);
    console.log(`  - ${m.homeTeam} vs ${m.awayTeam} (Hafta ${m.week}, ${m.league}, ${dateStr}) [${m.id}]`);
  }

  if (!execute) {
    console.log(`\nDry-run modu. Silmek için: node scripts/remove-old-season-matches.mjs --execute`);
    return;
  }

  const matchIds = oldMatches.map((m) => m.id);
  for (const id of matchIds) {
    await pool.query('DELETE FROM "Comment" WHERE "matchId" = $1', [id]);
    await pool.query('DELETE FROM "Incident" WHERE "matchId" = $1', [id]);
    await pool.query('DELETE FROM "CrawledContent" WHERE "matchId" = $1', [id]);
    await pool.query('DELETE FROM "Match" WHERE "id" = $1', [id]);
  }
  console.log(`\n${matchIds.length} maç ve ilişkili veriler silindi.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

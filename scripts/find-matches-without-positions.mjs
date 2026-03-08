#!/usr/bin/env node
/**
 * Hiç pozisyon (incident) olmayan maçları listeler.
 * Kullanım: node scripts/find-matches-without-positions.mjs
 */
import dotenv from "dotenv";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const res = await pool.query(
    `
    SELECT m."id", m."homeTeam", m."awayTeam", m."league", m."week", m."date"
    FROM "Match" m
    LEFT JOIN "Incident" i ON i."matchId" = m."id"
    WHERE i."id" IS NULL
    ORDER BY m."date" DESC, m."week" ASC
    `
  );

  const matches = res.rows;
  console.log(`\n📋 Pozisyon olmayan maç sayısı: ${matches.length}\n`);

  if (matches.length === 0) {
    console.log("Tüm maçlarda en az bir pozisyon var.");
    return;
  }

  for (const m of matches) {
    const dateStr = m.date instanceof Date ? m.date.toISOString().slice(0, 10) : m.date;
    console.log(`  • Hafta ${m.week} | ${m.homeTeam} - ${m.awayTeam} | ${dateStr} | ${m.league}`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

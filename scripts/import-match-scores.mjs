#!/usr/bin/env node
/**
 * match-scores.json'dan tüm maçları okur: yoksa oluşturur, skorları günceller.
 *
 * Kullanım: node scripts/import-match-scores.mjs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const dataPath = path.join(process.cwd(), "data", "season-2025-26", "match-scores.json");
const league = "Süper Lig 2025-26";

/** Süper Lig 2025-26 hafta 1 = 8 Ağu 2025, her hafta +7 gün */
function dateForWeek(week) {
  const d = new Date("2025-08-08");
  d.setDate(d.getDate() + (parseInt(week, 10) - 1) * 7);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const raw = fs.readFileSync(dataPath, "utf8");
  const matches = JSON.parse(raw);

  if (!Array.isArray(matches)) {
    console.error("match-scores.json bir dizi olmalı.");
    process.exitCode = 1;
    return;
  }

  console.log(`${matches.length} maç işlenecek.\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const m of matches) {
    const homeTeam = m.homeTeam;
    const awayTeam = m.awayTeam;
    const week = parseInt(m.week, 10);
    const homeScore = m.homeScore != null ? parseInt(m.homeScore, 10) : null;
    const awayScore = m.awayScore != null ? parseInt(m.awayScore, 10) : null;

    if (homeScore == null || awayScore == null) {
      skipped++;
      continue;
    }

    const matchRes = await pool.query(
      `SELECT "id" FROM "Match"
       WHERE "homeTeam" = $1 AND "awayTeam" = $2 AND "week" = $3
         AND ("league" = $4 OR "league" LIKE $5)
       LIMIT 1`,
      [homeTeam, awayTeam, week, league, "%Süper Lig%"]
    );

    if (!matchRes.rows[0]) {
      const id = "c" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
      const date = dateForWeek(week);
      await pool.query(
        `INSERT INTO "Match" ("id", "homeTeam", "awayTeam", "league", "week", "date", "homeScore", "awayScore", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6::date, $7, $8, NOW(), NOW())`,
        [id, homeTeam, awayTeam, league, week, date, homeScore, awayScore]
      );
      created++;
    } else {
      await pool.query(
        `UPDATE "Match" SET "homeScore" = $2, "awayScore" = $3, "updatedAt" = NOW() WHERE "id" = $1`,
        [matchRes.rows[0].id, homeScore, awayScore]
      );
      updated++;
    }
  }

  console.log(`\nTamamlandı: ${created} maç oluşturuldu, ${updated} maç güncellendi, ${skipped} skorsuz atlandı.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

#!/usr/bin/env node
/**
 * Beşiktaş-Galatasaray maçındaki Sane duplicate (minute=null) kaydını siler.
 * Kullanım: node scripts/cleanup-duplicate-incidents.mjs
 */
import dotenv from "dotenv";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  // Beşiktaş-Galatasaray hafta 25 maçını bul
  const matchRes = await pool.query(
    `
    SELECT "id" FROM "Match"
    WHERE "homeTeam" = 'Beşiktaş' AND "awayTeam" = 'Galatasaray'
      AND "week" = 25 AND "league" = 'Süper Lig 2025-26'
    LIMIT 1
    `
  );
  const matchId = matchRes.rows[0]?.id;
  if (!matchId) {
    console.log("Beşiktaş-Galatasaray maçı bulunamadı.");
    return;
  }

  // Sane ile ilgili MISSED_RED_CARD kayıtlarını listele
  const incidentsRes = await pool.query(
    `
    SELECT "id", "minute", "description"
    FROM "Incident"
    WHERE "matchId" = $1
      AND "type" = 'MISSED_RED_CARD'
      AND "description" LIKE '%Sane%'
    ORDER BY "minute" ASC NULLS LAST
    `,
    [matchId]
  );

  const incidents = incidentsRes.rows;
  if (incidents.length < 2) {
    console.log("Duplicate Sane kaydı bulunamadı.");
    return;
  }

  // minute=null olan (eski duplicate) kayıtları sil
  const toDeleteList = incidents.filter((i) => i.minute === null);
  if (toDeleteList.length === 0) {
    console.log("Silinecek duplicate (minute=null) kayıt yok.");
    return;
  }

  for (const toDelete of toDeleteList) {
    await pool.query(`DELETE FROM "Incident" WHERE "id" = $1`, [toDelete.id]);
    console.log(`Silindi: ${toDelete.id} (duplicate, minute=null)`);
  }

  // Osimhen gol (POSSIBLE_OFFSIDE_GOAL) duplicate kontrolü
  const osimhenRes = await pool.query(
    `
    SELECT "id", "minute" FROM "Incident"
    WHERE "matchId" = $1 AND "type" = 'POSSIBLE_OFFSIDE_GOAL'
      AND "description" LIKE '%Osimhen%'
    ORDER BY "minute" ASC NULLS LAST
    `,
    [matchId]
  );
  const osimhenIncidents = osimhenRes.rows;
  if (osimhenIncidents.length >= 2) {
    const dup = osimhenIncidents.find((i) => i.minute === null);
    if (dup) {
      await pool.query(`DELETE FROM "Incident" WHERE "id" = $1`, [dup.id]);
      console.log(`Silindi: ${dup.id} (Osimhen gol duplicate, minute=null)`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

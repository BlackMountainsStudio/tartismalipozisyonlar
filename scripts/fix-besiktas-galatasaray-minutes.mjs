#!/usr/bin/env node
/**
 * Beşiktaş-Galatasaray hafta 25 pozisyonlarının dakikalarını günceller.
 * Kullanım: node scripts/fix-besiktas-galatasaray-minutes.mjs
 */
import dotenv from "dotenv";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const UPDATES = [
  { descContains: "Baris Alper Yilmaz", minute: 20 },
  { descContains: "Sane'nin faulunde", minute: 35 },
  { descContains: "kaleciye faul yapti, baldirina basti", minute: 65 },
  { descContains: "Osimhen'in golunde", minute: 68 },
  { descContains: "Ofsayt calindiktan sonra Osimhen", minute: 72 },
];

async function main() {
  const matchRes = await pool.query(
    `SELECT "id" FROM "Match"
     WHERE "homeTeam" = 'Beşiktaş' AND "awayTeam" = 'Galatasaray'
       AND "week" = 25 AND "league" = 'Süper Lig 2025-26'
     LIMIT 1`
  );
  const matchId = matchRes.rows[0]?.id;
  if (!matchId) {
    console.log("Maç bulunamadı.");
    return;
  }

  for (const { descContains, minute } of UPDATES) {
    const res = await pool.query(
      `UPDATE "Incident"
       SET "minute" = $1
       WHERE "matchId" = $2
         AND "description" LIKE $3
       RETURNING "id", "type", "minute"`,
      [minute, matchId, `%${descContains}%`]
    );
    if (res.rowCount > 0) {
      console.log(`Güncellendi: ${descContains} → ${minute}'`);
    } else {
      console.log(`Bulunamadı: ${descContains}`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

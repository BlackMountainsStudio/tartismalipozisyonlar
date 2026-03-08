#!/usr/bin/env node
import dotenv from "dotenv";
import path from "node:path";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query(
    `SELECT i.id FROM "Incident" i
     JOIN "Match" m ON i."matchId" = m.id
     WHERE m."homeTeam" = 'Beşiktaş' AND m."awayTeam" = 'Galatasaray' AND m.week = 25
       AND i.type = 'POSSIBLE_OFFSIDE_GOAL' AND i.description LIKE '%Osimhen%'
     ORDER BY i.id`
  );
  if (res.rows.length < 2) {
    console.log("Duplicate yok.");
    return;
  }
  await pool.query(`DELETE FROM "Incident" WHERE id = $1`, [res.rows[1].id]);
  console.log("Silindi:", res.rows[1].id);
}

main().finally(() => pool.end());

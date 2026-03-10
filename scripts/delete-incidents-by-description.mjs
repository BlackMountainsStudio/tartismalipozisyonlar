#!/usr/bin/env node
/**
 * Açıklamaya göre incident siler.
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const descs = process.argv.slice(2).filter(Boolean);
  if (descs.length === 0) {
    descs.push(
      "Zeki Yavru'nun kolundan geri döndü",
      "Yunus Emre'nin Edin Dzeko'ya iki koluyla tutma",
      "Skriniar'ın Marius'a yaptığı müdahale"
    );
  }

  for (const desc of descs) {
    const { rows } = await pool.query(
      `SELECT i.id, i.minute, i.type, i.description
       FROM "Incident" i
       JOIN "Match" m ON i."matchId" = m.id
       WHERE m."homeTeam" = 'Fenerbahçe' AND m."awayTeam" = 'Samsunspor'
         AND m.week = 25 AND i.description LIKE $1`,
      [`%${desc}%`]
    );
    for (const r of rows) {
      await pool.query('DELETE FROM "Comment" WHERE "incidentId" = $1', [r.id]);
      await pool.query('DELETE FROM "ExpertOpinion" WHERE "incidentId" = $1', [r.id]);
      await pool.query('DELETE FROM "Incident" WHERE "id" = $1', [r.id]);
      console.log(`Silindi: ${r.minute}' ${r.type} - ${r.description.slice(0, 50)}...`);
    }
  }
  console.log("Tamamlandı.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

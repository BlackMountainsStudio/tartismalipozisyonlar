#!/usr/bin/env node
/**
 * JSON dosyalarındaki inFavorOf ve against bilgisini veritabanındaki mevcut incident'lere uygular.
 * Migration çalıştırıldıktan sonra bu script'i çalıştırın.
 *
 * Kullanım: node scripts/update-in-favor-of-from-json.mjs
 */

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const weeksDir = path.join(process.cwd(), "data", "season-2025-26", "weeks");

async function main() {
  const files = fs
    .readdirSync(weeksDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  let updated = 0;
  let errors = 0;

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(weeksDir, file), "utf8"));
    for (const match of data.matches || []) {
      if (!match.incidents?.length) continue;

      for (const inc of match.incidents) {
        if (!inc.inFavorOf && !inc.against) continue;

        try {
          const res = await pool.query(
            `
            UPDATE "Incident"
            SET "inFavorOf" = $1::text, "against" = $2::text, "updatedAt" = NOW()
            WHERE "matchId" = (SELECT id FROM "Match" WHERE "homeTeam" = $3 AND "awayTeam" = $4 AND "week" = $5 LIMIT 1)
              AND "minute" IS NOT DISTINCT FROM $6
              AND "type" = $7
            RETURNING id
            `,
            [
              inc.inFavorOf || null,
              inc.against || null,
              match.homeTeam,
              match.awayTeam,
              match.week,
              inc.minute ?? null,
              inc.type,
            ]
          );
          if (res.rowCount > 0) updated += res.rowCount;
        } catch (err) {
          console.error(`Hata ${match.homeTeam}-${match.awayTeam} ${inc.minute}' ${inc.type}:`, err.message);
          errors++;
        }
      }
    }
  }

  console.log(`\n✅ ${updated} pozisyon güncellendi.`);
  if (errors > 0) console.log(`⚠️ ${errors} hata oluştu.`);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });

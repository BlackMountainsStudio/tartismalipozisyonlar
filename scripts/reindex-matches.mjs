#!/usr/bin/env node
/**
 * Maçları siler ve sezon verilerinden yeniden import eder.
 * Kullanım: node scripts/reindex-matches.mjs
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

function loadWeekFiles() {
  return fs
    .readdirSync(weeksDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      data: JSON.parse(fs.readFileSync(path.join(weeksDir, file), "utf8")),
    }));
}

async function main() {
  console.log("Mevcut maçlar ve incidentler siliniyor...");

  await pool.query('DELETE FROM "Comment" WHERE "matchId" IS NOT NULL');
  await pool.query('DELETE FROM "ExpertOpinion"');
  await pool.query('DELETE FROM "CrawledContent"');
  await pool.query('DELETE FROM "Incident"');
  await pool.query('DELETE FROM "Match"');

  console.log("Silme tamamlandı. Yeniden import başlıyor...\n");

  const weeks = loadWeekFiles();
  let matchCount = 0;
  let incidentCount = 0;

  for (const { file, data } of weeks) {
    for (const match of data.matches) {
      const note = match.note ?? null;
      const insertResult = await pool.query(
        `
        INSERT INTO "Match" ("id", "homeTeam", "awayTeam", "league", "week", "date", "note", "createdAt", "updatedAt")
        VALUES (concat('season_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5::timestamp, $6, NOW(), NOW())
        RETURNING "id"
        `,
        [match.homeTeam, match.awayTeam, match.league, match.week, match.date, note]
      );
      const matchId = insertResult.rows[0].id;
      matchCount += 1;

      const incidents = Array.isArray(match.incidents) ? match.incidents : [];
      for (const incident of incidents) {
        await pool.query(
          `
          INSERT INTO "Incident" (
            "id", "matchId", "minute", "type", "description", "confidenceScore",
            "sources", "status", "videoUrl", "relatedVideos", "refereeComments",
            "newsArticles", "inFavorOf", "against", "createdAt", "updatedAt"
          )
          VALUES (
            concat('incident_', md5(random()::text || clock_timestamp()::text)),
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
          )
          `,
          [
            matchId,
            incident.minute ?? null,
            incident.type,
            incident.description,
            incident.confidenceScore ?? 0.75,
            JSON.stringify(incident.sources ?? []),
            incident.status ?? "APPROVED",
            incident.videoUrl ?? null,
            JSON.stringify(incident.relatedVideos ?? []),
            JSON.stringify(incident.refereeComments ?? []),
            JSON.stringify(incident.newsArticles ?? []),
            incident.inFavorOf ?? null,
            incident.against ?? null,
          ]
        );
        incidentCount += 1;
      }
    }
    console.log(`Imported ${file}`);
  }

  console.log(`\nTamamlandı: ${matchCount} maç, ${incidentCount} pozisyon import edildi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

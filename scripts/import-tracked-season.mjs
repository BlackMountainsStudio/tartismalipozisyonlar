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

async function upsertMatch(match) {
  const existingResult = await pool.query(
    `
      SELECT "id"
      FROM "Match"
      WHERE "homeTeam" = $1
        AND "awayTeam" = $2
        AND "week" = $3
        AND "league" = $4
        AND "date" = $5::timestamp
      LIMIT 1
    `,
    [match.homeTeam, match.awayTeam, match.week, match.league, match.date]
  );

  if (existingResult.rows[0]) {
    return existingResult.rows[0];
  }

  const insertResult = await pool.query(
    `
      INSERT INTO "Match" ("id", "homeTeam", "awayTeam", "league", "week", "date", "createdAt", "updatedAt")
      VALUES (concat('season_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5::timestamp, NOW(), NOW())
      RETURNING "id"
    `,
    [match.homeTeam, match.awayTeam, match.league, match.week, match.date]
  );

  return insertResult.rows[0];
}

async function upsertIncidents(matchId, incidents) {
  for (const incident of incidents) {
    const existing = await pool.query(
      `
        SELECT "id"
        FROM "Incident"
        WHERE "matchId" = $1
          AND "minute" IS NOT DISTINCT FROM $2
          AND "type" = $3
          AND "description" = $4
        LIMIT 1
      `,
      [matchId, incident.minute ?? null, incident.type, incident.description]
    );

    if (existing.rows[0]) {
      continue;
    }

    await pool.query(
      `
        INSERT INTO "Incident" (
          "id", "matchId", "minute", "type", "description", "confidenceScore",
          "sources", "status", "videoUrl", "relatedVideos", "refereeComments",
          "newsArticles", "createdAt", "updatedAt"
        )
        VALUES (
          concat('incident_', md5(random()::text || clock_timestamp()::text)),
          $1, $2, $3, $4, $5, $6, $7, NULL, '[]', '[]', '[]', NOW(), NOW()
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
      ]
    );
  }
}

async function main() {
  const weeks = loadWeekFiles();
  let matchCount = 0;
  let incidentCount = 0;

  for (const { file, data } of weeks) {
    for (const match of data.matches) {
      const savedMatch = await upsertMatch(match);
      matchCount += 1;

      const incidents = Array.isArray(match.incidents) ? match.incidents : [];
      await upsertIncidents(savedMatch.id, incidents);
      incidentCount += incidents.length;
    }
    console.log(`Imported ${file}`);
  }

  console.log(`Processed ${matchCount} matches and ${incidentCount} incidents.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

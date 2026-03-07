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
    const hasVideoUrl = Object.prototype.hasOwnProperty.call(incident, "videoUrl");
    const hasRelatedVideos = Object.prototype.hasOwnProperty.call(incident, "relatedVideos");
    const hasRefereeComments = Object.prototype.hasOwnProperty.call(incident, "refereeComments");
    const hasNewsArticles = Object.prototype.hasOwnProperty.call(incident, "newsArticles");

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
      await pool.query(
        `
          UPDATE "Incident"
          SET
            "sources" = $2,
            "status" = $3,
            "videoUrl" = CASE WHEN $4::boolean THEN $5 ELSE "videoUrl" END,
            "relatedVideos" = CASE WHEN $6::boolean THEN $7 ELSE "relatedVideos" END,
            "refereeComments" = CASE WHEN $8::boolean THEN $9 ELSE "refereeComments" END,
            "newsArticles" = CASE WHEN $10::boolean THEN $11 ELSE "newsArticles" END,
            "updatedAt" = NOW()
          WHERE "id" = $1
        `,
        [
          existing.rows[0].id,
          JSON.stringify(incident.sources ?? []),
          incident.status ?? "APPROVED",
          hasVideoUrl,
          incident.videoUrl ?? null,
          hasRelatedVideos,
          JSON.stringify(incident.relatedVideos ?? []),
          hasRefereeComments,
          JSON.stringify(incident.refereeComments ?? []),
          hasNewsArticles,
          JSON.stringify(incident.newsArticles ?? []),
        ]
      );
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
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
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

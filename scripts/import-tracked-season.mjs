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
    .filter((file) => /^week-\d+\.json$/.test(file))
    .sort()
    .map((file) => ({
      file,
      data: JSON.parse(fs.readFileSync(path.join(weeksDir, file), "utf8")),
    }));
}

async function upsertMatch(match) {
  const note = match.note ?? null;
  const existingResult = await pool.query(
    `
      SELECT "id"
      FROM "Match"
      WHERE "homeTeam" = $1
        AND "awayTeam" = $2
        AND "week" = $3
        AND "league" = $4
      LIMIT 1
    `,
    [match.homeTeam, match.awayTeam, match.week, match.league]
  );

  if (existingResult.rows[0]) {
    await pool.query(
      `
      UPDATE "Match"
      SET "date" = $2::timestamp, "note" = $3, "updatedAt" = NOW()
      WHERE "id" = $1
    `,
      [existingResult.rows[0].id, match.date, note]
    );
    return existingResult.rows[0];
  }

  const insertResult = await pool.query(
    `
      INSERT INTO "Match" ("id", "homeTeam", "awayTeam", "league", "week", "date", "note", "createdAt", "updatedAt")
      VALUES (concat('season_', md5(random()::text || clock_timestamp()::text)), $1, $2, $3, $4, $5::timestamp, $6, NOW(), NOW())
      RETURNING "id"
    `,
    [match.homeTeam, match.awayTeam, match.league, match.week, match.date, note]
  );

  return insertResult.rows[0];
}

async function upsertIncidents(matchId, incidents) {
  for (const incident of incidents) {
    const hasVideoUrl = Object.prototype.hasOwnProperty.call(incident, "videoUrl");
    const hasRelatedVideos = Object.prototype.hasOwnProperty.call(incident, "relatedVideos");
    const hasRefereeComments = Object.prototype.hasOwnProperty.call(incident, "refereeComments");
    const hasNewsArticles = Object.prototype.hasOwnProperty.call(incident, "newsArticles");
    const hasInFavorOf = Object.prototype.hasOwnProperty.call(incident, "inFavorOf");
    const hasAgainst = Object.prototype.hasOwnProperty.call(incident, "against");

    // Önce aynı maç+dakika+tür+açıklama ile ara; yoksa sadece maç+dakika+tür ile ara (mevcut kaydı güncellemek için)
    let existing = await pool.query(
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

    if (!existing.rows[0]) {
      existing = await pool.query(
        `
          SELECT "id"
          FROM "Incident"
          WHERE "matchId" = $1
            AND "minute" IS NOT DISTINCT FROM $2
            AND "type" = $3
          LIMIT 1
        `,
        [matchId, incident.minute ?? null, incident.type]
      );
    }

    // Dakika değiştiğinde (örn. null -> 35) mevcut kaydı bul: tür + açıklama ile eşleştir
    if (!existing.rows[0]) {
      existing = await pool.query(
        `
          SELECT "id"
          FROM "Incident"
          WHERE "matchId" = $1
            AND "type" = $2
            AND "description" = $3
          LIMIT 1
        `,
        [matchId, incident.type, incident.description]
      );
    }

    if (existing.rows[0]) {
      await pool.query(
        `
          UPDATE "Incident"
          SET
            "minute" = $2,
            "description" = $3,
            "sources" = $4,
            "status" = $5,
            "videoUrl" = CASE WHEN $6::boolean THEN $7 ELSE "videoUrl" END,
            "relatedVideos" = CASE WHEN $8::boolean THEN $9 ELSE "relatedVideos" END,
            "refereeComments" = CASE WHEN $10::boolean THEN $11 ELSE "refereeComments" END,
            "newsArticles" = CASE WHEN $12::boolean THEN $13 ELSE "newsArticles" END,
            "inFavorOf" = CASE WHEN $14::boolean THEN $15 ELSE "inFavorOf" END,
            "against" = CASE WHEN $16::boolean THEN $17 ELSE "against" END,
            "updatedAt" = NOW()
          WHERE "id" = $1
        `,
        [
          existing.rows[0].id,
          incident.minute ?? null,
          incident.description,
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
          hasInFavorOf,
          incident.inFavorOf ?? null,
          hasAgainst,
          incident.against ?? null,
        ]
      );
      continue;
    }

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

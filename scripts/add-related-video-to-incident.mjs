#!/usr/bin/env node
/**
 * Bir pozisyona (incident) ilgili video ekler.
 * Kullanım: node scripts/add-related-video-to-incident.mjs <incidentId> <videoUrl>
 * Örnek:   node scripts/add-related-video-to-incident.mjs incident_617ee9530520c8a5acbbf661c24a186a "https://www.youtube.com/shorts/oJA-vzUQ9OM"
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

function parseRelatedVideos(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) =>
      typeof item === "string" ? { url: item, title: "Video" } : { url: item.url || item, title: item.title || "Video" }
    );
  } catch {
    return [];
  }
}

async function main() {
  const incidentId = process.argv[2];
  const videoUrl = process.argv[3];
  if (!incidentId || !videoUrl) {
    console.error("Kullanım: node scripts/add-related-video-to-incident.mjs <incidentId> <videoUrl>");
    process.exitCode = 1;
    return;
  }

  const normalizedUrl = videoUrl.trim();
  if (!normalizedUrl.startsWith("http")) {
    console.error("Geçerli bir video URL'si girin.");
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();
  try {
    const getRes = await client.query(
      `SELECT "id", "relatedVideos", "videoUrl" FROM "Incident" WHERE "id" = $1`,
      [incidentId]
    );
    if (getRes.rowCount === 0) {
      console.error(`Pozisyon bulunamadı: ${incidentId}`);
      process.exitCode = 1;
      return;
    }

    const row = getRes.rows[0];
    const related = parseRelatedVideos(row.relatedVideos);
    const exists = related.some((r) => (r.url || r).toString().trim() === normalizedUrl);
    if (exists) {
      console.log("Bu video zaten bu pozisyonda kayıtlı.");
      return;
    }

    const title = normalizedUrl.includes("youtube.com/shorts")
      ? "YouTube Shorts"
      : normalizedUrl.includes("youtube.com")
        ? "YouTube"
        : "Video";
    const updatedRelated = [...related, { url: normalizedUrl, title }];
    const newRelatedJson = JSON.stringify(updatedRelated);

    let updateData = { relatedVideos: newRelatedJson };
    const hasVideoUrl = row.videoUrl && row.videoUrl.trim() !== "";
    if (!hasVideoUrl) {
      updateData.videoUrl = normalizedUrl;
    }

    await client.query(
      `UPDATE "Incident"
       SET "relatedVideos" = $2, "videoUrl" = COALESCE($3, "videoUrl"), "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING "id", "videoUrl", "relatedVideos"`,
      [incidentId, newRelatedJson, updateData.videoUrl || null]
    );

    console.log("Video eklendi.");
    console.log("  Ana video:", updateData.videoUrl ? normalizedUrl : "(mevcut ana video korundu)");
    console.log("  İlgili videolar:", updatedRelated.length, "adet");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

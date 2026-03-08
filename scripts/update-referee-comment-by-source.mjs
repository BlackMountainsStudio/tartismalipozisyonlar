#!/usr/bin/env node
/**
 * Belirli bir sourceUrl'e sahip refereeComment'ı günceller.
 * Kullanım: node scripts/update-referee-comment-by-source.mjs <incidentId> <sourceUrl> "<author>" "<text>"
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function parseRefereeComments(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  const incidentId = process.argv[2];
  const sourceUrl = process.argv[3];
  const author = process.argv[4];
  const text = process.argv[5];
  if (!incidentId || !sourceUrl || !author || !text) {
    console.error('Kullanım: node scripts/update-referee-comment-by-source.mjs <incidentId> <sourceUrl> "<author>" "<text>"');
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();
  try {
    const getRes = await client.query(
      `SELECT "id", "refereeComments" FROM "Incident" WHERE "id" = $1`,
      [incidentId]
    );
    if (getRes.rowCount === 0) {
      console.error(`Pozisyon bulunamadı: ${incidentId}`);
      process.exitCode = 1;
      return;
    }

    const comments = parseRefereeComments(getRes.rows[0].refereeComments);
    const normalizedSource = sourceUrl.trim();
    const idx = comments.findIndex((c) => (c.sourceUrl || "").trim() === normalizedSource);
    if (idx === -1) {
      console.error("Bu kaynağa sahip yorum bulunamadı.");
      process.exitCode = 1;
      return;
    }

    comments[idx] = { ...comments[idx], author: author.trim(), text: text.trim(), sourceUrl: normalizedSource };
    await client.query(
      `UPDATE "Incident" SET "refereeComments" = $2, "updatedAt" = NOW() WHERE "id" = $1`,
      [incidentId, JSON.stringify(comments)]
    );
    console.log("Yorum güncellendi.");
    console.log("  Yazar:", comments[idx].author);
    console.log("  Metin:", comments[idx].text);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

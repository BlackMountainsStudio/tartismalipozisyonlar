#!/usr/bin/env node
/**
 * Bir pozisyona (incident) Ahmet Çakar tarzı yorum ekler (refereeComments).
 * Kullanım: node scripts/add-referee-comment-to-incident.mjs <incidentId> "<author>" "<text>" [sourceUrl]
 * Örnek:   node scripts/add-referee-comment-to-incident.mjs incident_xxx "Ahmet Çakar" "Kırmızı kart olmalıydı." "https://..."
 */
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

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
  const author = process.argv[3];
  const text = process.argv[4];
  const sourceUrl = process.argv[5] || null;
  if (!incidentId || !author || !text) {
    console.error('Kullanım: node scripts/add-referee-comment-to-incident.mjs <incidentId> "<author>" "<text>" [sourceUrl]');
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

    const existing = parseRefereeComments(getRes.rows[0].refereeComments);
    const newComment = { author: author.trim(), text: text.trim(), ...(sourceUrl && sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}) };
    const updated = [...existing, newComment];
    await client.query(
      `UPDATE "Incident"
       SET "refereeComments" = $2, "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING "id"`,
      [incidentId, JSON.stringify(updated)]
    );
    console.log("Yorum eklendi (Hakem ve Uzman Yorumları bölümünde görünecek).");
    console.log("  Yazar:", newComment.author);
    console.log("  Metin:", newComment.text.slice(0, 60) + (newComment.text.length > 60 ? "…" : ""));
    if (newComment.sourceUrl) console.log("  Kaynak:", newComment.sourceUrl);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

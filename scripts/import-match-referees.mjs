#!/usr/bin/env node
/**
 * match-referees.json'dan hakem verilerini okur, Referee kayıtlarını oluşturur/günceller,
 * Match kayıtlarına refereeId ve varRefereeId atar.
 *
 * Kullanım: node scripts/import-match-referees.mjs
 *
 * Önce maçların import edilmiş olması gerekir (reindex-matches veya import-tracked-season).
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const dataPath = path.join(process.cwd(), "data", "season-2025-26", "match-referees.json");
const league = "Süper Lig 2025-26";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTeamName(name) {
  const map = {
    "Gaziantep FK": "Gaziantep",
    "GFK": "Gaziantep",
    "Ç. Rizespor": "Çaykur Rizespor",
    "RİZE": "Çaykur Rizespor",
    "Karagümrük": "Fatih Karagümrük",
    "KGM": "Fatih Karagümrük",
    "İBFK": "İstanbul Başakşehir",
    "GÖZ": "Göztepe",
    "GS": "Galatasaray",
    "FB": "Fenerbahçe",
    "SAM": "Samsunspor",
    "GB": "Gençlerbirliği",
    "KOC": "Kocaelispor",
    "KON": "Konyaspor",
    "KPAŞA": "Kasımpaşa",
    "ALA": "Alanyaspor",
    "ANT": "Antalyaspor",
  };
  return map[name] ?? name;
}

async function main() {
  const raw = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(raw);

  const refereeList = data.referees ?? [];
  const matchList = data.matches ?? [];

  console.log(`${refereeList.length} hakem, ${matchList.length} maç-hakem eşleştirmesi işlenecek.\n`);

  const refBySlug = new Map();
  for (const r of refereeList) {
    const slug = r.slug ?? slugify(r.name);
    refBySlug.set(slug, { name: r.name, slug, role: r.role ?? "REFEREE" });
  }

  for (const [slug, ref] of refBySlug) {
    const res = await pool.query(
      `SELECT "id" FROM "Referee" WHERE "slug" = $1`,
      [slug]
    );
    if (res.rows[0]) {
      continue;
    }
    await pool.query(
      `INSERT INTO "Referee" ("id", "name", "slug", "role", "createdAt", "updatedAt")
       VALUES (concat('ref_', md5($1 || clock_timestamp()::text)), $2, $3, $4, NOW(), NOW())`,
      [slug, ref.name, slug, ref.role]
    );
    console.log(`Hakem eklendi: ${ref.name} (${slug})`);
  }

  let updated = 0;
  let notFound = 0;

  for (const m of matchList) {
    const homeTeam = normalizeTeamName(m.homeTeam) || m.homeTeam;
    const awayTeam = normalizeTeamName(m.awayTeam) || m.awayTeam;
    const week = parseInt(m.week, 10);

    const matchRes = await pool.query(
      `SELECT "id" FROM "Match"
       WHERE "homeTeam" = $1 AND "awayTeam" = $2 AND "week" = $3
         AND ("league" = $4 OR "league" LIKE $5)
       LIMIT 1`,
      [homeTeam, awayTeam, week, league, "%Süper Lig%"]
    );

    if (!matchRes.rows[0]) {
      notFound++;
      console.log(`Maç bulunamadı: ${homeTeam} vs ${awayTeam} (Hafta ${week})`);
      continue;
    }

    const matchId = matchRes.rows[0].id;
    let refereeId = null;
    let varRefereeId = null;

    if (m.referee) {
      const refSlug = slugify(m.referee);
      const refRow = await pool.query(`SELECT "id" FROM "Referee" WHERE "slug" = $1`, [refSlug]);
      if (refRow.rows[0]) {
        refereeId = refRow.rows[0].id;
      } else {
        const byName = [...refBySlug.values()].find(
          (r) => r.name === m.referee || slugify(r.name) === refSlug
        );
        if (byName) {
          const r2 = await pool.query(`SELECT "id" FROM "Referee" WHERE "slug" = $1`, [byName.slug]);
          if (r2.rows[0]) refereeId = r2.rows[0].id;
        }
      }
    }

    if (m.varReferee) {
      const varSlug = slugify(m.varReferee);
      const varRow = await pool.query(`SELECT "id" FROM "Referee" WHERE "slug" = $1`, [varSlug]);
      if (varRow.rows[0]) varRefereeId = varRow.rows[0].id;
    }

    await pool.query(
      `UPDATE "Match" SET "refereeId" = $2, "varRefereeId" = $3, "updatedAt" = NOW() WHERE "id" = $1`,
      [matchId, refereeId, varRefereeId]
    );
    updated++;
  }

  console.log(`\nTamamlandı: ${updated} maç güncellendi, ${notFound} maç bulunamadı.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

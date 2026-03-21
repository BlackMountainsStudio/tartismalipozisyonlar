import { readFileSync } from "fs";
import { resolve } from "path";

const BASE = "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin-secret";
const LEAGUE = "Süper Lig 2025-26";

const headers = {
  "Content-Type": "application/json",
  "x-admin-token": ADMIN_SECRET,
};

function parseTffDate(dateStr) {
  const [d, m, y] = dateStr.split(".");
  return new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T18:00:00Z`);
}

function parseScore(score) {
  const m = score.match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return null;
  return { home: parseInt(m[1]), away: parseInt(m[2]) };
}

async function main() {
  const filePath = resolve("data/tff-results.json");
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  const matches = data.matches;

  console.log(`Loaded ${matches.length} matches from TFF data`);

  // First, delete existing test match if any
  const existingRes = await fetch(`${BASE}/api/matches?league=${encodeURIComponent("Süper Lig")}`, { headers });
  const existing = await existingRes.json();
  for (const m of existing) {
    try {
      await fetch(`${BASE}/api/matches/${m.id}`, { method: "DELETE", headers });
      console.log(`Deleted old test match: ${m.homeTeam} vs ${m.awayTeam}`);
    } catch {}
  }

  // Also check existing matches in our target league
  const existingSeasonRes = await fetch(`${BASE}/api/matches?league=${encodeURIComponent(LEAGUE)}`, { headers });
  const existingSeason = await existingSeasonRes.json();
  
  const existingMap = new Map();
  for (const m of existingSeason) {
    const key = `${m.week}-${m.homeTeam}-${m.awayTeam}`;
    existingMap.set(key, m);
  }
  console.log(`Found ${existingSeason.length} existing matches in ${LEAGUE}`);

  let created = 0, updated = 0, skipped = 0;

  for (const match of matches) {
    const score = parseScore(match.score);
    if (!score) {
      console.log(`  Skipping unplayed: Week ${match.week} ${match.home} vs ${match.away}`);
      skipped++;
      continue;
    }

    const key = `${match.week}-${match.home}-${match.away}`;
    const existingMatch = existingMap.get(key);

    if (existingMatch) {
      // Update score if different
      if (existingMatch.homeScore !== score.home || existingMatch.awayScore !== score.away) {
        const patchRes = await fetch(`${BASE}/api/matches/${existingMatch.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ homeScore: score.home, awayScore: score.away }),
        });
        if (patchRes.ok) {
          console.log(`  Updated: Week ${match.week} ${match.home} ${score.home}-${score.away} ${match.away}`);
          updated++;
        } else {
          console.error(`  Failed to update: ${await patchRes.text()}`);
        }
      } else {
        skipped++;
      }
    } else {
      // Create new match
      const body = {
        homeTeam: match.home,
        awayTeam: match.away,
        league: LEAGUE,
        week: match.week,
        date: parseTffDate(match.date).toISOString(),
      };

      const createRes = await fetch(`${BASE}/api/matches`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (createRes.ok) {
        const newMatch = await createRes.json();
        // PATCH to add scores (POST doesn't accept homeScore/awayScore)
        await fetch(`${BASE}/api/matches/${newMatch.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ homeScore: score.home, awayScore: score.away }),
        });
        created++;
        if (created % 10 === 0) console.log(`  Progress: ${created} created...`);
      } else {
        const err = await createRes.text();
        console.error(`  Failed to create Week ${match.week} ${match.home} vs ${match.away}: ${err}`);
      }
    }
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} skipped`);

  // Verify
  const finalRes = await fetch(`${BASE}/api/matches?league=${encodeURIComponent(LEAGUE)}`, { headers });
  const finalMatches = await finalRes.json();
  console.log(`Total matches in DB for ${LEAGUE}: ${finalMatches.length}`);
  
  const withScore = finalMatches.filter(m => m.homeScore !== null && m.awayScore !== null);
  console.log(`Matches with scores: ${withScore.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

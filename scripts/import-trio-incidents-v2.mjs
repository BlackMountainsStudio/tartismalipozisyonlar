/**
 * Import ALL controversial positions from beIN SPORTS Trio video-liste pages.
 * Uses real position titles scraped from beinsports.com.tr.
 */
import { readFileSync } from "fs";

const BASE = "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin-secret";
const headers = { "Content-Type": "application/json", "x-admin-token": ADMIN_SECRET };

// Map beIN position page matches → DB match (week, home, away)
const MATCH_MAP = {
  "Fenerbahçe - Trabzonspor": { week: 5, home: "Fenerbahçe", away: "Trabzonspor", videoId: "mz5UlADX0P8" },
  "Galatasaray - Beşiktaş": { week: 8, home: "Galatasaray", away: "Beşiktaş", videoId: "dweZe2IPp1o" },
  "Beşiktaş - Fenerbahçe": { week: 11, home: "Beşiktaş", away: "Fenerbahçe", videoId: "3qiXLLcEQn8" },
  "Fenerbahçe - Galatasaray": { week: 14, home: "Fenerbahçe", away: "Galatasaray", videoId: "M7Nxd6hP_2E" },
  "Trabzonspor - Fenerbahçe": { week: 22, home: "Trabzonspor", away: "Fenerbahçe", videoId: "wlGMomPX9s0" },
  "Beşiktaş - Galatasaray": { week: 25, home: "Beşiktaş", away: "Galatasaray", videoId: "8w7B7yczbHk" },
  "Galatasaray - Trabzonspor": { week: 11, home: "Galatasaray", away: "Trabzonspor", videoId: "KjLuzSSa8o4" },
  "Trabzonspor - Beşiktaş": { week: 16, home: "Trabzonspor", away: "Beşiktaş", videoId: "cmW9I6UQ-HU" },
  "Fenerbahçe - Konyaspor": { week: 16, home: "Fenerbahçe", away: "KONYASPOR", videoId: "hQugMWMdriw" },
  "Galatasaray - Samsunspor": { week: 15, home: "Galatasaray", away: "SAMSUNSPOR", videoId: "mcnubJSizkw" },
  "Galatasaray - Kasımpaşa": { week: 17, home: "Galatasaray", away: "KASIMPAŞA", videoId: "fnBtEANbByk" },
  "Fenerbahçe - Samsunspor": { week: 25, home: "Fenerbahçe", away: "SAMSUNSPOR", videoId: "K6H41Qjd_9o" },
  "Konyaspor - Galatasaray": { week: 23, home: "KONYASPOR", away: "Galatasaray", videoId: "SfPHemPPcFE" },
  "Galatasaray - Alanyaspor": { week: 24, home: "Galatasaray", away: "ALANYASPOR", videoId: "ohgQ3SIhUVE" },
  "Trabzonspor - Kasımpaşa": { week: 19, home: "Trabzonspor", away: "KASIMPAŞA", videoId: "YwlgsBBuVII" },
};

// Also add the Week 1 Gaziantep-GS match from the summary log
const EXTRA_MATCHES = [
  {
    matchKey: "Gaziantep FK - Galatasaray",
    dbMatch: { week: 1, home: "GAZİANTEP", away: "Galatasaray", videoId: "kCRn1UfxAkg" },
    positions: [
      "Torreira'nın Lungoyi'ye müdahalesinde devam kararı doğru mu?",
      "Galatasaray'ın kazandığı ilk penaltıda karar doğru mu?",
      "Gaziantep FK'nin penaltı beklediği pozisyonda karar ne olmalıydı?",
      "Ceza sahasında Gaziantep FK futbolcusu Bacuna elle oynuyor mu?",
      "Arda Kızıldağ, ceza sahasında Eren'in müdahalesiyle yerde kaldı. Devam kararı doğru mu?",
      "Galatasaray'ın kazandığı ikinci penaltı doğru mu?",
      "Gaziantep FK kalecisi Burak'ın gördüğü kırmızı kart doğru mu?",
      "Zaniolo ceza sahasında yerde kaldı. Devam kararı doğru mu?",
    ]
  }
];

function classifyPosition(title) {
  const t = title.toLowerCase();
  if (t.includes("kırmızı kart")) return "RED_CARD";
  if (t.includes("iptal edilen gol") || t.includes("sayılmayan gol") || t.includes("ofsayt") || t.includes("gol iptal")) return "GOAL_DISALLOWED";
  if (t.includes("penaltı") && (t.includes("verilen") || t.includes("kazandığı") || t.includes("doğru mu"))) return "PENALTY";
  if (t.includes("penaltı") && (t.includes("beklediği") || t.includes("gerekir"))) return "POSSIBLE_PENALTY";
  if (t.includes("elle oyna") || t.includes("eline çarp") || t.includes("el ile")) return "HANDBALL";
  if (t.includes("sarı kart")) return "YELLOW_CARD";
  if (t.includes("devam kararı") && t.includes("ceza sahas")) return "POSSIBLE_PENALTY";
  if (t.includes("faul") || t.includes("müdahale")) return "FOUL";
  if (t.includes("gerginlik") || t.includes("itiraz") || t.includes("kargaşa")) return "VAR_CONTROVERSY";
  if (t.includes("kart") && t.includes("gerekir")) return "MISSED_YELLOW";
  return "FOUL";
}

function inferTeams(title, home, away) {
  const t = title.toLowerCase();
  const homeLC = home.toLowerCase();
  const awayLC = away.toLowerCase();

  // Check if title mentions a team
  const mentionsHome = t.includes(homeLC) || t.includes(homeLC.replace("ş", "s"));
  const mentionsAway = t.includes(awayLC) || t.includes(awayLC.replace("ş", "s"));

  if (t.includes("lehine")) {
    if (mentionsHome) return { inFavorOf: home, against: away };
    if (mentionsAway) return { inFavorOf: away, against: home };
  }

  // Penalty/foul for a team
  if (t.includes("penaltı") || t.includes("ceza sahası")) {
    if (mentionsHome && !mentionsAway) return { inFavorOf: home, against: away };
    if (mentionsAway && !mentionsHome) return { inFavorOf: away, against: home };
  }

  // Red/yellow card
  if (t.includes("kırmızı kart") || t.includes("sarı kart")) {
    if (mentionsHome && !mentionsAway) return { inFavorOf: away, against: home };
    if (mentionsAway && !mentionsHome) return { inFavorOf: home, against: away };
  }

  return { inFavorOf: null, against: null };
}

function generateMinute(index, total) {
  const segments = [5, 12, 18, 25, 30, 35, 40, 45, 52, 58, 65, 72, 78, 85];
  if (index < segments.length) return segments[index];
  return 45 + (index * 5);
}

async function main() {
  // Load scraped beIN positions
  const beinData = JSON.parse(readFileSync("bein_positions.json", "utf-8"));
  
  // Load all matches from DB
  const matchesRes = await fetch(`${BASE}/api/matches?league=${encodeURIComponent("Süper Lig 2025-26")}`, { headers });
  const allMatches = await matchesRes.json();
  console.log(`DB matches: ${allMatches.length}`);

  let totalCreated = 0;

  // Process beIN positions data
  for (const entry of beinData) {
    const mapping = MATCH_MAP[entry.match];
    if (!mapping) {
      console.log(`  Skipping unmapped match: ${entry.match}`);
      continue;
    }

    const dbMatch = allMatches.find(m => m.week === mapping.week && m.homeTeam === mapping.home && m.awayTeam === mapping.away);
    if (!dbMatch) {
      console.log(`  DB match not found: Week ${mapping.week} ${mapping.home} vs ${mapping.away}`);
      continue;
    }

    const videoUrl = `https://youtu.be/${mapping.videoId}`;
    let matchCreated = 0;

    for (let i = 0; i < entry.positions.length; i++) {
      const pos = entry.positions[i];
      const type = classifyPosition(pos.title);
      const teams = inferTeams(pos.title, mapping.home, mapping.away);
      const minute = generateMinute(i, entry.positions.length);
      const confidence = type.includes("RED") || type.includes("GOAL") ? 0.9 : 
                         type.includes("PENALTY") ? 0.85 : 
                         type.includes("HANDBALL") ? 0.8 : 0.75;

      const body = {
        matchId: dbMatch.id,
        minute,
        type,
        description: pos.title,
        confidenceScore: confidence,
        sources: [videoUrl],
      };

      const res = await fetch(`${BASE}/api/incidents`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) { console.error(`  Failed: ${pos.title}`); continue; }

      const inc = await res.json();
      await fetch(`${BASE}/api/incidents/${inc.id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({
          status: "APPROVED",
          videoUrl,
          inFavorOf: teams.inFavorOf,
          against: teams.against,
        }),
      });
      matchCreated++;
    }
    totalCreated += matchCreated;
    console.log(`  Week ${mapping.week}: ${mapping.home} vs ${mapping.away} → ${matchCreated} incidents`);
  }

  // Process extra matches (Gaziantep-GS etc.)
  for (const extra of EXTRA_MATCHES) {
    const dbMatch = allMatches.find(m => m.week === extra.dbMatch.week && m.homeTeam === extra.dbMatch.home && m.awayTeam === extra.dbMatch.away);
    if (!dbMatch) { console.log(`  Extra match not found: ${extra.matchKey}`); continue; }

    const videoUrl = `https://youtu.be/${extra.dbMatch.videoId}`;
    let matchCreated = 0;

    for (let i = 0; i < extra.positions.length; i++) {
      const title = extra.positions[i];
      const type = classifyPosition(title);
      const teams = inferTeams(title, extra.dbMatch.home, extra.dbMatch.away);
      const minute = generateMinute(i, extra.positions.length);
      const confidence = type.includes("RED") || type.includes("GOAL") ? 0.9 : 
                         type.includes("PENALTY") ? 0.85 : 0.75;

      const body = { matchId: dbMatch.id, minute, type, description: title, confidenceScore: confidence, sources: [videoUrl] };
      const res = await fetch(`${BASE}/api/incidents`, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) continue;
      const inc = await res.json();
      await fetch(`${BASE}/api/incidents/${inc.id}`, {
        method: "PATCH", headers,
        body: JSON.stringify({ status: "APPROVED", videoUrl, inFavorOf: teams.inFavorOf, against: teams.against }),
      });
      matchCreated++;
    }
    totalCreated += matchCreated;
    console.log(`  Week ${extra.dbMatch.week}: ${extra.dbMatch.home} vs ${extra.dbMatch.away} → ${matchCreated} incidents`);
  }

  console.log(`\nTotal created: ${totalCreated}`);
  const verifyRes = await fetch(`${BASE}/api/incidents`, { headers });
  console.log(`DB total incidents: ${(await verifyRes.json()).length}`);
}

main().catch(e => { console.error(e); process.exit(1); });

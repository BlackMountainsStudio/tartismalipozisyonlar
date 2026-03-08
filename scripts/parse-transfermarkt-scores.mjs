#!/usr/bin/env node
/**
 * Parse Transfermarkt Super Lig match pages and extract scores.
 * Team mapping: Gaziantep FK->Gaziantep, Başakşehir->İstanbul Başakşehir,
 * Karagümrük->Fatih Karagümrük, Ç. Rizespor->Çaykur Rizespor
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEAM_MAP = {
  "Gaziantep FK": "Gaziantep",
  "Başakşehir": "İstanbul Başakşehir",
  "Karagümrük": "Fatih Karagümrük",
  "Ç. Rizespor": "Çaykur Rizespor",
};

function mapTeam(name) {
  const trimmed = (name || "").trim();
  return TEAM_MAP[trimmed] ?? trimmed;
}

// Standard format: | (N.) [HomeTeam](url) | (N.) [ABBR](url) | [X:Y](url) | [AwayTeam](url)(N.) |
const STANDARD_REGEX =
  /\|\s*\([0-9]+\.\)\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*\([0-9]+\.\)\s*\[[^\]]+\]\([^)]+\)\s*\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*\[([^\]]+)\]/g;

// Alternate format (week 11): | (N.) [HomeTeam](...) | ... | [X:Y](/spielbericht/...) | [AwayTeam](...)
const ALT_REGEX =
  /\|\s*\([0-9]+\.\)\s*\[([^\]]+)\]\([^)]+\)[^|]*\|[^|]*\|[^|]*\|[^|]*\|\s*\[(\d+:\d+)\]\([^)]+\)\s*\|\s*\[([^\]]+)\]/g;

function parsePage(content, week) {
  const matches = [];
  let m;

  // Try standard format first
  const standardRegex = new RegExp(STANDARD_REGEX.source, "g");
  while ((m = standardRegex.exec(content)) !== null) {
    const [, homeTeam, score, awayTeam] = m;
    if (score === "-:-") continue;
    const scoreMatch = score.match(/^(\d+):(\d+)$/);
    if (!scoreMatch) continue;
    matches.push({
      homeTeam: mapTeam(homeTeam),
      awayTeam: mapTeam(awayTeam),
      week,
      homeScore: parseInt(scoreMatch[1], 10),
      awayScore: parseInt(scoreMatch[2], 10),
    });
  }

  // If no matches from standard format, try alternate (week 11 style)
  if (matches.length === 0) {
    const altRegex = new RegExp(ALT_REGEX.source, "g");
    while ((m = altRegex.exec(content)) !== null) {
      const [, homeTeam, score, awayTeam] = m;
      const scoreMatch = score.match(/^(\d+):(\d+)$/);
      if (!scoreMatch) continue;
      matches.push({
        homeTeam: mapTeam(homeTeam),
        awayTeam: mapTeam(awayTeam),
        week,
        homeScore: parseInt(scoreMatch[1], 10),
        awayScore: parseInt(scoreMatch[2], 10),
      });
    }
  }

  return matches;
}

// Week 6-23 file mapping (from mcp_web_fetch output)
const WEEK_FILES = {
  6: "f58f3a05-7cb0-4128-994b-f706d9dad259.txt",
  7: "b362ea49-a1a7-4166-8dd7-02113cad5f5f.txt",
  8: "5f642fff-1dc6-44fe-b70b-fdc1e4c4afe0.txt",
  9: "8e95764f-fe14-4559-99da-6f1bcde42fc3.txt",
  10: "e6bb785e-3dcd-41d2-b874-e0e2d24d3ff4.txt",
  11: "9686df61-d3f9-46a6-9983-1ad493f1e365.txt",
  12: "e0a21428-e573-47d2-b35a-78c716847abb.txt",
  13: "e3aea9fd-e768-4cc0-9592-3098ee03b913.txt",
  14: "a771466d-271b-4b86-8415-9026c34621ab.txt",
  15: "dc90cb0e-feea-442c-8c40-b8b2579ff494.txt",
  16: "13798911-8b85-4648-a0d6-8798c2a72433.txt",
  17: "c3a16941-1f7d-4ecf-bd22-f4d7a21727dc.txt",
  18: "edf8b0a3-2791-40c0-bb7a-4e25ef1a03bd.txt",
  19: "63d4d153-9af7-4e39-af34-7897d9098419.txt",
  20: "24135ad4-021a-4574-92c4-f722d392d776.txt",
  21: "e207cfd9-5050-4b0b-a2ae-fbff60d1631f.txt",
  22: "eadb04c4-2b0b-44f8-a9f6-4b781cf2b1c6.txt",
  23: "a623cac1-0901-455a-98b1-8073b5be4fa4.txt",
};

const AGENT_TOOLS = path.join(
  __dirname,
  "../../.cursor/projects/Users-musabkara-football-ai-platform/agent-tools"
);

function main() {
  const allMatches = [];

  for (let week = 6; week <= 23; week++) {
    const filename = WEEK_FILES[week];
    const filepath = path.join(AGENT_TOOLS, filename);
    if (!fs.existsSync(filepath)) {
      console.warn(`File not found for week ${week}: ${filepath}`);
      continue;
    }
    const content = fs.readFileSync(filepath, "utf-8");
    const weekMatches = parsePage(content, week);
    allMatches.push(...weekMatches);
    console.log(`Week ${week}: ${weekMatches.length} matches`);
  }

  const outputPath = path.join(__dirname, "../data/match-scores.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(allMatches, null, 2),
    "utf-8"
  );
  console.log(`\nTotal: ${allMatches.length} matches written to ${outputPath}`);
}

main();

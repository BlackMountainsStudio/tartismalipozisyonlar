import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
  const existing = await prisma.match.findFirst({
    where: {
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      week: match.week,
      league: match.league,
      date: new Date(match.date),
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.match.create({
    data: {
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      league: match.league,
      week: match.week,
      date: new Date(match.date),
    },
  });
}

async function upsertIncidents(matchId, incidents) {
  for (const incident of incidents) {
    const existing = await prisma.incident.findFirst({
      where: {
        matchId,
        minute: incident.minute ?? null,
        type: incident.type,
        description: incident.description,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.incident.create({
      data: {
        matchId,
        minute: incident.minute ?? null,
        type: incident.type,
        description: incident.description,
        confidenceScore: incident.confidenceScore ?? 0.75,
        sources: JSON.stringify(incident.sources ?? []),
        status: incident.status ?? "APPROVED",
      },
    });
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
    await prisma.$disconnect();
    await pool.end();
  });

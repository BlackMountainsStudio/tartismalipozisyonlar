import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

// Vercel Cron Jobs call this endpoint every 6 hours.
// Vercel sends the CRON_SECRET in the Authorization header.
// See vercel.json for the schedule.

export const maxDuration = 300; // 5 min timeout for scraping work

export async function GET(request: NextRequest) {
  // Authenticate the cron request
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  const results: { matchId: string; teams: string; incidents: number; mode: string }[] = [];

  try {
    // Find recent matches (within last 7 days) without approved incidents
    const recentMatches = await prisma.match.findMany({
      where: {
        league: { contains: "Süper Lig" },
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          lte: new Date(),
        },
      },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        week: true,
        date: true,
        _count: { select: { incidents: { where: { status: "APPROVED" } } } },
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    const queued = recentMatches.filter((m) => m._count.incidents === 0);

    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    for (const match of queued) {
      try {
        const { CrawlerOrchestrator } = await import("@/crawler");
        const { detectIncidents, detectIncidentsLocal, mapIncidentType } = await import("@/agents/incidentDetector");

        const orchestrator = new CrawlerOrchestrator(2);
        orchestrator.addJob(match.homeTeam, match.awayTeam, match.id);
        const resultsMap = await orchestrator.processQueue();
        const crawlResults = resultsMap.get(match.id) ?? [];

        const allComments: string[] = [];
        const crawlEntries: { source: string; url: string; rawContent: string }[] = [];

        for (const result of crawlResults) {
          crawlEntries.push({
            source: result.source,
            url: result.url,
            rawContent: result.content,
          });
          if (result.source === "reddit") {
            const r = result as { comments: { body: string }[] };
            allComments.push(...r.comments.map((c) => c.body));
          } else if (result.source === "eksisozluk") {
            const e = result as { entries: { body: string }[] };
            allComments.push(...e.entries.map((ent) => ent.body));
          }
        }

        if (allComments.length === 0) {
          results.push({ matchId: match.id, teams: `${match.homeTeam} vs ${match.awayTeam}`, incidents: 0, mode: "no-content" });
          continue;
        }

        const matchContext = `${match.homeTeam} vs ${match.awayTeam} (Week ${match.week})`;
        const detectedIncidents = hasOpenAI
          ? await detectIncidents(allComments, matchContext)
          : detectIncidentsLocal(allComments, matchContext);

        for (const incident of detectedIncidents) {
          await prisma.incident.create({
            data: {
              matchId: match.id,
              minute: incident.minute,
              type: mapIncidentType(incident.type),
              description: incident.description,
              confidenceScore: incident.confidence,
              sources: JSON.stringify(crawlEntries.map((e) => e.url)),
            },
          });
        }

        results.push({
          matchId: match.id,
          teams: `${match.homeTeam} vs ${match.awayTeam}`,
          incidents: detectedIncidents.length,
          mode: hasOpenAI ? "ai" : "local",
        });
      } catch (matchErr) {
        console.error(`[cron/scrape] failed for match ${match.id}:`, matchErr);
        results.push({ matchId: match.id, teams: `${match.homeTeam} vs ${match.awayTeam}`, incidents: 0, mode: "error" });
      }
    }

    return NextResponse.json({
      ok: true,
      startedAt: startedAt.toISOString(),
      recentMatchesFound: recentMatches.length,
      matchesProcessed: queued.length,
      results,
    });
  } catch (err) {
    console.error("[cron/scrape] error:", err);
    return NextResponse.json(
      { ok: false, error: "Cron job failed", startedAt: startedAt.toISOString() },
      { status: 500 }
    );
  }
}

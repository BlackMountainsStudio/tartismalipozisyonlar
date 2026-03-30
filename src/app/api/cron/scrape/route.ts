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
        league: true,
        week: true,
        date: true,
        _count: { select: { incidents: { where: { status: "APPROVED" } } } },
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    const queued = recentMatches.filter((m) => m._count.incidents === 0);

    // Log the cron run (stored as match note for now, proper table later)
    const summary = {
      startedAt: startedAt.toISOString(),
      recentMatchesFound: recentMatches.length,
      matchesQueuedForScraping: queued.length,
      queuedMatches: queued.map((m) => ({
        id: m.id,
        teams: `${m.homeTeam} vs ${m.awayTeam}`,
        date: m.date.toISOString(),
      })),
    };

    // TODO: Trigger actual scraper here when scraper service is production-ready.
    // For now, this endpoint acts as a health check and surfaces matches
    // that need scraping, enabling manual or webhook-triggered scraping.
    //
    // Example integration:
    //   for (const match of queued) {
    //     await fetch(`${process.env.SCRAPER_WEBHOOK_URL}`, {
    //       method: "POST",
    //       body: JSON.stringify({ matchId: match.id }),
    //     });
    //   }

    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error("[cron/scrape] error:", err);
    return NextResponse.json(
      { ok: false, error: "Cron job failed", startedAt: startedAt.toISOString() },
      { status: 500 }
    );
  }
}

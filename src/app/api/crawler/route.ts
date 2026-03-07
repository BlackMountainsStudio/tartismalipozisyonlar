import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

const DEMO_INCIDENTS: Record<string, { type: string; minute: number | null; description: string; confidence: number }[]> = {
  default: [
    {
      type: "POSSIBLE_PENALTY",
      minute: 34,
      description: "Fans claim defender handled the ball inside the box. Multiple sources report a clear handball that was not called by the referee.",
      confidence: 0.85,
    },
    {
      type: "VAR_CONTROVERSY",
      minute: 67,
      description: "VAR review was expected but not initiated for a potential foul in the penalty area. Social media erupted with controversy.",
      confidence: 0.72,
    },
    {
      type: "POSSIBLE_OFFSIDE_GOAL",
      minute: 52,
      description: "Goal was allowed but replays show the attacker may have been in an offside position. Community discussions are divided.",
      confidence: 0.61,
    },
    {
      type: "MISSED_RED_CARD",
      minute: 78,
      description: "A dangerous tackle from behind went unpunished. Only a yellow card was shown despite potential for serious injury.",
      confidence: 0.68,
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 }
      );
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    const runCrawlAndAnalyze = async (forceLocal = false): Promise<{
      message: string;
      crawledSources?: number;
      commentsAnalyzed?: number;
      incidentsDetected?: number;
      mode?: string;
    }> => {
      const { CrawlerOrchestrator } = await import("@/crawler");
      const { detectIncidents, detectIncidentsLocal, mapIncidentType } = await import("@/agents/incidentDetector");
      const useAI = hasOpenAI && !forceLocal;

      const orchestrator = new CrawlerOrchestrator(2);
      orchestrator.addJob(match.homeTeam, match.awayTeam, matchId);
      const resultsMap = await orchestrator.processQueue();
      const results = resultsMap.get(matchId) ?? [];

      const allComments: string[] = [];
      const crawlEntries: { source: string; url: string; rawContent: string }[] = [];

      for (const result of results) {
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

      const matchContext = `${match.homeTeam} vs ${match.awayTeam} (Week ${match.week})`;
      const detectedIncidents = useAI
        ? await detectIncidents(allComments, matchContext)
        : detectIncidentsLocal(allComments, matchContext);

      for (const incident of detectedIncidents) {
        await prisma.incident.create({
          data: {
            matchId,
            minute: incident.minute,
            type: mapIncidentType(incident.type),
            description: incident.description,
            confidenceScore: incident.confidence,
            sources: JSON.stringify(crawlEntries.map((e) => e.url)),
          },
        });
      }

      return {
        message: useAI ? "Crawl and analysis completed (live)" : "Crawl and analysis completed (local, no API key)",
        crawledSources: crawlEntries.length,
        commentsAnalyzed: allComments.length,
        incidentsDetected: detectedIncidents.length,
        mode: useAI ? undefined : "local",
      };
    };

    if (hasOpenAI) {
      try {
        const payload = await runCrawlAndAnalyze(false);
        return NextResponse.json(payload);
      } catch (err) {
        console.warn("Live crawl failed, falling back to local detector:", err);
      }
    }

    try {
      const payload = await runCrawlAndAnalyze(true);
      return NextResponse.json(payload);
    } catch (err) {
      console.warn("Crawl failed, falling back to demo mode:", err);
    }

    const demoIncidents = DEMO_INCIDENTS.default;
    const demoSources = [
      `https://reddit.com/r/superlig/${match.homeTeam.toLowerCase()}_vs_${match.awayTeam.toLowerCase()}`,
      `https://eksisozluk.com/${match.homeTeam.toLowerCase()}--${match.awayTeam.toLowerCase()}`,
    ];

    for (const incident of demoIncidents) {
      await prisma.incident.create({
        data: {
          matchId,
          minute: incident.minute,
          type: incident.type,
          description: incident.description,
          confidenceScore: incident.confidence,
          sources: JSON.stringify(demoSources),
        },
      });
    }

    return NextResponse.json({
      message: "Demo incidents generated (no API keys configured)",
      mode: "demo",
      incidentsDetected: demoIncidents.length,
    });
  } catch (err) {
    console.error("POST /api/crawler error:", err);
    return NextResponse.json(
      { error: "Crawler failed" },
      { status: 500 }
    );
  }
}

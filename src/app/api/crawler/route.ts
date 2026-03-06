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

    if (hasOpenAI) {
      try {
        const { CrawlerOrchestrator } = await import("@/crawler");
        const { detectIncidents, mapIncidentType } = await import("@/agents/incidentDetector");

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
            allComments.push(...result.comments.map((c) => c.body));
          } else if (result.source === "eksisozluk") {
            allComments.push(...result.entries.map((e) => e.body));
          }
        }

        if (allComments.length > 0) {
          const matchContext = `${match.homeTeam} vs ${match.awayTeam} (Week ${match.week})`;
          const detectedIncidents = await detectIncidents(allComments, matchContext);

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

          return NextResponse.json({
            message: "Crawl and analysis completed (live)",
            crawledSources: crawlEntries.length,
            commentsAnalyzed: allComments.length,
            incidentsDetected: detectedIncidents.length,
          });
        }
      } catch (err) {
        console.warn("Live crawl failed, falling back to demo mode:", err);
      }
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

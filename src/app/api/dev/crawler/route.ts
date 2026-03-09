import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { getSeasonFromDate } from "@/lib/slug";

type SeasonHalf = "first" | "second";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const forceLocal: boolean = Boolean(body.forceLocal);

    const rawHalf: string | undefined = body.half;
    const half: SeasonHalf | undefined =
      rawHalf === "first" || rawHalf === "second" ? rawHalf : undefined;

    const teamA: string | undefined = body.teamA;
    const teamB: string | undefined = body.teamB;
    const season: string | undefined = body.season;

    let homeTeam: string | undefined = body.homeTeam;
    let awayTeam: string | undefined = body.awayTeam;
    let matchId: string | undefined;
    let matchMeta:
      | {
          id: string;
          league: string;
          week: number;
          date: string;
          half: SeasonHalf | null;
        }
      | null = null;

    if (teamA && teamB && season && half) {
      const trimmedA = teamA.trim();
      const trimmedB = teamB.trim();

      if (!trimmedA || !trimmedB) {
        return NextResponse.json(
          { error: "teamA ve teamB boş olamaz" },
          { status: 400 },
        );
      }

      const matches = await prisma.match.findMany({
        where: {
          OR: [
            { homeTeam: trimmedA, awayTeam: trimmedB },
            { homeTeam: trimmedB, awayTeam: trimmedA },
          ],
        },
        orderBy: { date: "asc" },
      });

      const seasonMatches = matches.filter(
        (m) => getSeasonFromDate(m.date) === season,
      );

      if (seasonMatches.length === 0) {
        return NextResponse.json(
          {
            error:
              "Bu iki takım için belirtilen sezonda maç bulunamadı. Lütfen önce maçı ekleyin.",
          },
          { status: 404 },
        );
      }

      const sorted = seasonMatches.sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      );
      const chosen =
        half === "first"
          ? sorted[0]
          : sorted.length > 1
            ? sorted[1]
            : sorted[0];

      homeTeam = chosen.homeTeam;
      awayTeam = chosen.awayTeam;
      matchId = chosen.id;
      matchMeta = {
        id: chosen.id,
        league: chosen.league,
        week: chosen.week,
        date: chosen.date.toISOString(),
        half,
      };
    } else {
      homeTeam = homeTeam?.trim();
      awayTeam = awayTeam?.trim();
      if (!homeTeam || !awayTeam) {
        return NextResponse.json(
          {
            error:
              "teamA, teamB, season, half alanlarını doldurun veya homeTeam/awayTeam gönderin.",
          },
          { status: 400 },
        );
      }
      matchId = `dev-${Date.now()}`;
    }

    const redditConfigured = Boolean(
      process.env.REDDIT_CLIENT_ID &&
        process.env.REDDIT_CLIENT_SECRET &&
        process.env.REDDIT_USERNAME &&
        process.env.REDDIT_PASSWORD,
    );

    const { CrawlerOrchestrator } = await import("@/crawler");
    const { detectIncidents, detectIncidentsLocal } = await import(
      "@/agents/incidentDetector"
    );

    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const useAI = hasOpenAI && !forceLocal;

    const orchestrator = new CrawlerOrchestrator(2);
    orchestrator.addJob(homeTeam!, awayTeam!, matchId!);
    const resultsMap = await orchestrator.processQueue();
    const results = resultsMap.get(matchId!) ?? [];

    const allComments: string[] = [];
    const crawlEntries: { source: string; url: string; rawContent: string }[] =
      [];

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

    const matchContext = `${homeTeam} vs ${awayTeam}`;
    const incidents = useAI
      ? await detectIncidents(allComments, matchContext)
      : detectIncidentsLocal(allComments, matchContext);

    const payload = {
      message: "Crawl tamamlandı (sadece local, veritabanına yazılmadı)",
      mode: useAI ? "openai" : "local",
      homeTeam,
      awayTeam,
      match: matchMeta,
      crawledSources: crawlEntries.length,
      commentsAnalyzed: allComments.length,
      incidentsDetected: incidents.length,
      incidents,
      sources: crawlEntries.map((e) => e.url),
      redditConfigured,
      hasOpenAI,
      hint:
        crawlEntries.length === 0 && allComments.length === 0
          ? "Hiç kaynak bulunamadı. Reddit kimlik bilgileri eksik olabilir veya Reddit/Ekşi erişimi engellenmiş olabilir."
          : undefined,
    };

    return NextResponse.json(payload, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("POST /api/dev/crawler error:", err);
    return NextResponse.json(
      { error: "Crawler failed" },
      { status: 500 },
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { getResolvedVideoUrl } from "@/lib/incident-api";
import { buildMatchSlug } from "@/lib/slug";
import { buildIncidentSlug, getShortIdFromIncidentSlug } from "@/lib/slug";

function parseSources(sources: string): string[] {
  try {
    return JSON.parse(sources);
  } catch {
    return [];
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const matchSlug = searchParams.get("matchSlug");
    const incidentSlug = searchParams.get("incidentSlug");
    const status = searchParams.get("status");
    const minConfidence = searchParams.get("minConfidence");
    const team = searchParams.get("team")?.trim() || undefined;
    const typeParam = searchParams.get("type")?.trim() || undefined;
    const inFavorOf = searchParams.get("inFavorOf")?.trim() || undefined;
    const against = searchParams.get("against")?.trim() || undefined;

    if (matchSlug && incidentSlug) {
      const shortId = getShortIdFromIncidentSlug(incidentSlug);
      const matchWithIncidents = await prisma.match.findFirst({
        where: { slug: matchSlug },
        include: { incidents: { select: { id: true, slug: true } } },
      });
      let match = matchWithIncidents;
      if (!match) {
        const allMatches = await prisma.match.findMany({
          include: { incidents: { select: { id: true, slug: true } } },
        });
        match = allMatches.find(
          (m) =>
            buildMatchSlug({
              league: m.league,
              week: m.week,
              date: m.date,
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
            }) === matchSlug
        ) ?? null;
      }
      if (!match) return NextResponse.json(null, { status: 404, headers: NO_CACHE_HEADERS });
      const incidentRow = match.incidents.find(
        (i) => i.slug === incidentSlug || (shortId && i.id.endsWith(shortId))
      );
      if (!incidentRow) return NextResponse.json(null, { status: 404, headers: NO_CACHE_HEADERS });
      const incident = await prisma.incident.findUnique({
        where: { id: incidentRow.id },
        include: {
          match: {
            include: {
              referee: { select: { id: true, name: true, slug: true, role: true } },
              varReferee: { select: { id: true, name: true, slug: true, role: true } },
            },
          },
          opinions: { include: { commentator: true }, orderBy: { createdAt: "asc" } },
        },
      });
      if (!incident) return NextResponse.json(null, { status: 404, headers: NO_CACHE_HEADERS });
      return NextResponse.json(
        {
          ...incident,
          sources: parseJson(incident.sources, []),
          videoUrl: await getResolvedVideoUrl(incident),
          refereeComments: parseJson(incident.refereeComments, []),
          relatedVideos: parseJson(incident.relatedVideos, []),
          newsArticles: parseJson(incident.newsArticles, []),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const where: Record<string, unknown> = {};
    if (matchId) where.matchId = matchId;
    if (status) where.status = status.toUpperCase();
    if (minConfidence) where.confidenceScore = { gte: parseFloat(minConfidence) };
    if (typeParam) {
      const types = typeParam.split(",").map((t) => t.trim()).filter(Boolean);
      if (types.length === 1) where.type = types[0];
      else if (types.length > 1) where.type = { in: types };
    }
    const leagueParam = searchParams.get("league");
    const refereeSlug = searchParams.get("refereeSlug")?.trim() || undefined;
    const commentatorSlug = searchParams.get("commentatorSlug")?.trim() || undefined;
    const matchFilter: Record<string, unknown>[] = [];
    if (!matchId && leagueParam !== "all") {
      matchFilter.push({ league: leagueParam ?? "Süper Lig 2025-26" });
    }
    if (refereeSlug) {
      matchFilter.push({
        OR: [
          { referee: { slug: refereeSlug } },
          { varReferee: { slug: refereeSlug } },
        ],
      });
    }
    if (team) {
      const teams = team.split(",").map((t) => t.trim()).filter(Boolean);
      if (teams.length === 1) {
        matchFilter.push({
          OR: [{ homeTeam: teams[0] }, { awayTeam: teams[0] }],
        });
      } else if (teams.length > 1) {
        matchFilter.push({
          OR: teams.flatMap((t) => [{ homeTeam: t }, { awayTeam: t }]),
        });
      }
    }
    if (matchFilter.length > 0) {
      where.match = matchFilter.length === 1 ? matchFilter[0] : { AND: matchFilter };
    }
    if (inFavorOf) where.inFavorOf = inFavorOf;
    if (against) where.against = against;
    if (commentatorSlug) {
      where.opinions = {
        some: { commentator: { slug: commentatorSlug } },
      };
    }

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            week: true,
            date: true,
            league: true,
            slug: true,
            referee: { select: { id: true, name: true, slug: true, role: true } },
            varReferee: { select: { id: true, name: true, slug: true, role: true } },
          },
        },
        opinions: { select: { stance: true } },
      },
      orderBy: [{ minute: "asc" }, { confidenceScore: "desc" }],
    });

    const mapped = incidents.map((inc) => {
      const opinions = (inc as { opinions?: { stance: string }[] }).opinions ?? [];
      let agreeCount = opinions.filter((o) => o.stance === "AGREE").length;
      let disagreeCount = opinions.filter((o) => o.stance === "DISAGREE").length;
      let neutralCount = opinions.filter((o) => o.stance === "NEUTRAL").length;
      if (opinions.length === 0) {
        const rc = (() => { try { return JSON.parse(inc.refereeComments); } catch { return []; } })();
        const rcWithStance = Array.isArray(rc) ? rc.filter((r: { stance?: string }) => r.stance && ["AGREE", "DISAGREE", "NEUTRAL"].includes(r.stance)) : [];
        for (const r of rcWithStance) {
          const w = (r as { author?: string }).author === "beIN Trio" ? 3 : 1;
          if (r.stance === "AGREE") agreeCount += w;
          else if (r.stance === "DISAGREE") disagreeCount += w;
          else if (r.stance === "NEUTRAL") neutralCount += w;
        }
      }
      const totalWithStance = agreeCount + disagreeCount + neutralCount;
      const opinionSummary = totalWithStance > 0 ? { agree: agreeCount, disagree: disagreeCount, neutral: neutralCount } : null;
      const match = inc.match as { slug?: string | null; league: string; week: number; date: Date; homeTeam: string; awayTeam: string };
      const matchSlugComputed =
        match?.slug ??
        (match ? buildMatchSlug({ league: match.league, week: match.week, date: match.date, homeTeam: match.homeTeam, awayTeam: match.awayTeam }) : "");
      const incidentSlugComputed =
        inc.slug ??
        buildIncidentSlug({ id: inc.id, minute: inc.minute, description: inc.description });
      const { opinions: _o, ...incRest } = inc as { opinions?: unknown };
      return {
        ...incRest,
        slug: incidentSlugComputed,
        matchSlug: matchSlugComputed,
        sources: parseSources(inc.sources),
        videoUrl: inc.videoUrl ?? null,
        inFavorOf: inc.inFavorOf ?? null,
        against: inc.against ?? null,
        opinionSummary,
        refereeComments: (() => {
          try {
            return JSON.parse(inc.refereeComments);
          } catch {
            return [];
          }
        })(),
      };
    });

    return NextResponse.json(mapped, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/incidents error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, minute, type, description, confidenceScore, sources } = body;

    if (!matchId || !type || !description || confidenceScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        matchId,
        minute: minute ? parseInt(minute) : null,
        type,
        description,
        confidenceScore: parseFloat(confidenceScore),
        sources: JSON.stringify(sources ?? []),
      },
    });

    return NextResponse.json(
      { ...incident, sources: parseSources(incident.sources) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/incidents error:", err);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}

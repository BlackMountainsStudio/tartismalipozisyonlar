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
    const categoryParam = searchParams.get("category")?.trim() || undefined;
    const seasonParam = searchParams.get("season")?.trim() || undefined;
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
        // Fallback: fetch only slug-relevant fields (no incidents) to avoid heavy join
        const allMatchesSlim = await prisma.match.findMany({
          select: { id: true, slug: true, league: true, week: true, date: true, homeTeam: true, awayTeam: true },
        });
        const found = allMatchesSlim.find(
          (m) =>
            buildMatchSlug({
              league: m.league,
              week: m.week,
              date: m.date,
              homeTeam: m.homeTeam,
              awayTeam: m.awayTeam,
            }) === matchSlug
        );
        if (found) {
          match = await prisma.match.findUnique({
            where: { id: found.id },
            include: { incidents: { select: { id: true, slug: true } } },
          });
        }
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
    if (categoryParam) {
      const categories = categoryParam.split(",").map((c) => c.trim()).filter(Boolean);
      const typeMap: Record<string, string[]> = {
        penalty: ["PENALTY", "POSSIBLE_PENALTY"],
        red_card: ["RED_CARD", "MISSED_RED_CARD"],
        handball: ["HANDBALL"],
        offside: ["OFFSIDE", "GOAL_DISALLOWED", "POSSIBLE_OFFSIDE_GOAL"],
        foul: ["FOUL"],
        second_yellow: ["YELLOW_CARD", "MISSED_YELLOW"],
        other: ["VAR_CONTROVERSY"],
      };
      const allTypes: string[] = [];
      for (const c of categories) {
        const t = typeMap[c];
        if (t) allTypes.push(...t);
      }
      if (allTypes.length > 0) {
        where.OR = [
          { category: { in: categories } },
          { category: null, type: { in: allTypes } },
        ];
      }
    }
    const leagueParam = searchParams.get("league");
    const refereeSlugParam = searchParams.get("refereeSlug")?.trim() || undefined;
    const refereeSlugs = refereeSlugParam
      ? refereeSlugParam.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const commentatorSlug = searchParams.get("commentatorSlug")?.trim() || undefined;
    const matchFilter: Record<string, unknown>[] = [];
    if (!matchId && leagueParam !== "all") {
      matchFilter.push({ league: leagueParam ?? "Süper Lig 2025-26" });
    }
    if (seasonParam) {
      matchFilter.push({ league: { contains: seasonParam } });
    }
    if (refereeSlugs.length > 0) {
      matchFilter.push({
        OR: refereeSlugs.flatMap((slug) => [
          { referee: { slug } },
          { varReferee: { slug } },
        ]),
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

    const pageParam = parseInt(searchParams.get("page") ?? "1", 10);
    const limitParam = parseInt(searchParams.get("limit") ?? "50", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 200 ? limitParam : 50;
    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
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
        take: limit,
        skip,
      }),
      prisma.incident.count({ where }),
    ]);

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

    return NextResponse.json(
      { data: mapped, total, page, limit, totalPages: Math.ceil(total / limit) },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/incidents error:", err);
    return NextResponse.json(
      { error: "Pozisyonlar alınamadı", data: [], total: 0 },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
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

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { buildMatchSlug, buildIncidentSlug } from "@/lib/slug";

/** Benzer pozisyonları getir - aynı tür, farklı maç */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: positionId } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id: positionId },
      include: {
        match: {
          select: { id: true, homeTeam: true, awayTeam: true, league: true, week: true, date: true, slug: true },
        },
      },
    });

    if (!incident) {
      return NextResponse.json({ error: "Pozisyon bulunamadı" }, { status: 404 });
    }

    // SimilarPosition tablosundan
    const similarFromDb = await prisma.similarPosition.findMany({
      where: { positionId },
      include: {
        similarPosition: {
          include: {
            match: {
              select: { homeTeam: true, awayTeam: true, league: true, week: true, date: true, slug: true },
            },
          },
        },
      },
      orderBy: { similarityScore: "desc" },
      take: 5,
    });

    if (similarFromDb.length > 0) {
      const items = similarFromDb.map((sp) => {
        const inc = sp.similarPosition;
        const match = inc.match as { slug?: string | null; homeTeam: string; awayTeam: string; league: string; week: number; date: Date };
        const matchSlug = match?.slug ?? (match ? buildMatchSlug({
          league: match.league,
          week: match.week,
          date: match.date,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
        }) : "");
        return {
          id: inc.id,
          type: inc.type,
          minute: inc.minute,
          description: inc.description,
          similarityScore: sp.similarityScore,
          matchInfo: match ? `${match.homeTeam} vs ${match.awayTeam}` : "",
          matchSlug,
          incidentSlug: inc.slug ?? buildIncidentSlug({ id: inc.id, minute: inc.minute, description: inc.description }),
        };
      });
      return NextResponse.json({ similar: items, source: "database" }, { headers: NO_CACHE_HEADERS });
    }

    // Fallback: aynı türdeki diğer pozisyonlar (farklı maç)
    const sameType = await prisma.incident.findMany({
      where: {
        id: { not: positionId },
        type: incident.type,
        status: "APPROVED",
      },
      include: {
        match: {
          select: { homeTeam: true, awayTeam: true, league: true, week: true, date: true, slug: true },
        },
      },
      orderBy: { minute: "asc" },
      take: 5,
    });

    const items = sameType.map((inc) => {
      const match = inc.match as { slug?: string | null; homeTeam: string; awayTeam: string; league: string; week: number; date: Date };
      const matchSlug = match?.slug ?? (match ? buildMatchSlug({
        league: match.league,
        week: match.week,
        date: match.date,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
      }) : "");
      return {
        id: inc.id,
        type: inc.type,
        minute: inc.minute,
        description: inc.description,
        similarityScore: 0.85, // Tahmini - aynı tür
        matchInfo: match ? `${match.homeTeam} vs ${match.awayTeam}` : "",
        matchSlug,
        incidentSlug: inc.slug ?? buildIncidentSlug({ id: inc.id, minute: inc.minute, description: inc.description }),
      };
    });

    return NextResponse.json({ similar: items, source: "type_fallback" }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/incidents/[id]/similar error:", err);
    return NextResponse.json({ similar: [], source: "error" }, { headers: NO_CACHE_HEADERS });
  }
}

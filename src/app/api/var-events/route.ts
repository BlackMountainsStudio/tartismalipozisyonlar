import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

/** VAR müdahale analizi - Incident.varIntervention ve VarEvent tablosundan */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonParam = searchParams.get("season")?.trim();
    const leagueParam = searchParams.get("league")?.trim();

    const matchWhere: Record<string, unknown> = {};
    if (leagueParam) matchWhere.league = { contains: leagueParam };
    if (seasonParam) matchWhere.league = { contains: seasonParam };

    // Incident.varIntervention=true olanlardan (mevcut veri)
    const incidentsWithVar = await prisma.incident.findMany({
      where: {
        status: "APPROVED",
        varIntervention: true,
        ...(Object.keys(matchWhere).length > 0 ? { match: matchWhere } : {}),
      },
      include: {
        match: { select: { id: true, league: true, date: true, homeTeam: true, awayTeam: true } },
      },
    });

    // VarEvent tablosundan
    const varEvents = await prisma.varEvent.findMany({
      where: Object.keys(matchWhere).length > 0 ? { match: matchWhere } : undefined,
      include: {
        incident: { select: { id: true, type: true, minute: true } },
        match: { select: { league: true, date: true } },
      },
    });

    const fromIncidents = incidentsWithVar.length;
    const fromVarEvents = varEvents.length;
    const total = Math.max(fromIncidents, fromVarEvents) || fromIncidents;

    return NextResponse.json(
      {
        total,
        fromIncidents,
        fromVarEvents,
        summary: {
          varMudahalesi: total,
          dogruKarar: 0, // VarEvent.finalDecision ile hesaplanabilir
          yanlisKarar: 0,
        },
        events: varEvents.map((e) => ({
          id: e.id,
          matchId: e.matchId,
          positionId: e.positionId,
          refereeDecision: e.refereeDecision,
          varCalled: e.varCalled,
          finalDecision: e.finalDecision,
          incident: e.incident,
          match: e.match,
        })),
        incidentsWithVar: incidentsWithVar.map((i) => ({
          id: i.id,
          type: i.type,
          minute: i.minute,
          match: i.match,
        })),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/var-events error:", err);
    return NextResponse.json(
      { total: 0, fromIncidents: 0, fromVarEvents: 0, summary: {}, events: [], incidentsWithVar: [] },
      { headers: NO_CACHE_HEADERS }
    );
  }
}

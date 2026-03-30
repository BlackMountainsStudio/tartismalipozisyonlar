import { NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { PUBLIC_CACHE_HEADERS } from "@/lib/api-response";

const STALE_HOURS = 48; // Warn if no new incidents in 48h

export async function GET() {
  try {
    const latest = await prisma.incident.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const latestMatch = await prisma.match.findFirst({
      where: { league: { contains: "Süper Lig" } },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const now = Date.now();
    const lastIncidentAt = latest?.createdAt ?? null;
    const hoursSinceLastIncident = lastIncidentAt
      ? Math.round((now - lastIncidentAt.getTime()) / 3600_000)
      : null;

    const isStale =
      hoursSinceLastIncident === null || hoursSinceLastIncident > STALE_HOURS;

    return NextResponse.json(
      {
        lastIncidentCreatedAt: lastIncidentAt?.toISOString() ?? null,
        lastMatchUpdatedAt: latestMatch?.updatedAt.toISOString() ?? null,
        hoursSinceLastIncident,
        staleThresholdHours: STALE_HOURS,
        isStale,
        status: isStale ? "stale" : "fresh",
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

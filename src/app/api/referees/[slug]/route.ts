import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";
import { buildMatchSlug } from "@/lib/slug";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const referee = await prisma.referee.findUnique({
      where: { slug },
      include: {
        matchesAsReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true, type: true, minute: true, description: true, slug: true } },
          },
        },
        matchesAsVarReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true, type: true, minute: true, description: true, slug: true } },
          },
        },
      },
    });

    if (!referee) {
      return NextResponse.json({ error: "Hakem bulunamadı" }, { status: 404 });
    }

    const asReferee = referee.matchesAsReferee
      .filter((m) => m.incidents.length > 0)
      .map((m) => ({
        ...m,
        slug: m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }),
        roleInMatch: "REFEREE" as const,
        incidentCount: m.incidents.length,
      }));
    const asVarReferee = referee.matchesAsVarReferee
      .filter((m) => m.incidents.length > 0)
      .map((m) => ({
        ...m,
        slug: m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }),
        roleInMatch: "VAR" as const,
        incidentCount: m.incidents.length,
      }));

    const matchesWithIncidents = [
      ...asReferee.map((m) => ({ ...m, asReferee: true })),
      ...asVarReferee.map((m) => ({ ...m, asReferee: false })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const matchesList = matchesWithIncidents.map((m) => ({
      id: m.id,
      slug: m.slug,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date,
      roleInMatch: m.roleInMatch,
      incidentCount: m.incidentCount,
    }));

    return NextResponse.json(
      {
        id: referee.id,
        name: referee.name,
        slug: referee.slug,
        role: referee.role,
        bio: referee.bio,
        photoUrl: referee.photoUrl,
        createdAt: referee.createdAt,
        updatedAt: referee.updatedAt,
        matchesWithIncidents: matchesList,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/referees/[slug] error:", err);
    return NextResponse.json({ error: "Hakem getirilemedi" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, role, bio, photoUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = name
        .toLowerCase()
        .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
        .replace(/İ/g, "i")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (role !== undefined) updateData.role = role === "VAR" ? "VAR" : "REFEREE";
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl?.trim() || null;

    const referee = await prisma.referee.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json(referee);
  } catch (err) {
    console.error("PATCH /api/referees/[slug] error:", err);
    return NextResponse.json({ error: "Hakem güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.referee.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/referees/[slug] error:", err);
    return NextResponse.json({ error: "Hakem silinemedi" }, { status: 500 });
  }
}

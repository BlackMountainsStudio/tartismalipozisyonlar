import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

export async function GET() {
  try {
    const referees = await prisma.referee.findMany({
      include: {
        matchesAsReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
        matchesAsVarReferee: {
          include: {
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const list = referees.map((r) => {
      const asRef = r.matchesAsReferee.filter((m) => m.incidents.length > 0);
      const asVar = r.matchesAsVarReferee.filter((m) => m.incidents.length > 0);
      const matchIds = new Set([...asRef.map((m) => m.id), ...asVar.map((m) => m.id)]);
      const totalIncidents = asRef.reduce((s, m) => s + m.incidents.length, 0) +
        asVar.reduce((s, m) => s + m.incidents.length, 0);
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        role: r.role,
        bio: r.bio,
        photoUrl: r.photoUrl,
        matchesWithIncidentsCount: matchIds.size,
        totalIncidentsInThoseMatches: totalIncidents,
      };
    });

    return NextResponse.json(list, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/referees error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, bio, photoUrl } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name gerekli" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/İ/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const referee = await prisma.referee.create({
      data: {
        name: name.trim(),
        slug: slug || `referee-${Date.now()}`,
        role: role === "VAR" ? "VAR" : "REFEREE",
        bio: bio?.trim() || null,
        photoUrl: photoUrl?.trim() || null,
      },
    });

    return NextResponse.json(referee, { status: 201 });
  } catch (err) {
    console.error("POST /api/referees error:", err);
    return NextResponse.json({ error: "Hakem eklenemedi" }, { status: 500 });
  }
}

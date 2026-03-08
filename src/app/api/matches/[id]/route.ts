import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { refereeId, varRefereeId, homeScore, awayScore } = body;

    const updateData: {
      refereeId?: string | null;
      varRefereeId?: string | null;
      homeScore?: number | null;
      awayScore?: number | null;
    } = {};
    if (refereeId !== undefined) updateData.refereeId = refereeId || null;
    if (varRefereeId !== undefined) updateData.varRefereeId = varRefereeId || null;
    if (homeScore !== undefined) updateData.homeScore = homeScore == null ? null : parseInt(String(homeScore), 10);
    if (awayScore !== undefined) updateData.awayScore = awayScore == null ? null : parseInt(String(awayScore), 10);

    const match = await prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        referee: { select: { id: true, name: true, slug: true, role: true } },
        varReferee: { select: { id: true, name: true, slug: true, role: true } },
      },
    });

    return NextResponse.json(match);
  } catch (err) {
    console.error("PATCH /api/matches/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

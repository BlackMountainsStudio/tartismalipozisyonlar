import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { videoUrl, title, durationMin, transcript, source, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (videoUrl !== undefined) updateData.videoUrl = String(videoUrl).trim();
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (durationMin !== undefined) updateData.durationMin = durationMin == null ? null : parseInt(String(durationMin), 10);
    if (transcript !== undefined) updateData.transcript = transcript?.trim() || null;
    if (source !== undefined) updateData.source = source?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const video = await prisma.matchVideo.update({
      where: { id },
      data: updateData,
      include: {
        match: {
          select: {
            id: true,
            homeTeam: true,
            awayTeam: true,
            week: true,
            date: true,
            league: true,
          },
        },
      },
    });

    return NextResponse.json(video, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("PATCH /api/match-videos/[id] error:", err);
    return NextResponse.json({ error: "Güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.matchVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/match-videos/[id] error:", err);
    return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { comment, stance, sourceUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (comment !== undefined) updateData.comment = comment;
    if (stance !== undefined) updateData.stance = stance;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl || null;

    const opinion = await prisma.expertOpinion.update({
      where: { id },
      data: updateData,
      include: {
        commentator: true,
        incident: { include: { match: true } },
      },
    });

    return NextResponse.json(opinion);
  } catch (err) {
    console.error("PATCH /api/opinions/[id] error:", err);
    return NextResponse.json({ error: "Failed to update opinion" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expertOpinion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/opinions/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete opinion" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote } = body;

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const suggestion = await prisma.suggestion.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(suggestion);
  } catch (err) {
    console.error("PATCH /api/suggestions/[id] error:", err);
    return NextResponse.json(
      { error: "Öneri güncellenemedi" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.suggestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/suggestions/[id] error:", err);
    return NextResponse.json(
      { error: "Öneri silinemedi" },
      { status: 500 }
    );
  }
}

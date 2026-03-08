import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Şikayet için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id: commentId } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null;

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    await prisma.commentReport.upsert({
      where: {
        commentId_userId: { commentId, userId: session.user.id },
      },
      create: {
        commentId,
        userId: session.user.id,
        reason,
      },
      update: { reason },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/comments/[id]/report error:", err);
    return NextResponse.json(
      { error: "Şikayet gönderilemedi" },
      { status: 500 }
    );
  }
}

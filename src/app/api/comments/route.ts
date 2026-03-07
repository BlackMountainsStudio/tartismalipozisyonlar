import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "matchId parametresi gerekli" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { matchId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (err) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, author, content } = body;

    if (!matchId || !author?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "matchId, author ve content alanları gerekli" },
        { status: 400 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "Yorum en fazla 1000 karakter olabilir" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        matchId,
        author: author.trim(),
        content: content.trim(),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json(
      { error: "Yorum eklenemedi" },
      { status: 500 }
    );
  }
}

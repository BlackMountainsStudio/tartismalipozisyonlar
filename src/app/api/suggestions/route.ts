import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, string> = {};
    if (status) where.status = status;

    const suggestions = await prisma.suggestion.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(suggestions, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("GET /api/suggestions error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Öneri göndermek için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { category, subject, message } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Konu ve mesaj alanları zorunludur" },
        { status: 400 }
      );
    }

    if (message.trim().length > 3000) {
      return NextResponse.json(
        { error: "Mesaj en fazla 3000 karakter olabilir" },
        { status: 400 }
      );
    }

    const name = session.user.nickname || session.user.name || "Kullanıcı";
    const email = session.user.email ?? null;

    const suggestion = await prisma.suggestion.create({
      data: {
        userId: session.user.id,
        name,
        email,
        category: category || "GENERAL",
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return NextResponse.json(suggestion, { status: 201 });
  } catch (err) {
    console.error("POST /api/suggestions error:", err);
    return NextResponse.json(
      { error: "Mesajınız gönderilemedi" },
      { status: 500 }
    );
  }
}

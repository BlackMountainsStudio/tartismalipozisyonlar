import { NextRequest, NextResponse } from "next/server";
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
    const body = await request.json();
    const { name, email, category, subject, message } = body;

    if (!name?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "İsim, konu ve mesaj alanları zorunludur" },
        { status: 400 }
      );
    }

    if (message.trim().length > 3000) {
      return NextResponse.json(
        { error: "Mesaj en fazla 3000 karakter olabilir" },
        { status: 400 }
      );
    }

    const suggestion = await prisma.suggestion.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
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

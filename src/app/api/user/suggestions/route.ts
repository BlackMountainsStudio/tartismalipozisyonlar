import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "Genel",
  SUGGESTION: "Öneri",
  BUG: "Hata Bildirimi",
  MATCH_REQUEST: "Maç/Pozisyon Talebi",
  QUESTION: "Soru",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Yeni",
  READ: "Okundu",
  RESOLVED: "Çözüldü",
  ARCHIVED: "Arşiv",
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const suggestions = await prisma.suggestion.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const result = suggestions.map((s) => ({
      id: s.id,
      category: s.category,
      categoryLabel: CATEGORY_LABELS[s.category] ?? s.category,
      subject: s.subject,
      message: s.message,
      status: s.status,
      statusLabel: STATUS_LABELS[s.status] ?? s.status,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/user/suggestions error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

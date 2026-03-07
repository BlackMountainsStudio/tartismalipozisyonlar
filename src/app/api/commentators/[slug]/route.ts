import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const commentator = await prisma.commentator.findUnique({
      where: { slug },
      include: {
        opinions: {
          include: {
            incident: {
              include: { match: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!commentator) {
      return NextResponse.json({ error: "Yorumcu bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      ...commentator,
      career: parseJson(commentator.career, []),
      expertise: parseJson(commentator.expertise, []),
      socialLinks: parseJson(commentator.socialLinks, []),
    });
  } catch (err) {
    console.error("GET /api/commentators/[slug] error:", err);
    return NextResponse.json({ error: "Yorumcu getirilemedi" }, { status: 500 });
  }
}

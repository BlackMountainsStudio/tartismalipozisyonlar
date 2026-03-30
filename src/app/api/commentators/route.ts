import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/database/db";
import { NO_CACHE_HEADERS, LONG_CACHE_HEADERS } from "@/lib/api-response";

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const commentators = await prisma.commentator.findMany({
      include: {
        opinions: {
          select: { id: true, stance: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      commentators.map((c) => ({
        ...c,
        career: parseJson(c.career, []),
        expertise: parseJson(c.expertise, []),
        socialLinks: parseJson(c.socialLinks, []),
      })),
      { headers: LONG_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("GET /api/commentators error:", err);
    return NextResponse.json([], { headers: NO_CACHE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, bio, photoUrl, birthDate, birthPlace, education, career, expertise, socialLinks } = body;

    if (!name || !role || !bio) {
      return NextResponse.json({ error: "Name, role and bio are required" }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const commentator = await prisma.commentator.create({
      data: {
        name,
        slug,
        role,
        bio,
        photoUrl: photoUrl || null,
        birthDate: birthDate || null,
        birthPlace: birthPlace || null,
        education: education || null,
        career: JSON.stringify(career ?? []),
        expertise: JSON.stringify(expertise ?? []),
        socialLinks: JSON.stringify(socialLinks ?? []),
      },
    });

    return NextResponse.json({
      ...commentator,
      career: parseJson(commentator.career, []),
      expertise: parseJson(commentator.expertise, []),
      socialLinks: parseJson(commentator.socialLinks, []),
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/commentators error:", err);
    return NextResponse.json({ error: "Failed to create commentator" }, { status: 500 });
  }
}

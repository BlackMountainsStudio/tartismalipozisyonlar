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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, role, bio, photoUrl, birthDate, birthPlace, education, career, expertise, socialLinks } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
        .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
        .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl || null;
    if (birthDate !== undefined) updateData.birthDate = birthDate || null;
    if (birthPlace !== undefined) updateData.birthPlace = birthPlace || null;
    if (education !== undefined) updateData.education = education || null;
    if (career !== undefined) updateData.career = JSON.stringify(career);
    if (expertise !== undefined) updateData.expertise = JSON.stringify(expertise);
    if (socialLinks !== undefined) updateData.socialLinks = JSON.stringify(socialLinks);

    const commentator = await prisma.commentator.update({
      where: { slug },
      data: updateData,
    });

    return NextResponse.json({
      ...commentator,
      career: parseJson(commentator.career, []),
      expertise: parseJson(commentator.expertise, []),
      socialLinks: parseJson(commentator.socialLinks, []),
    });
  } catch (err) {
    console.error("PATCH /api/commentators/[slug] error:", err);
    return NextResponse.json({ error: "Yorumcu güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await prisma.commentator.delete({ where: { slug } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/commentators/[slug] error:", err);
    return NextResponse.json({ error: "Yorumcu silinemedi" }, { status: 500 });
  }
}

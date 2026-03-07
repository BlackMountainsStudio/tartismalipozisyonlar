import { NextResponse } from "next/server";
import { prisma } from "@/database/db";

export async function GET() {
  try {
    const commentators = await prisma.commentator.findMany({
      include: {
        opinions: {
          include: {
            incident: {
              include: { match: true },
            },
          },
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
      }))
    );
  } catch (err) {
    console.error("GET /api/commentators error:", err);
    return NextResponse.json([]);
  }
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

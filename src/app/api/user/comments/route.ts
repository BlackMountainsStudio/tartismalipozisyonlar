import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/database/db";
import { incidentUrl } from "@/lib/links";
import { buildMatchSlug, buildIncidentSlug } from "@/lib/slug";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { userId: session.user.id, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        match: true,
        incident: { include: { match: true } },
        replies: {
          include: { user: { select: { nickname: true, name: true, image: true } } },
        },
      },
    });

    const result = comments.map((c) => {
      const match = c.incident?.match ?? c.match;
      const matchSlug = match ? buildMatchSlug(match) : null;
      const incidentSlug = c.incident
        ? buildIncidentSlug({
            id: c.incident.id,
            minute: c.incident.minute,
            description: c.incident.description,
          })
        : null;
      const url =
        matchSlug && incidentSlug
          ? incidentUrl(matchSlug, incidentSlug)
          : matchSlug
            ? `/matches/${matchSlug}`
            : null;

      return {
        id: c.id,
        content: c.content,
        verdict: c.verdict,
        createdAt: c.createdAt,
        matchTitle: match ? `${match.homeTeam} vs ${match.awayTeam}` : null,
        incidentDesc: c.incident?.description?.slice(0, 80) ?? null,
        url,
        replyCount: c.replies.length,
        replies: c.replies.map((r) => ({
          id: r.id,
          author: r.author,
          content: r.content,
          createdAt: r.createdAt,
          image: r.user?.image ?? null,
        })),
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/user/comments error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

import { prisma } from "@/database/db";
import YorumcularClient, { type CommentatorListItem } from "./YorumcularClient";

export const revalidate = 300;

function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw); } catch { return fallback; }
}

export default async function YorumcularPage() {
  let commentators: CommentatorListItem[] = [];

  try {
    const rows = await prisma.commentator.findMany({
      include: {
        opinions: { select: { id: true, stance: true } },
      },
      orderBy: { name: "asc" },
    });

    commentators = rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      role: c.role,
      bio: c.bio,
      expertise: parseJson<string[]>(c.expertise, []),
      opinions: c.opinions,
    }));
  } catch {
    // DB unavailable — render empty state
  }

  return <YorumcularClient initialCommentators={commentators} />;
}

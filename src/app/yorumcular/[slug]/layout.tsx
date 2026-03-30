import type { Metadata } from "next";
import { prisma } from "@/database/db";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const commentator = await prisma.commentator.findUnique({
    where: { slug },
    select: { name: true, role: true, bio: true },
  }).catch(() => null);

  if (!commentator) {
    return { title: "Yorumcu | Var Odası" };
  }

  const title = `${commentator.name} — ${commentator.role} | Var Odası`;
  const description = `${commentator.name} yorumcusunun hakem kararları hakkındaki görüşleri ve istatistikleri. ${commentator.bio.slice(0, 100)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://varodasi.com/yorumcular/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://varodasi.com/yorumcular/${slug}`,
    },
  };
}

export default function CommentatorSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

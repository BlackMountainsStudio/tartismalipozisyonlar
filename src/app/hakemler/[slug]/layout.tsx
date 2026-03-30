import type { Metadata } from "next";
import { prisma } from "@/database/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const referee = await prisma.referee.findUnique({
    where: { slug },
    select: { name: true, role: true, bio: true },
  }).catch(() => null);

  if (!referee) {
    return { title: "Hakem | Var Odası" };
  }

  const roleLabel = referee.role === "VAR" ? "VAR Hakemi" : "Hakem";
  const title = `${referee.name} — ${roleLabel} | Var Odası`;
  const description = referee.bio
    ? `${referee.name} hakem kararları ve istatistikleri. ${referee.bio.slice(0, 120)}`
    : `${referee.name} hakeminin Süper Lig maçlarındaki tartışmalı kararlar ve istatistikleri.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://varodasi.com/hakemler/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://varodasi.com/hakemler/${slug}`,
    },
  };
}

export default function RefereeSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}

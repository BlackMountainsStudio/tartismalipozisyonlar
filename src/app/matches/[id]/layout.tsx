import type { Metadata } from "next";
import { prisma } from "@/database/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: matchSlug } = await params;

  const match = await prisma.match.findFirst({
    where: { slug: matchSlug },
    select: { homeTeam: true, awayTeam: true, week: true, league: true, date: true },
  }).catch(() => null);

  if (!match) {
    return { title: "Maç | Var Odası" };
  }

  const title = `${match.homeTeam} vs ${match.awayTeam} — Hafta ${match.week} | Var Odası`;
  const description = `${match.homeTeam} - ${match.awayTeam} maçının tartışmalı hakem kararları, VAR pozisyonları ve yorumcu görüşleri.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://varodasi.com/matches/${matchSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://varodasi.com/matches/${matchSlug}`,
    },
  };
}

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return children;
}

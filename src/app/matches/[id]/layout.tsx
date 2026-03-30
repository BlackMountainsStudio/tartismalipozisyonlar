import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/database/db";

interface MatchData {
  homeTeam: string;
  awayTeam: string;
  week: number;
  league: string;
  date: Date;
  slug: string | null;
}

async function getMatch(matchSlug: string): Promise<MatchData | null> {
  return prisma.match.findFirst({
    where: { slug: matchSlug },
    select: { homeTeam: true, awayTeam: true, week: true, league: true, date: true, slug: true },
  }).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: matchSlug } = await params;
  const match = await getMatch(matchSlug);

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

export default async function MatchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: matchSlug } = await params;
  const match = await getMatch(matchSlug);

  const jsonLd = match
    ? {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name: `${match.homeTeam} vs ${match.awayTeam}`,
        startDate: match.date.toISOString(),
        location: {
          "@type": "SportsActivityLocation",
          name: "Türkiye Süper Ligi",
        },
        homeTeam: { "@type": "SportsTeam", name: match.homeTeam },
        awayTeam: { "@type": "SportsTeam", name: match.awayTeam },
        url: `https://varodasi.com/matches/${matchSlug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <Script
          id={`json-ld-match-${matchSlug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}

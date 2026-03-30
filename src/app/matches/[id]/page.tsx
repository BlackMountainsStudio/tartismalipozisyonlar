import type { Metadata } from "next";
import { prisma } from "@/database/db";
import { buildIncidentSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import MatchPageClient from "./MatchPageClient";

export const revalidate = 60;

export async function generateStaticParams() {
  const matches = await prisma.match
    .findMany({
      where: { league: "Süper Lig 2025-26" },
      select: { slug: true, id: true },
      orderBy: { date: "desc" },
      take: 50,
    })
    .catch(() => []);
  return matches
    .filter((m) => m.slug)
    .map((m) => ({ id: m.slug as string }));
}

const SITE_URL = "https://varodasi.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const match = await prisma.match
    .findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      select: { homeTeam: true, awayTeam: true, league: true, week: true, slug: true },
    })
    .catch(() => null);

  if (!match) return { title: "Maç | Var Odası" };

  const title = `${match.homeTeam} vs ${match.awayTeam} Tartışmalı Pozisyonlar | Var Odası`;
  const description = `${match.homeTeam} - ${match.awayTeam} maçında yaşanan tartışmalı hakem kararlarını inceleyin. ${match.league} Hafta ${match.week}.`;
  const canonical = `${SITE_URL}/matches/${match.slug ?? slugOrId}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

function parseSources(sources: string): string[] {
  try { return JSON.parse(sources); } catch { return []; }
}

function parseOpinionSummary(opinions: { stance: string }[]): { agree: number; disagree: number; neutral: number } | null {
  if (opinions.length === 0) return null;
  const agree = opinions.filter((o) => o.stance === "AGREE").length;
  const disagree = opinions.filter((o) => o.stance === "DISAGREE").length;
  const neutral = opinions.filter((o) => o.stance === "NEUTRAL").length;
  if (agree + disagree + neutral === 0) return null;
  return { agree, disagree, neutral };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = await params;

  const match = await prisma.match.findFirst({
    where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
    select: {
      id: true,
      slug: true,
      homeTeam: true,
      awayTeam: true,
      league: true,
      week: true,
      date: true,
      note: true,
      homeScore: true,
      awayScore: true,
      referee: { select: { id: true, name: true, slug: true, role: true } },
      varReferee: { select: { id: true, name: true, slug: true, role: true } },
    },
  }).catch(() => null);

  if (!match) notFound();

  const dbIncidents = await prisma.incident.findMany({
    where: { matchId: match.id, status: "APPROVED" },
    select: {
      id: true,
      type: true,
      minute: true,
      description: true,
      confidenceScore: true,
      sources: true,
      status: true,
      videoUrl: true,
      slug: true,
      inFavorOf: true,
      against: true,
      opinions: { select: { stance: true } },
    },
    orderBy: { minute: "asc" },
  }).catch(() => []);

  const incidents = dbIncidents.map((inc) => {
    const { opinions, ...rest } = inc;
    return {
      ...rest,
      slug: inc.slug ?? buildIncidentSlug({ id: inc.id, minute: inc.minute, description: inc.description }),
      sources: parseSources(inc.sources),
      inFavorOf: inc.inFavorOf ?? null,
      against: inc.against ?? null,
      opinionSummary: parseOpinionSummary(opinions),
    };
  });

  return (
    <MatchPageClient
      match={{
        ...match,
        slug: match.slug ?? slugOrId,
        date: match.date.toISOString(),
        note: match.note ?? null,
        homeScore: match.homeScore ?? null,
        awayScore: match.awayScore ?? null,
        referee: match.referee ?? null,
        varReferee: match.varReferee ?? null,
      }}
      incidents={incidents}
    />
  );
}

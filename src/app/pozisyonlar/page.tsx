import type { Metadata } from "next";
import { prisma } from "@/database/db";
import { buildMatchSlug, buildIncidentSlug } from "@/lib/slug";
import PozisyonlarClient from "./PozisyonlarClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tartışmalı Pozisyonlar | Var Odası",
  description:
    "Süper Lig 2025-26 sezonundaki tüm tartışmalı hakem kararlarını inceleyin. Penaltı, kırmızı kart, ofsayt ve VAR pozisyonlarını filtreleyerek analiz edin.",
  alternates: { canonical: "https://varodasi.com/pozisyonlar" },
  openGraph: {
    title: "Tartışmalı Pozisyonlar | Var Odası",
    description:
      "Süper Lig 2025-26 sezonundaki tüm tartışmalı hakem kararlarını inceleyin.",
    url: "https://varodasi.com/pozisyonlar",
  },
};

const TYPE_TO_CATEGORY: Record<string, string> = {
  PENALTY: "penalty",
  POSSIBLE_PENALTY: "penalty",
  GOAL_DISALLOWED: "offside_goal",
  OFFSIDE: "offside_goal",
  POSSIBLE_OFFSIDE_GOAL: "offside_goal",
  RED_CARD: "card",
  YELLOW_CARD: "card",
  MISSED_RED_CARD: "card",
  MISSED_YELLOW: "card",
  FOUL: "foul_handball",
  HANDBALL: "foul_handball",
  VAR_CONTROVERSY: "other",
};

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

async function fetchInitialData() {
  const dbIncidents = await prisma.incident.findMany({
    where: {
      status: "APPROVED",
      match: { league: "Süper Lig 2025-26" },
    },
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
      match: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          week: true,
          date: true,
          league: true,
          slug: true,
        },
      },
    },
    orderBy: [{ minute: "asc" }, { confidenceScore: "desc" }],
    take: 200,
  });

  const incidents = dbIncidents.map((inc) => {
    const match = inc.match;
    const matchSlugComputed = match?.slug ?? (match ? buildMatchSlug({
      league: match.league,
      week: match.week,
      date: match.date,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
    }) : "");
    const incidentSlugComputed = inc.slug ?? buildIncidentSlug({
      id: inc.id,
      minute: inc.minute,
      description: inc.description,
    });
    const { opinions, ...incRest } = inc;
    return {
      ...incRest,
      slug: incidentSlugComputed,
      matchSlug: matchSlugComputed,
      sources: parseSources(inc.sources),
      inFavorOf: inc.inFavorOf ?? null,
      against: inc.against ?? null,
      opinionSummary: parseOpinionSummary(opinions),
      match: match
        ? {
            id: match.id,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            week: match.week,
            date: match.date.toISOString(),
          }
        : undefined,
    };
  });

  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  const byWeek: Record<number, number> = {};
  const byInFavorOf: Record<string, number> = {};
  const byAgainst: Record<string, number> = {};

  for (const inc of incidents) {
    byType[inc.type] = (byType[inc.type] ?? 0) + 1;
    const cat = TYPE_TO_CATEGORY[inc.type] ?? "other";
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
    if (inc.match) {
      byTeam[inc.match.homeTeam] = (byTeam[inc.match.homeTeam] ?? 0) + 1;
      byTeam[inc.match.awayTeam] = (byTeam[inc.match.awayTeam] ?? 0) + 1;
      byWeek[inc.match.week] = (byWeek[inc.match.week] ?? 0) + 1;
    }
    if (inc.inFavorOf) byInFavorOf[inc.inFavorOf] = (byInFavorOf[inc.inFavorOf] ?? 0) + 1;
    if (inc.against) byAgainst[inc.against] = (byAgainst[inc.against] ?? 0) + 1;
  }

  return {
    incidents,
    stats: {
      total: incidents.length,
      byType,
      byCategory,
      byTeam: Object.fromEntries(Object.entries(byTeam).sort((a, b) => b[1] - a[1])),
      byWeek,
      byInFavorOf: Object.fromEntries(Object.entries(byInFavorOf).sort((a, b) => b[1] - a[1])),
      byAgainst: Object.fromEntries(Object.entries(byAgainst).sort((a, b) => b[1] - a[1])),
    },
  };
}

export default async function PozisyonlarPage() {
  const data = await fetchInitialData().catch(() => null);

  return (
    <PozisyonlarClient
      initialIncidents={data?.incidents}
      initialStats={data?.stats}
    />
  );
}

import type { Metadata } from "next";
import { prisma } from "@/database/db";
import { buildMatchSlug, getShortIdFromIncidentSlug } from "@/lib/slug";
import { getResolvedVideoUrl } from "@/lib/incident-api";
import { notFound } from "next/navigation";
import IncidentPageClient from "./IncidentPageClient";

export const revalidate = 60;

const SITE_URL = "https://varodasi.com";

const TYPE_LABELS: Record<string, string> = {
  POSSIBLE_PENALTY: "Penaltı Pozisyonu",
  PENALTY: "Penaltı Kararı",
  POSSIBLE_OFFSIDE_GOAL: "Ofsayt Tartışması",
  OFFSIDE: "Ofsayt Kararı",
  MISSED_RED_CARD: "Verilmeyen Kırmızı Kart",
  MISSED_YELLOW: "Verilmeyen Sarı Kart",
  RED_CARD: "Kırmızı Kart",
  YELLOW_CARD: "Sarı Kart",
  VAR_CONTROVERSY: "VAR Tartışması",
  GOAL_DISALLOWED: "İptal Edilen Gol",
  FOUL: "Faul Kararı",
  HANDBALL: "El ile Temas",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; incidentSlug: string }>;
}): Promise<Metadata> {
  const { id: matchSlug, incidentSlug } = await params;

  const match = await prisma.match
    .findFirst({
      where: { slug: matchSlug },
      select: { homeTeam: true, awayTeam: true, incidents: { select: { id: true, slug: true, type: true, minute: true } } },
    })
    .catch(() => null);

  if (!match) return { title: "Pozisyon | Var Odası" };

  const shortId = getShortIdFromIncidentSlug(incidentSlug);
  const inc = match.incidents.find(
    (i) => i.slug === incidentSlug || (shortId && i.id.endsWith(shortId))
  );

  if (!inc) return { title: "Pozisyon | Var Odası" };

  const typeLabel = TYPE_LABELS[inc.type] ?? inc.type;
  const minuteStr = inc.minute != null ? `${inc.minute}. dk ` : "";
  const title = `${minuteStr}${typeLabel} — ${match.homeTeam} vs ${match.awayTeam} | Var Odası`;
  const description = `${match.homeTeam} - ${match.awayTeam} maçında yaşanan ${minuteStr}${typeLabel.toLowerCase()} pozisyonunu analiz edin.`;
  const canonical = `${SITE_URL}/matches/${matchSlug}/${incidentSlug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

function parseJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw); } catch { return fallback; }
}

export default async function IncidentPage({
  params,
}: {
  params: Promise<{ id: string; incidentSlug: string }>;
}) {
  const { id: matchSlug, incidentSlug } = await params;

  // Resolve match by slug
  let match = await prisma.match.findFirst({
    where: { slug: matchSlug },
    include: { incidents: { select: { id: true, slug: true } } },
  }).catch(() => null);

  if (!match) {
    // Fallback: compute slug from stored fields
    const allMatchesSlim = await prisma.match.findMany({
      select: { id: true, slug: true, league: true, week: true, date: true, homeTeam: true, awayTeam: true },
    }).catch(() => []);
    const found = allMatchesSlim.find(
      (m) =>
        buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }) ===
        matchSlug
    );
    if (found) {
      match = await prisma.match.findUnique({
        where: { id: found.id },
        include: { incidents: { select: { id: true, slug: true } } },
      }).catch(() => null);
    }
  }

  if (!match) notFound();

  const shortId = getShortIdFromIncidentSlug(incidentSlug);
  const incidentRow = match.incidents.find(
    (i) => i.slug === incidentSlug || (shortId && i.id.endsWith(shortId))
  );
  if (!incidentRow) notFound();

  const dbIncident = await prisma.incident.findUnique({
    where: { id: incidentRow.id },
    include: {
      match: {
        include: {
          referee: { select: { id: true, name: true, slug: true, role: true } },
          varReferee: { select: { id: true, name: true, slug: true, role: true } },
        },
      },
      opinions: { include: { commentator: true }, orderBy: { createdAt: "asc" } },
    },
  }).catch(() => null);

  if (!dbIncident) notFound();

  const resolvedVideoUrl = await getResolvedVideoUrl(dbIncident);

  const incident = {
    id: dbIncident.id,
    type: dbIncident.type,
    minute: dbIncident.minute,
    description: dbIncident.description,
    confidenceScore: dbIncident.confidenceScore,
    sources: parseJson<string[]>(dbIncident.sources, []),
    inFavorOf: dbIncident.inFavorOf ?? null,
    against: dbIncident.against ?? null,
    videoUrl: resolvedVideoUrl,
    relatedVideos: parseJson<{ url: string; title: string }[]>(dbIncident.relatedVideos, []),
    newsArticles: parseJson<{ title: string; url: string; source: string; author: string }[]>(
      dbIncident.newsArticles,
      []
    ),
    refereeComments: parseJson<
      { author?: string; text: string; sourceUrl?: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[]
    >(dbIncident.refereeComments, []),
    opinions: dbIncident.opinions.map((o) => ({
      id: o.id,
      comment: o.comment,
      stance: o.stance,
      sourceUrl: o.sourceUrl,
      commentator: {
        id: o.commentator.id,
        name: o.commentator.name,
        slug: o.commentator.slug,
        role: o.commentator.role,
      },
    })),
    status: dbIncident.status,
    match: dbIncident.match
      ? {
          id: dbIncident.match.id,
          homeTeam: dbIncident.match.homeTeam,
          awayTeam: dbIncident.match.awayTeam,
          league: dbIncident.match.league,
          week: dbIncident.match.week,
          date: dbIncident.match.date.toISOString(),
          referee: dbIncident.match.referee ?? null,
          varReferee: dbIncident.match.varReferee ?? null,
        }
      : null,
  };

  return <IncidentPageClient incident={incident} matchSlug={matchSlug} />;
}

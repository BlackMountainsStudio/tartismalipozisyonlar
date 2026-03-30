import type { Metadata } from "next";
import { prisma } from "@/database/db";

export const revalidate = 60;

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

  const incident = await prisma.incident.findFirst({
    where: { slug: incidentSlug },
    include: { match: { select: { homeTeam: true, awayTeam: true, week: true, league: true } } },
  }).catch(() => null);

  if (!incident) {
    return { title: "Pozisyon | Var Odası" };
  }

  const typeLabel = TYPE_LABELS[incident.type] ?? incident.type;
  const matchInfo = incident.match
    ? `${incident.match.homeTeam} vs ${incident.match.awayTeam}`
    : "";
  const minuteInfo = incident.minute != null ? ` — ${incident.minute}. dakika` : "";
  const title = `${typeLabel}${minuteInfo} | ${matchInfo} | Var Odası`;
  const description = `${incident.description.slice(0, 160)}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://varodasi.com/matches/${matchSlug}/${incidentSlug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://varodasi.com/matches/${matchSlug}/${incidentSlug}`,
    },
  };
}

export default function IncidentLayout({ children }: { children: React.ReactNode }) {
  return children;
}

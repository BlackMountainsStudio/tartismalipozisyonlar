import { prisma } from "@/database/db";
import { buildMatchSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import HakemDetailClient, { type RefereeDetailProps } from "./HakemDetailClient";

export const revalidate = 300;

export default async function HakemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const referee = await prisma.referee.findUnique({
    where: { slug },
    include: {
      matchesAsReferee: {
        include: {
          incidents: {
            where: { status: "APPROVED" },
            select: { id: true, type: true, minute: true, description: true, slug: true, varIntervention: true },
          },
        },
      },
      matchesAsVarReferee: {
        include: {
          incidents: {
            where: { status: "APPROVED" },
            select: { id: true, type: true, minute: true, description: true, slug: true, varIntervention: true },
          },
        },
      },
    },
  }).catch(() => null);

  if (!referee) notFound();

  const asReferee = referee.matchesAsReferee
    .filter((m) => m.incidents.length > 0)
    .map((m) => ({
      id: m.id,
      slug: m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date,
      roleInMatch: "REFEREE" as const,
      incidentCount: m.incidents.length,
      incidents: m.incidents,
    }));

  const asVarReferee = referee.matchesAsVarReferee
    .filter((m) => m.incidents.length > 0)
    .map((m) => ({
      id: m.id,
      slug: m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date,
      roleInMatch: "VAR" as const,
      incidentCount: m.incidents.length,
      incidents: m.incidents,
    }));

  const matchesWithIncidents: RefereeDetailProps["matchesWithIncidents"] = [
    ...asReferee,
    ...asVarReferee,
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((m) => ({
      id: m.id,
      slug: m.slug,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date.toISOString(),
      roleInMatch: m.roleInMatch,
      incidentCount: m.incidentCount,
    }));

  const refIncidents = referee.matchesAsReferee.flatMap((m) => m.incidents);
  const varIncidents = referee.matchesAsVarReferee.flatMap((m) => m.incidents);
  const allIncidents = [...refIncidents, ...varIncidents];

  const penalties = allIncidents.filter((i) => i.type === "PENALTY" || i.type === "POSSIBLE_PENALTY").length;
  const redCards = allIncidents.filter((i) => i.type === "RED_CARD" || i.type === "MISSED_RED_CARD").length;
  const yellowCards = allIncidents.filter((i) => i.type === "YELLOW_CARD" || i.type === "MISSED_YELLOW").length;
  const varInterventions =
    refIncidents.filter((i) => i.varIntervention).length + varIncidents.length;
  const totalMatches =
    referee.matchesAsReferee.length + referee.matchesAsVarReferee.length;

  const incidentsWithOpinions = await prisma.incident
    .findMany({
      where: { id: { in: allIncidents.map((i) => i.id) }, opinions: { some: {} } },
      include: { opinions: { select: { stance: true } } },
    })
    .catch(() => []);

  let agreeTotal = 0;
  let totalWithStance = 0;
  for (const inc of incidentsWithOpinions) {
    for (const op of inc.opinions) {
      if (op.stance === "AGREE" || op.stance === "DISAGREE") {
        totalWithStance += 1;
        if (op.stance === "AGREE") agreeTotal += 1;
      }
    }
  }
  const refereeRating =
    totalWithStance > 0 ? Math.round((agreeTotal / totalWithStance) * 100) / 10 : null;

  const refereeData: RefereeDetailProps = {
    id: referee.id,
    name: referee.name,
    slug: referee.slug,
    role: referee.role,
    bio: referee.bio ?? null,
    photoUrl: referee.photoUrl ?? null,
    matchesWithIncidents,
    stats: {
      totalMatches,
      penalties,
      redCards,
      yellowCards,
      varInterventions,
      controversialDecisions: allIncidents.length,
      refereeRating,
    },
  };

  return <HakemDetailClient referee={refereeData} />;
}

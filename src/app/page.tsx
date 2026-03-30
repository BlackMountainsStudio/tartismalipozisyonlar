import { prisma } from "@/database/db";
import { buildMatchSlug } from "@/lib/slug";
import HomeClient, { type MatchForHome } from "./HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  let matches: MatchForHome[] = [];

  try {
    const dbMatches = await prisma.match.findMany({
      where: { league: "Süper Lig 2025-26" },
      include: {
        referee: { select: { id: true, name: true, slug: true, role: true } },
        varReferee: { select: { id: true, name: true, slug: true, role: true } },
        incidents: {
          select: { id: true, type: true, status: true, confidenceScore: true },
        },
      },
      orderBy: { date: "desc" },
    });

    matches = dbMatches.map((m) => ({
      id: m.id,
      slug: m.slug ?? buildMatchSlug({ league: m.league, week: m.week, date: m.date, homeTeam: m.homeTeam, awayTeam: m.awayTeam }),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date.toISOString(),
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      incidents: m.incidents,
      referee: m.referee,
      varReferee: m.varReferee,
    }));
  } catch {
    // DB unavailable — render empty state; client handles it gracefully
  }

  return <HomeClient initialMatches={matches} />;
}

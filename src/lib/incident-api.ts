import { prisma } from "@/database/db";

export async function getResolvedVideoUrl(incident: {
  id: string;
  matchId: string;
  videoUrl: string | null;
  match: { date: Date };
}): Promise<string | null> {
  if (!incident.videoUrl) return null;
  const sameVideoIncidents = await prisma.incident.findMany({
    where: {
      videoUrl: incident.videoUrl,
      NOT: { id: incident.id },
    },
    select: {
      matchId: true,
      match: { select: { date: true } },
    },
  });
  const earliest = sameVideoIncidents
    .filter((item) => item.matchId !== incident.matchId)
    .reduce<number | null>((acc, item) => {
      const t = item.match.date.getTime();
      return acc === null ? t : Math.min(acc, t);
    }, null);
  if (
    earliest !== null &&
    incident.match.date.getTime() > earliest
  ) {
    return null;
  }
  return incident.videoUrl;
}

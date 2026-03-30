import type { MetadataRoute } from "next";
import { prisma } from "@/database/db";

const SITE_URL = "https://varodasi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/pozisyonlar`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/hakemler`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/yorumcular`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/superlig-tartismali-pozisyonlar-2025`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/rehber`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const [matches, incidents, referees, commentators] = await Promise.all([
      prisma.match.findMany({ select: { slug: true, updatedAt: true }, take: 500 }),
      prisma.incident.findMany({ select: { slug: true, updatedAt: true }, take: 1000 }),
      prisma.referee.findMany({ select: { slug: true, updatedAt: true }, take: 200 }),
      prisma.commentator.findMany({ select: { slug: true }, take: 200 }),
    ]);

    const matchRoutes: MetadataRoute.Sitemap = matches
      .filter((m) => m.slug)
      .map((m) => ({
        url: `${SITE_URL}/matches/${m.slug}`,
        lastModified: m.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const incidentRoutes: MetadataRoute.Sitemap = incidents
      .filter((i) => i.slug)
      .map((i) => ({
        url: `${SITE_URL}/pozisyonlar/${i.slug}`,
        lastModified: i.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      }));

    const refereeRoutes: MetadataRoute.Sitemap = referees
      .filter((r) => r.slug)
      .map((r) => ({
        url: `${SITE_URL}/hakemler/${r.slug}`,
        lastModified: r.updatedAt ?? now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    const commentatorRoutes: MetadataRoute.Sitemap = commentators
      .filter((c) => c.slug)
      .map((c) => ({
        url: `${SITE_URL}/yorumcular/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [
      ...staticRoutes,
      ...matchRoutes,
      ...incidentRoutes,
      ...refereeRoutes,
      ...commentatorRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}

import type { Metadata } from "next";
import { prisma } from "@/database/db";
import HakemlerClient, { type RefereeListItem } from "./HakemlerClient";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Hakemler | Var Odası",
  description:
    "Süper Lig hakemlerinin tartışmalı karar istatistiklerini inceleyin. Hakem başına penaltı, kırmızı kart ve VAR müdahalesi sayıları.",
  alternates: { canonical: "https://varodasi.com/hakemler" },
  openGraph: {
    title: "Hakemler | Var Odası",
    description:
      "Süper Lig hakemlerinin tartışmalı karar istatistiklerini inceleyin.",
    url: "https://varodasi.com/hakemler",
  },
};

export default async function HakemlerPage() {
  let referees: RefereeListItem[] = [];

  try {
    const rows = await prisma.referee.findMany({
      include: {
        matchesAsReferee: {
          select: {
            id: true,
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
        matchesAsVarReferee: {
          select: {
            id: true,
            incidents: { where: { status: "APPROVED" }, select: { id: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    referees = rows.map((r) => {
      const asRef = r.matchesAsReferee.filter((m) => m.incidents.length > 0);
      const asVar = r.matchesAsVarReferee.filter((m) => m.incidents.length > 0);
      const matchIds = new Set([...asRef.map((m) => m.id), ...asVar.map((m) => m.id)]);
      const totalIncidents =
        asRef.reduce((s, m) => s + m.incidents.length, 0) +
        asVar.reduce((s, m) => s + m.incidents.length, 0);
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        role: r.role,
        bio: r.bio,
        photoUrl: r.photoUrl,
        matchesWithIncidentsCount: matchIds.size,
        totalIncidentsInThoseMatches: totalIncidents,
      };
    });
  } catch {
    // DB unavailable — render empty state
  }

  return <HakemlerClient initialReferees={referees} />;
}

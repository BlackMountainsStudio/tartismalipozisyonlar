import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "@/database/db";

interface RefereeData {
  name: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
}

async function getReferee(slug: string): Promise<RefereeData | null> {
  return prisma.referee.findUnique({
    where: { slug },
    select: { name: true, role: true, bio: true, photoUrl: true },
  }).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const referee = await getReferee(slug);

  if (!referee) {
    return { title: "Hakem | Var Odası" };
  }

  const roleLabel = referee.role === "VAR" ? "VAR Hakemi" : "Hakem";
  const title = `${referee.name} — ${roleLabel} | Var Odası`;
  const description = referee.bio
    ? `${referee.name} hakem kararları ve istatistikleri. ${referee.bio.slice(0, 120)}`
    : `${referee.name} hakeminin Süper Lig maçlarındaki tartışmalı kararlar ve istatistikleri.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://varodasi.com/hakemler/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://varodasi.com/hakemler/${slug}`,
    },
  };
}

export default async function RefereeSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const referee = await getReferee(slug);

  const jsonLd = referee
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: referee.name,
        jobTitle: referee.role === "VAR" ? "VAR Hakemi" : "Futbol Hakemi",
        description: referee.bio ?? undefined,
        image: referee.photoUrl ?? undefined,
        url: `https://varodasi.com/hakemler/${slug}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <Script
          id={`json-ld-referee-${slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}

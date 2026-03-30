import { prisma } from "@/database/db";
import { buildMatchSlug } from "@/lib/slug";
import Link from "next/link";
import { Flame, Calendar, AlertTriangle } from "lucide-react";
import { matchUrl } from "@/lib/links";

export const revalidate = 300;

export default async function SuperLig2025ControversyPage() {
  const dbMatches = await prisma.match
    .findMany({
      where: {
        league: { contains: "Süper Lig" },
        date: { gte: new Date("2025-01-01"), lt: new Date("2026-01-01") },
        incidents: { some: { status: "APPROVED" } },
      },
      select: {
        id: true,
        slug: true,
        homeTeam: true,
        awayTeam: true,
        league: true,
        week: true,
        date: true,
        incidents: { where: { status: "APPROVED" }, select: { id: true } },
      },
      orderBy: { date: "asc" },
    })
    .catch(() => []);

  const ranked = dbMatches
    .map((m) => ({
      id: m.id,
      slug:
        m.slug ??
        buildMatchSlug({
          league: m.league,
          week: m.week,
          date: m.date,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
        }),
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      league: m.league,
      week: m.week,
      date: m.date.toISOString(),
      approved: m.incidents.length,
    }))
    .sort((a, b) => b.approved - a.approved);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <Flame className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          2025 Süper Lig Tartışmalı Pozisyonlar
        </h1>
        <p className="text-sm text-zinc-400">
          2025 takvim yılında Süper Lig&apos;de en çok tartışmalı pozisyon çıkan maçlar.
        </p>
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
          Henüz 2025 yılında kayıtlı tartışmalı pozisyon bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {ranked.map(({ id, slug, homeTeam, awayTeam, league, date, approved }, index) => (
            <Link
              key={id}
              href={matchUrl(slug)}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-red-500/40 hover:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-400">
                  #{index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {homeTeam} vs {awayTeam}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{league}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">
                  {approved} tartışmalı pozisyon
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

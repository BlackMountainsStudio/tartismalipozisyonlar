"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Flame, Calendar, AlertTriangle } from "lucide-react";
import { matchUrl } from "@/lib/links";

interface MatchSummary {
  id: string;
  slug?: string | null;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  incidents: { id: string; status: string }[];
}

export default function SuperLig2025ControversyPage() {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        const data = await res.json();
        const list: MatchSummary[] = Array.isArray(data) ? data : [];
        const filtered = list.filter((m) => {
          const year = new Date(m.date).getFullYear();
          return (
            m.league.toLowerCase().includes("süper lig") &&
            year === 2025
          );
        });
        setMatches(filtered);
      } catch {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const ranked = useMemo(() => {
    return [...matches]
      .map((m) => {
        const approved = m.incidents.filter((i) => i.status === "APPROVED").length;
        return { match: m, approved };
      })
      .filter((x) => x.approved > 0)
      .sort((a, b) => b.approved - a.approved);
  }, [matches]);

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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : ranked.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
          Henüz 2025 yılında kayıtlı tartışmalı pozisyon bulunmuyor.
        </div>
      ) : (
        <div className="space-y-4">
          {ranked.map(({ match, approved }, index) => (
            <Link
              key={match.id}
              href={matchUrl(match.slug ?? match.id)}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-red-500/40 hover:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-xs font-semibold text-red-400">
                  #{index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{match.league}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(match.date).toLocaleDateString("tr-TR", {
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


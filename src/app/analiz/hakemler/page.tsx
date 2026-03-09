"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trophy, ArrowUpDown, AlertTriangle } from "lucide-react";

interface RefereeStats {
  id: string;
  name: string;
  slug: string;
  role: string;
  matchesOfficiated: number;
  matchesAsVar: number;
  controversialDecisions: number;
  varInterventions: number;
}

type SortKey = "controversialDecisions" | "varInterventions" | "matchesOfficiated";

export default function RefereeAnalyticsPage() {
  const [stats, setStats] = useState<RefereeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("controversialDecisions");

  useEffect(() => {
    fetch("/api/statistics/referees", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStats(Array.isArray(d) ? d : []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...stats].sort((a, b) => {
    if (sortKey === "matchesOfficiated") {
      return b.matchesOfficiated - a.matchesOfficiated;
    }
    if (sortKey === "varInterventions") {
      return b.varInterventions - a.varInterventions;
    }
    return b.controversialDecisions - a.controversialDecisions;
  });

  const topReferee = sorted[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <Trophy className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Hakem Analizi ve Sıralama
        </h1>
        <p className="text-sm text-zinc-400">
          Hangi hakemler en çok tartışmalı karara imza atıyor? VAR&apos;a en çok kim gidiyor?
        </p>
      </div>

      {topReferee && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            En çok tartışmalı karar veren hakem
          </p>
          <Link
            href={`/hakemler/${topReferee.slug}`}
            className="inline-flex items-baseline gap-2 text-lg font-semibold text-white hover:text-red-400"
          >
            <span>{topReferee.name}</span>
            <span className="text-xs font-normal text-zinc-500">
              ({topReferee.controversialDecisions} tartışmalı karar)
            </span>
          </Link>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span>Toplam {stats.length} hakem</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Sırala:</span>
          <div className="flex rounded-xl border border-zinc-700 bg-zinc-900/70 p-0.5">
            {[
              { key: "controversialDecisions" as const, label: "Tartışmalı karar" },
              { key: "varInterventions" as const, label: "VAR müdahalesi" },
              { key: "matchesOfficiated" as const, label: "Yönettiği maç" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortKey(opt.key)}
                className={`min-h-[32px] rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  sortKey === opt.key
                    ? "bg-red-500/20 text-red-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 py-16 text-center text-sm text-zinc-400">
          Henüz hakem istatistiği bulunmuyor.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-5 gap-4 border-b border-zinc-800 px-4 py-3 text-xs font-medium text-zinc-500">
            <span>#</span>
            <span>Hakem</span>
            <span className="text-right">Tartışmalı karar</span>
            <span className="text-right">VAR müdahalesi</span>
            <span className="text-right">Yönettiği maç</span>
          </div>
          <div>
            {sorted.map((ref, index) => (
              <Link
                key={ref.id}
                href={`/hakemler/${ref.slug}`}
                className="grid grid-cols-5 gap-4 border-t border-zinc-800 px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-zinc-900"
              >
                <span className="text-xs text-zinc-500">{index + 1}</span>
                <span className="truncate">{ref.name}</span>
                <span className="text-right text-zinc-50">{ref.controversialDecisions}</span>
                <span className="text-right text-amber-400">{ref.varInterventions}</span>
                <span className="text-right text-zinc-300">{ref.matchesOfficiated}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


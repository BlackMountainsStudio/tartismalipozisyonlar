"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Users, ArrowUpDown, Shield } from "lucide-react";

interface TeamStats {
  teamName: string;
  slug: string;
  matches: number;
  incidentTotal: number;
  incidentsFor: number;
  incidentsAgainst: number;
  netBenefit: number;
}

type SortKey = "incidentTotal" | "netBenefit";

export default function TeamAnalyticsPage() {
  const [stats, setStats] = useState<TeamStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("incidentTotal");

  useEffect(() => {
    fetch("/api/statistics/teams", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStats(Array.isArray(d) ? d : []))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const copy = [...stats];
    if (sortKey === "netBenefit") {
      return copy.sort((a, b) => b.netBenefit - a.netBenefit);
    }
    return copy.sort((a, b) => b.incidentTotal - a.incidentTotal);
  }, [stats, sortKey]);

  const topBenefited = useMemo(
    () => [...stats].sort((a, b) => b.netBenefit - a.netBenefit)[0],
    [stats],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <Users className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Takım Tartışma Endeksi
        </h1>
        <p className="text-sm text-zinc-400">
          Hangi takımların maçlarında daha fazla tartışma çıkıyor? VAR kararlarından kim daha çok faydalanıyor?
        </p>
      </div>

      {topBenefited && (
        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            VAR kararlarından en çok faydalanan takım
          </p>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-semibold text-white">
              {topBenefited.teamName}
            </span>
            <span className="text-xs text-emerald-400">
              +{topBenefited.netBenefit} karar lehine
            </span>
            <span className="text-xs text-zinc-500">
              ({topBenefited.incidentsFor} lehine · {topBenefited.incidentsAgainst} aleyhine)
            </span>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Shield className="h-4 w-4 text-red-400" />
          <span>Toplam {stats.length} takım</span>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-zinc-500" />
          <span className="text-xs text-zinc-500">Sırala:</span>
          <div className="flex rounded-xl border border-zinc-700 bg-zinc-900/70 p-0.5">
            {[
              { key: "incidentTotal" as const, label: "Toplam tartışma" },
              { key: "netBenefit" as const, label: "Net fayda (VAR)" },
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
          Henüz takım istatistiği bulunmuyor.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="grid grid-cols-6 gap-4 border-b border-zinc-800 px-4 py-3 text-xs font-medium text-zinc-500">
            <span>#</span>
            <span>Takım</span>
            <span className="text-right">Maç</span>
            <span className="text-right">Toplam tartışma</span>
            <span className="text-right">Lehine / Aleyhine</span>
            <span className="text-right">Net fayda</span>
          </div>
          <div>
            {sorted.map((team, index) => (
              <div
                key={team.slug || team.teamName}
                className="grid grid-cols-6 gap-4 border-t border-zinc-800 px-4 py-3 text-sm text-zinc-200"
              >
                <span className="text-xs text-zinc-500">{index + 1}</span>
                <span className="truncate">
                  <Link
                    href={`/team/${team.slug}`}
                    className="text-zinc-100 hover:text-red-400"
                  >
                    {team.teamName}
                  </Link>
                </span>
                <span className="text-right text-zinc-300">{team.matches}</span>
                <span className="text-right text-zinc-50">{team.incidentTotal}</span>
                <span className="text-right text-xs text-zinc-300">
                  <span className="text-emerald-400">+{team.incidentsFor}</span>{" "}
                  /{" "}
                  <span className="text-red-400">-{team.incidentsAgainst}</span>
                </span>
                <span
                  className={`text-right text-xs ${
                    team.netBenefit > 0
                      ? "text-emerald-400"
                      : team.netBenefit < 0
                        ? "text-red-400"
                        : "text-zinc-400"
                  }`}
                >
                  {team.netBenefit > 0 ? "+" : ""}
                  {team.netBenefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


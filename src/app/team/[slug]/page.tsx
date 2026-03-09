"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, ArrowLeft, AlertTriangle } from "lucide-react";

interface TeamStats {
  teamName: string;
  slug: string;
  matches: number;
  incidentTotal: number;
  incidentsFor: number;
  incidentsAgainst: number;
  netBenefit: number;
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/statistics/teams", { cache: "no-store" });
        const data = await res.json();
        const list: TeamStats[] = Array.isArray(data) ? data : [];
        const found =
          list.find((t) => t.slug === slug) ??
          list.find((t) => t.teamName.toLowerCase().includes(slug.toLowerCase()));
        setStats(found ?? null);
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Takım bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.push("/analiz/takimlar")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Takım listesine dön
      </button>

      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{stats.teamName}</h1>
            <p className="text-sm text-zinc-400">Takım tartışma profili</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatBox label="Maç" value={stats.matches} />
          <StatBox label="Toplam tartışma" value={stats.incidentTotal} />
          <StatBox label="Lehine" value={stats.incidentsFor} positive />
          <StatBox label="Aleyhine" value={stats.incidentsAgainst} negative />
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-zinc-300">
            Net VAR etkisi:{" "}
            <span
              className={
                stats.netBenefit > 0
                  ? "font-semibold text-emerald-400"
                  : stats.netBenefit < 0
                    ? "font-semibold text-red-400"
                    : "font-semibold text-zinc-300"
              }
            >
              {stats.netBenefit > 0 ? "+" : ""}
              {stats.netBenefit}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  positive,
  negative,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
}) {
  const colorClass = positive
    ? "text-emerald-400"
    : negative
      ? "text-red-400"
      : "text-zinc-50";

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}


"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import IncidentCard from "@/components/IncidentCard";
import IncidentRadarSection from "@/components/IncidentRadarSection";
import ShareButtons from "@/components/ShareButtons";
import {
  Shield,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  BarChart3,
  X,
} from "lucide-react";
import {
  getCategoryKey,
  CATEGORY_ORDER,
  INCIDENT_CATEGORIES,
  INCIDENT_TYPE_LABELS,
} from "@/lib/incidentCategories";

const IncidentHeatmap = dynamic(() => import("@/components/IncidentHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
    </div>
  ),
});

const TEAM_PILL_STYLES: Record<string, { accent: string; ring: string }> = {
  Fenerbahçe: { accent: "bg-amber-500/15 text-amber-400 ring-amber-500/40", ring: "ring-2 ring-amber-500/50" },
  Galatasaray: { accent: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/40", ring: "ring-2 ring-yellow-500/50" },
  Beşiktaş: { accent: "bg-white/15 text-zinc-200 ring-zinc-400/40", ring: "ring-2 ring-zinc-400/50" },
  Trabzonspor: { accent: "bg-blue-600/15 text-blue-400 ring-blue-500/40", ring: "ring-2 ring-blue-500/50" },
};
const CATEGORY_PILL_ACTIVE = "border-transparent bg-red-500/15 text-red-400 ring-2 ring-red-500/50 shadow-lg";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  videoUrl?: string | null;
  slug?: string;
  matchSlug?: string;
  inFavorOf?: string | null;
  against?: string | null;
  opinionSummary?: { agree: number; disagree: number; neutral: number } | null;
  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    week: number;
    date: string;
  };
}

interface Stats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byTeam: Record<string, number>;
  byWeek: Record<number, number>;
  byInFavorOf?: Record<string, number>;
  byAgainst?: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  penalty: "Penaltı pozisyonları",
  offside_goal: "Ofsayt / Gol iptali",
  card: "Kart pozisyonları",
  foul_handball: "Faul / El",
  other: "Diğer",
};

const BIG_FOUR_TEAMS = ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"] as const;

interface PozisyonlarClientProps {
  initialIncidents?: Incident[];
  initialStats?: Stats;
}

export default function PozisyonlarClient({ initialIncidents, initialStats }: PozisyonlarClientProps = {}) {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents ?? []);
  const [stats, setStats] = useState<Stats | null>(initialStats ?? null);
  const [loading, setLoading] = useState(!initialIncidents);
  const serverDataConsumed = useRef(!initialIncidents);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [favorFilter, setFavorFilter] = useState<{ type: "inFavorOf" | "against"; team: string } | null>(null);
  const [radarScope, setRadarScope] = useState<"current" | "all">("current");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", "APPROVED");
      if (selectedTeams.length > 0) params.set("team", selectedTeams.join(","));
      if (selectedTypes.length > 0) params.set("type", selectedTypes.join(","));
      if (favorFilter) params.set(favorFilter.type, favorFilter.team);

      const [incRes, statsRes] = await Promise.all([
        fetch(`/api/incidents?${params}`, { cache: "no-store" }),
        fetch(`/api/incidents/stats?${params}`, { cache: "no-store" }),
      ]);
      const incData = await incRes.json();
      const statsData = await statsRes.json();

      const incList = Array.isArray(incData?.data) ? incData.data : (Array.isArray(incData) ? incData : []);
      setIncidents(incList.filter((i: unknown): i is Incident => i != null && typeof i === "object"));
      setStats(statsData && typeof statsData === "object" ? statsData : null);
    } catch (err) {
      console.error("Failed to fetch pozisyonlar:", err);
      setIncidents([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTeams, selectedTypes, favorFilter]);

  useEffect(() => {
    if (!serverDataConsumed.current) {
      serverDataConsumed.current = true;
      return; // Skip initial fetch — server data already provided
    }
    fetchData();
  }, [fetchData]);

  const teams = stats && typeof stats.byTeam === "object" && stats.byTeam != null
    ? (Object.keys(stats.byTeam) as string[])
        .filter((t) => (BIG_FOUR_TEAMS as readonly string[]).includes(t))
        .sort((a, b) => (stats.byTeam[b] ?? 0) - (stats.byTeam[a] ?? 0))
    : [];

  const sorted = [...incidents].filter((i): i is Incident => i != null && typeof i === "object").sort(
    (a, b) => (a.minute ?? 999) - (b.minute ?? 999)
  );
  const byCategory = sorted.reduce<Record<string, Incident[]>>((acc, inc) => {
    const key = getCategoryKey(inc.type);
    if (!acc[key]) acc[key] = [];
    acc[key].push(inc);
    return acc;
  }, {});

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTeams([]);
    setSelectedTypes([]);
    setFavorFilter(null);
  };

  const hasFilters = selectedTeams.length > 0 || selectedTypes.length > 0 || favorFilter != null;

  const favorTeams = stats && (stats.byInFavorOf || stats.byAgainst)
    ? [...new Set([
        ...Object.keys(stats.byInFavorOf ?? {}),
        ...Object.keys(stats.byAgainst ?? {}),
      ])].sort((a, b) => {
        const aTotal = (stats.byInFavorOf?.[a] ?? 0) + (stats.byAgainst?.[a] ?? 0);
        const bTotal = (stats.byInFavorOf?.[b] ?? 0) + (stats.byAgainst?.[b] ?? 0);
        return bTotal - aTotal;
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Var <span className="text-red-500">Odası</span>
            </h1>
            <p className="mt-2 text-zinc-400">
              Türe, takıma ve lehine/aleyhine durumuna göre filtreleyip grupları açıp kapatabilirsiniz.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ShareButtons title="Var Odası - Tartışmalı Pozisyonlar" />
          </div>
        </div>
      </div>

      {/* Özet / sonuç sayısı ve lehine-aleyhine istatistikleri */}
      {stats && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium text-zinc-400">Sonuç</span>
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
            <span className="text-zinc-500">pozisyon</span>
            {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Filtreleri temizle
            </button>
          )}
          </div>

          {/* Lehine / Aleyhine istatistikleri */}
          {(stats.byInFavorOf && Object.keys(stats.byInFavorOf).length > 0) ||
          (stats.byAgainst && Object.keys(stats.byAgainst).length > 0) ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="mb-3 text-sm font-medium text-zinc-400">Pozisyonlar takım bazında (lehine / aleyhine)</p>
              <div className="flex flex-wrap gap-4">
                {[...new Set([
                  ...Object.keys(stats.byInFavorOf ?? {}),
                  ...Object.keys(stats.byAgainst ?? {}),
                ])].sort((a, b) => {
                  const aTotal = (stats.byInFavorOf?.[a] ?? 0) + (stats.byAgainst?.[a] ?? 0);
                  const bTotal = (stats.byInFavorOf?.[b] ?? 0) + (stats.byAgainst?.[b] ?? 0);
                  return bTotal - aTotal;
                }).map((team) => {
                  const lehine = stats.byInFavorOf?.[team] ?? 0;
                  const aleyhine = stats.byAgainst?.[team] ?? 0;
                  const style = TEAM_PILL_STYLES[team];
                  return (
                    <div
                      key={team}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                        style ? `${style.ring} border-transparent` : "border-zinc-700"
                      }`}
                    >
                      <span className="font-medium text-white">{team}</span>
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400" title="Lehine">
                          +{lehine}
                        </span>
                        <span className="text-zinc-600">/</span>
                        <span className="text-red-400" title="Aleyhine">
                          −{aleyhine}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Dakika bazlı heatmap */}
      {incidents.length > 0 && (
        <div className="mb-8">
          <IncidentHeatmap
            incidents={incidents.map((i) => ({ minute: i.minute, type: i.type }))}
            title="Pozisyon yoğunluğu (dakika dilimleri)"
          />
        </div>
      )}

      {/* Radar görselleştirme */}
      {(incidents.length > 0 || radarScope === "all") && (
        <div className="mb-8">
          <IncidentRadarSection
            currentIncidents={incidents.map((i) => ({
              id: i.id,
              type: i.type,
              minute: i.minute,
              inFavorOf: i.inFavorOf,
              against: i.against,
              opinionSummary: i.opinionSummary,
              match: i.match,
            }))}
            scope={radarScope}
            onScopeChange={setRadarScope}
            allDataFetchParams={{
              ...(selectedTeams.length > 0 && { team: selectedTeams.join(",") }),
              ...(selectedTypes.length > 0 && { type: selectedTypes.join(",") }),
              ...(favorFilter && { [favorFilter.type]: favorFilter.team }),
            }}
            mode="aggregate"
            showScopeToggle={true}
          />
        </div>
      )}

      {/* Filtreler */}
      <div className="mb-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
          <Filter className="h-4 w-4" />
          Filtreler
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Takıma göre
          </p>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => {
              const count = stats?.byTeam[team] ?? 0;
              const active = selectedTeams.includes(team);
              const style = TEAM_PILL_STYLES[team];
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => toggleTeam(team)}
                  className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    active && style
                      ? `${style.accent} ${style.ring} border-transparent shadow-lg`
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {team}
                  <span className="ml-1.5 text-zinc-500">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            Pozisyon türüne göre
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((key) => {
              const count = stats?.byCategory != null && typeof stats.byCategory === "object" ? (stats.byCategory[key] ?? 0) : 0;
              const typesInCategory = Object.entries(INCIDENT_CATEGORIES)
                .filter(([, v]) => v.key === key)
                .map(([t]) => t);
              const allSelected =
                typesInCategory.length > 0 &&
                typesInCategory.every((t) => selectedTypes.includes(t));
              const someSelected =
                typesInCategory.some((t) => selectedTypes.includes(t));
              const active = selectedTypes.length > 0 && someSelected;
              const toggleCategoryFilter = () => {
                if (allSelected) {
                  setSelectedTypes((prev) =>
                    prev.filter((t) => !typesInCategory.includes(t))
                  );
                } else {
                  setSelectedTypes((prev) =>
                    [...new Set([...prev, ...typesInCategory])]
                  );
                }
              };
              return (
                <button
                  key={key}
                  type="button"
                  onClick={toggleCategoryFilter}
                  className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                    active
                      ? CATEGORY_PILL_ACTIVE
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {CATEGORY_LABELS[key] ?? key}
                  <span className="ml-1.5 text-zinc-500">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lehine / Aleyhine filtre */}
        {favorTeams.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Lehine / Aleyhine
            </p>
            <div className="flex flex-wrap gap-2">
              {favorTeams.flatMap((team) => {
                const lehineCount = stats?.byInFavorOf?.[team] ?? 0;
                const aleyhineCount = stats?.byAgainst?.[team] ?? 0;
                const style = TEAM_PILL_STYLES[team];
                return [
                  lehineCount > 0 && (
                    <button
                      key={`${team}-lehine`}
                      type="button"
                      onClick={() =>
                        setFavorFilter((prev) =>
                          prev?.type === "inFavorOf" && prev.team === team
                            ? null
                            : { type: "inFavorOf", team }
                        )
                      }
                      className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        favorFilter?.type === "inFavorOf" && favorFilter.team === team && style
                          ? `${style.accent} ${style.ring} border-transparent shadow-lg`
                          : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      {team} lehine
                      <span className="ml-1.5 text-zinc-500">({lehineCount})</span>
                    </button>
                  ),
                  aleyhineCount > 0 && (
                    <button
                      key={`${team}-aleyhine`}
                      type="button"
                      onClick={() =>
                        setFavorFilter((prev) =>
                          prev?.type === "against" && prev.team === team
                            ? null
                            : { type: "against", team }
                        )
                      }
                      className={`min-h-[44px] rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                        favorFilter?.type === "against" && favorFilter.team === team && style
                          ? `${style.accent} ${style.ring} border-transparent shadow-lg`
                          : "border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                      }`}
                    >
                      {team} aleyhine
                      <span className="ml-1.5 text-zinc-500">({aleyhineCount})</span>
                    </button>
                  ),
                ].filter(Boolean);
              })}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <Shield className="mb-4 h-12 w-12 text-zinc-700" />
          <p className="text-lg text-zinc-400">Bu filtrelerde pozisyon bulunamadı</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-white"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORY_ORDER.map((key) => {
            const list = byCategory[key] ?? [];
            if (list.length === 0) return null;
            const label = CATEGORY_LABELS[key] ?? key;
            const expanded = expandedCategories.has(key);
            return (
              <section
                key={key}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleCategory(key)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    {expanded ? (
                      <ChevronDown className="h-5 w-5 text-zinc-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-zinc-500" />
                    )}
                    <span className="font-semibold text-white">{label}</span>
                    <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                      {list.length} pozisyon
                    </span>
                  </div>
                </button>
                {expanded && (
                  <div className="space-y-4 border-t border-zinc-800 p-5 pt-4">
                    {list
                      .filter((incident): incident is Incident => incident != null && typeof incident === "object")
                      .map((incident) => (
                      <IncidentCard
                        key={incident.id}
                        id={incident.id}
                        type={incident.type}
                        minute={incident.minute}
                        description={incident.description}
                        confidenceScore={incident.confidenceScore}
                        sources={incident.sources}
                        status={incident.status}
                        videoUrl={incident.videoUrl}
                        inFavorOf={incident.inFavorOf}
                        against={incident.against}
                        matchInfo={
                          incident.match
                            ? `${incident.match.homeTeam} vs ${incident.match.awayTeam}`
                            : undefined
                        }
                        refereeLabel={incident.type ? INCIDENT_TYPE_LABELS[incident.type] : undefined}
                        opinionSummary={incident.opinionSummary ?? undefined}
                        matchSlug={incident.matchSlug}
                        incidentSlug={incident.slug}
                        clickable
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

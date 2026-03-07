"use client";

import { useState, useEffect, useCallback } from "react";
import IncidentCard from "@/components/IncidentCard";
import {
  getCategoryKey,
  CATEGORY_ORDER,
  INCIDENT_CATEGORIES,
} from "@/lib/incidentCategories";
import {
  Shield,
  Loader2,
  Filter,
  ChevronDown,
  ChevronRight,
  BarChart3,
  X,
} from "lucide-react";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  videoUrl?: string | null;
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
}

const CATEGORY_LABELS: Record<string, string> = {
  penalty: "Penaltı pozisyonları",
  offside_goal: "Ofsayt / Gol iptali",
  card: "Kart pozisyonları",
  foul_handball: "Faul / El",
  other: "Diğer",
};

const BIG_FOUR_TEAMS = ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"] as const;

export default function PozisyonlarPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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

      const [incRes, statsRes] = await Promise.all([
        fetch(`/api/incidents?${params}`),
        fetch(`/api/incidents/stats?${params}`),
      ]);
      const incData = await incRes.json();
      const statsData = await statsRes.json();

      setIncidents(Array.isArray(incData) ? incData : []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch pozisyonlar:", err);
      setIncidents([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedTeams, selectedTypes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const teams = stats
    ? (Object.keys(stats.byTeam) as string[])
        .filter((t) => (BIG_FOUR_TEAMS as readonly string[]).includes(t))
        .sort((a, b) => (stats.byTeam[b] ?? 0) - (stats.byTeam[a] ?? 0))
    : [];

  const sorted = [...incidents].sort(
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
  };

  const hasFilters = selectedTeams.length > 0 || selectedTypes.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Tartışmalı Pozisyonlar
        </h1>
        <p className="mt-2 text-zinc-400">
          Türe ve takıma göre filtreleyip grupları açıp kapatabilirsiniz. İstatistik sayfası bir sonraki adımda eklenecek.
        </p>
      </div>

      {/* Özet / sonuç sayısı */}
      {stats && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
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
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Filtreleri temizle
            </button>
          )}
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
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => toggleTeam(team)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-red-500/50 bg-red-500/20 text-red-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
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
              const count = stats?.byCategory[key] ?? 0;
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
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-red-500/50 bg-red-500/20 text-red-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-700"
                  }`}
                >
                  {CATEGORY_LABELS[key] ?? key}
                  <span className="ml-1.5 text-zinc-500">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
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
            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
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
                    {list.map((incident) => (
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
                        matchInfo={
                          incident.match
                            ? `${incident.match.homeTeam} vs ${incident.match.awayTeam}`
                            : undefined
                        }
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

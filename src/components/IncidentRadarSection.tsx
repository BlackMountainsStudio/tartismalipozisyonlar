"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import MatchRadarChart, {
  type RadarIncident,
  type RadarChartMode,
} from "@/components/MatchRadarChart";
import { Loader2 } from "lucide-react";

export type RadarDataScope = "current" | "all";

interface IncidentRadarSectionProps {
  /** Mevcut sayfa verisi (tek maç, filtrelenmiş pozisyonlar vb.) */
  currentIncidents: RadarIncident[];
  /** Tek maç modunda kullanılacak takımlar */
  currentHomeTeam?: string;
  currentAwayTeam?: string;
  /** Kapsam: "current" = sadece mevcut veri, "all" = tüm maçlar/pozisyonlar */
  scope: RadarDataScope;
  onScopeChange: (scope: RadarDataScope) => void;
  /** "all" seçildiğinde kullanılacak ek API parametreleri */
  allDataFetchParams?: Record<string, string>;
  /** Başlık (opsiyonel) */
  title?: string;
  /** Sadece aggregate modda göster (örn. pozisyonlar sayfası) */
  mode?: RadarChartMode;
  /** Aggregate modda kullanılacak takım listesi */
  availableTeams?: string[];
  /** Kapsam seçimini gizle (örn. ana sayfada sadece "tüm maçlar") */
  showScopeToggle?: boolean;
  /** Veri yüklendiğinde çağrılır (incident sayısı) */
  onDataLoaded?: (count: number) => void;
  /** Hakem seçici göster (hakem detay sayfası vb.) */
  enableRefereeFilter?: boolean;
  /** Hakem filtresi için başlangıç slug (örn. mevcut sayfa hakemi) */
  initialRefereeSlug?: string;
  className?: string;
}

export default function IncidentRadarSection({
  currentIncidents,
  currentHomeTeam = "",
  currentAwayTeam = "",
  scope,
  onScopeChange,
  allDataFetchParams = {},
  title = "Karar Radar Görselleştirmesi",
  mode = "single_match",
  availableTeams: availableTeamsProp,
  showScopeToggle = true,
  onDataLoaded,
  enableRefereeFilter = false,
  initialRefereeSlug,
  className = "",
}: IncidentRadarSectionProps) {
  const [allIncidents, setAllIncidents] = useState<RadarIncident[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [referees, setReferees] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [refereeFilterMode, setRefereeFilterMode] = useState<"all" | "select">(
    () => (initialRefereeSlug ? "select" : "all")
  );
  const [selectedRefereeSlugs, setSelectedRefereeSlugs] = useState<Set<string>>(
    () => (initialRefereeSlug ? new Set([initialRefereeSlug]) : new Set())
  );

  const fetchReferees = useCallback(async () => {
    try {
      const res = await fetch("/api/referees", { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setReferees(list.filter((r: { matchesWithIncidentsCount?: number }) => (r.matchesWithIncidentsCount ?? 0) > 0));
    } catch {
      setReferees([]);
    }
  }, []);

  useEffect(() => {
    if (enableRefereeFilter) fetchReferees();
  }, [enableRefereeFilter, fetchReferees]);

  const effectiveFetchParams = useMemo(() => {
    const base = { ...allDataFetchParams };
    if (enableRefereeFilter && refereeFilterMode === "select" && selectedRefereeSlugs.size > 0) {
      base.refereeSlug = [...selectedRefereeSlugs].join(",");
    }
    return base;
  }, [allDataFetchParams, enableRefereeFilter, refereeFilterMode, selectedRefereeSlugs]);

  const fetchAllIncidents = useCallback(async () => {
    setLoadingAll(true);
    try {
      const params = new URLSearchParams({
        status: "APPROVED",
        ...effectiveFetchParams,
      });
      const res = await fetch(`/api/incidents?${params}`, { cache: "no-store" });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAllIncidents(
        list.map((i: { id: string; type: string; minute?: number | null; inFavorOf?: string | null; against?: string | null; opinionSummary?: { agree: number; disagree: number; neutral: number } | null; match?: { homeTeam: string; awayTeam: string } }) => ({
          id: i.id,
          type: i.type,
          minute: i.minute,
          inFavorOf: i.inFavorOf,
          against: i.against,
          opinionSummary: i.opinionSummary,
          match: i.match,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch all incidents:", err);
      setAllIncidents([]);
    } finally {
      setLoadingAll(false);
    }
  }, [effectiveFetchParams]);

  const effectiveScope = showScopeToggle ? scope : "all";

  useEffect(() => {
    if (effectiveScope === "all") {
      fetchAllIncidents();
    }
  }, [effectiveScope, fetchAllIncidents]);

  const incidents =
    effectiveScope === "all" ? allIncidents : currentIncidents;

  useEffect(() => {
    if (!loadingAll && onDataLoaded) {
      onDataLoaded(incidents.length);
    }
  }, [incidents.length, loadingAll, onDataLoaded]);

  const chartMode: RadarChartMode =
    mode === "aggregate" || effectiveScope === "all"
      ? "aggregate"
      : "single_match";
  const homeTeam = effectiveScope === "all" ? undefined : currentHomeTeam;
  const awayTeam = effectiveScope === "all" ? undefined : currentAwayTeam;

  const hasData = incidents.length > 0;
  if (!hasData && scope === "current" && showScopeToggle) {
    return null;
  }
  if (!hasData && !showScopeToggle && effectiveScope === "all" && !loadingAll && !enableRefereeFilter) {
    return null;
  }

  return (
    <div className={`mb-10 ${className}`}>
      {showScopeToggle && (
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className="text-xs text-zinc-500">Radar kapsamı:</span>
        <button
          type="button"
          onClick={() => onScopeChange("current")}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            scope === "current"
              ? "bg-red-500/20 text-red-400"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          {mode === "aggregate" ? "Seçili veriler" : "Bu maç"}
        </button>
        <button
          type="button"
          onClick={() => onScopeChange("all")}
          disabled={loadingAll}
          className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            scope === "all"
              ? "bg-red-500/20 text-red-400"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50"
          }`}
        >
          {loadingAll ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Yükleniyor…
            </span>
          ) : (
            "Tüm maçlar" 
          )}
        </button>
      </div>
      )}

      {loadingAll && effectiveScope === "all" ? (
        <div className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : (
        <>
          {enableRefereeFilter && referees.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-500">Hakemler:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRefereeFilterMode("all")}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                    refereeFilterMode === "all"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Hepsi
                </button>
                <button
                  type="button"
                  onClick={() => setRefereeFilterMode("select")}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                    refereeFilterMode === "select"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  Seç
                </button>
              </div>
              {refereeFilterMode === "select" && (
                <div className="flex flex-wrap items-center gap-2">
                  {referees.map((ref) => (
                    <label
                      key={ref.id}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1 transition-colors hover:bg-zinc-800"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRefereeSlugs.has(ref.slug)}
                        onChange={() => {
                          const next = new Set(selectedRefereeSlugs);
                          if (next.has(ref.slug)) {
                            if (next.size <= 1) return;
                            next.delete(ref.slug);
                          } else {
                            next.add(ref.slug);
                          }
                          setSelectedRefereeSlugs(next);
                        }}
                        className="h-3 w-3 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-xs text-zinc-300">{ref.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          <MatchRadarChart
            incidents={incidents}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            mode={chartMode}
            availableTeams={availableTeamsProp}
          />
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
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
  className = "",
}: IncidentRadarSectionProps) {
  const [allIncidents, setAllIncidents] = useState<RadarIncident[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const fetchAllIncidents = useCallback(async () => {
    setLoadingAll(true);
    try {
      const params = new URLSearchParams({
        status: "APPROVED",
        ...allDataFetchParams,
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
  }, [allDataFetchParams]);

  const effectiveScope = showScopeToggle ? scope : "all";

  useEffect(() => {
    if (effectiveScope === "all") {
      fetchAllIncidents();
    }
  }, [effectiveScope, fetchAllIncidents]);

  const incidents =
    effectiveScope === "all" ? allIncidents : currentIncidents;
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
        <MatchRadarChart
          incidents={incidents}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          mode={chartMode}
          availableTeams={availableTeamsProp}
        />
      )}
    </div>
  );
}

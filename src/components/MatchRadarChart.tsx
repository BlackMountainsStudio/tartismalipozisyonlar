"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  getCategoryKey,
  CATEGORY_ORDER,
  getIncidentImpactPoints,
} from "@/lib/incidentCategories";

export interface RadarIncident {
  id: string;
  type: string;
  minute?: number | null;
  inFavorOf?: string | null;
  against?: string | null;
  opinionSummary?: { agree: number; disagree: number; neutral: number } | null;
  match?: { homeTeam: string; awayTeam: string };
}

export type RadarChartMode = "single_match" | "aggregate";

interface MatchRadarChartProps {
  incidents: RadarIncident[];
  /** Tek maç modunda zorunlu; aggregate modda seçilen takımlar */
  homeTeam?: string;
  awayTeam?: string;
  /** Aggregate modda: tüm maçlar/pozisyonlar dahil, takım seçimi göster */
  mode?: RadarChartMode;
  /** Aggregate modda kullanılacak takım listesi (boşsa incident'lerden türetilir) */
  availableTeams?: string[];
  className?: string;
}

/** Radar grafiğinde kullanılacak eksen seti tipi */
type ChartAxisSetType = "decision" | "position";

/** Değer gösterim modu: sayı adedi veya puan */
type ValueDisplayMode = "count" | "points";

/** Dakika filtresi modu */
type MinuteFilterMode = "whole_match" | "minute_range";

/** Karar tipi eksen tanımları - Lehine/Aleyhine ve Doğru/Yanlış karşılıklı */
const COMMON_DECISION_AXIS_DEFINITIONS = [
  { key: "lehine", label: "Takım lehine verilen kararlar", shortLabel: "Lehine" },
  { key: "correct", label: "Yorumculara göre doğru karar", shortLabel: "Doğru Karar" },
  { key: "aleyhine", label: "Takım aleyhine verilen kararlar", shortLabel: "Aleyhine" },
  { key: "wrong", label: "Yorumculara göre yanlış karar", shortLabel: "Yanlış Karar" },
] as const;

/** Pozisyon tipi eksen tanımları */
const POSITION_AXIS_DEFINITIONS = CATEGORY_ORDER.map((categoryKey) => ({
  key: categoryKey,
  label:
    categoryKey === "penalty"
      ? "Penaltı pozisyonları (verilen / verilmeyen)"
      : categoryKey === "offside_goal"
        ? "Ofsayt ve gol iptali pozisyonları"
        : categoryKey === "card"
          ? "Kart pozisyonları (sarı / kırmızı)"
          : categoryKey === "foul_handball"
            ? "Faul ve el ile temas pozisyonları"
            : "Diğer tartışmalı pozisyonlar",
  shortLabel:
    categoryKey === "penalty"
      ? "Penaltı"
      : categoryKey === "offside_goal"
        ? "Ofsayt"
        : categoryKey === "card"
          ? "Kart"
          : categoryKey === "foul_handball"
            ? "Faul / El"
            : "Diğer",
}));

const MINUTE_SLIDER_MAX = 120;

/** Radar grafiğinde kullanılacak sabit 4 takım */
const RADAR_TEAMS = ["Fenerbahçe", "Galatasaray", "Beşiktaş", "Trabzonspor"] as const;

const TEAM_CHART_COLORS = [
  { stroke: "#ef4444", fill: "#ef4444" },
  { stroke: "#3b82f6", fill: "#3b82f6" },
  { stroke: "#22c55e", fill: "#22c55e" },
  { stroke: "#eab308", fill: "#eab308" },
];

export default function MatchRadarChart({
  incidents,
  homeTeam: homeTeamProp,
  awayTeam: awayTeamProp,
  mode = "single_match",
  availableTeams: availableTeamsProp,
  className = "",
}: MatchRadarChartProps) {
  const availableTeams = useMemo(
    () => (availableTeamsProp?.length ? availableTeamsProp : [...RADAR_TEAMS]),
    [availableTeamsProp]
  );
  const defaultSelectedTeams = useMemo(
    () => availableTeams.slice(0, 4),
    [availableTeams]
  );

  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(
    () => new Set(defaultSelectedTeams)
  );

  const toggleTeamSelection = (team: string) => {
    setSelectedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(team)) {
        if (next.size <= 2) return prev;
        next.delete(team);
      } else {
        if (next.size >= 4) return prev;
        next.add(team);
      }
      return next;
    });
  };

  const visibleTeams = useMemo(
    () =>
      mode === "single_match"
        ? [homeTeamProp!, awayTeamProp!].filter(Boolean)
        : [...selectedTeams].sort(),
    [mode, homeTeamProp, awayTeamProp, selectedTeams]
  );

  useEffect(() => {
    if (mode === "aggregate" && availableTeams.length >= 2) {
      setSelectedTeams((prev) => {
        const valid = new Set(prev);
        valid.forEach((t) => {
          if (!availableTeams.includes(t)) valid.delete(t);
        });
        if (valid.size < 2) {
          return new Set(availableTeams.slice(0, 4));
        }
        return valid;
      });
    }
  }, [mode, availableTeams]);

  const [chartAxisSetType, setChartAxisSetType] = useState<ChartAxisSetType>("decision");
  const [valueDisplayMode, setValueDisplayMode] = useState<ValueDisplayMode>("count");
  const [selectedPositionCategoryFilters, setSelectedPositionCategoryFilters] = useState<Set<string>>(
    () => new Set(CATEGORY_ORDER)
  );
  const [minuteFilterMode, setMinuteFilterMode] = useState<MinuteFilterMode>("whole_match");
  const [minuteRangeStart, setMinuteRangeStart] = useState(0);
  const [minuteRangeEnd, setMinuteRangeEnd] = useState(90);

  const currentAxisDefinitions =
    chartAxisSetType === "decision"
      ? [...COMMON_DECISION_AXIS_DEFINITIONS]
      : POSITION_AXIS_DEFINITIONS;

  const [selectedAxisKeys, setSelectedAxisKeys] = useState<Set<string>>(
    () => new Set(COMMON_DECISION_AXIS_DEFINITIONS.map((axis) => axis.key))
  );

  const toggleAxisSelection = (axisKey: string) => {
    setSelectedAxisKeys((previousSelected) => {
      const nextSelected = new Set(previousSelected);
      if (nextSelected.has(axisKey)) {
        if (nextSelected.size <= 2) return previousSelected;
        nextSelected.delete(axisKey);
      } else {
        nextSelected.add(axisKey);
      }
      return nextSelected;
    });
  };

  const togglePositionCategoryFilter = (categoryKey: string) => {
    setSelectedPositionCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  const incidentsFilteredByPositionCategory = useMemo(() => {
    if (selectedPositionCategoryFilters.size === 0) return incidents;
    return incidents.filter((incident) =>
      selectedPositionCategoryFilters.has(getCategoryKey(incident.type))
    );
  }, [incidents, selectedPositionCategoryFilters]);

  const incidentsFilteredByPositionAndMinute = useMemo(() => {
    if (minuteFilterMode === "whole_match") {
      return incidentsFilteredByPositionCategory;
    }
    return incidentsFilteredByPositionCategory.filter((incident) => {
      const incidentMinute = incident.minute ?? null;
      if (incidentMinute === null) return false;
      return incidentMinute >= minuteRangeStart && incidentMinute <= minuteRangeEnd;
    });
  }, [
    incidentsFilteredByPositionCategory,
    minuteFilterMode,
    minuteRangeStart,
    minuteRangeEnd,
  ]);

  const radarChartDataPoints = useMemo(() => {
    const activeAxisDefinitions = currentAxisDefinitions.filter((axis) =>
      selectedAxisKeys.has(axis.key)
    );
    if (activeAxisDefinitions.length < 2) return [];

    const teamValuesByAxisKey: Record<string, Record<string, number>> = {};
    for (const team of visibleTeams) {
      teamValuesByAxisKey[team] = {};
      for (const axis of activeAxisDefinitions) {
        teamValuesByAxisKey[team][axis.key] = 0;
      }
    }

    for (const incident of incidentsFilteredByPositionAndMinute) {
      const contributionValue =
        valueDisplayMode === "points" ? getIncidentImpactPoints(incident.type) : 1;
      const expertAgreeCount = incident.opinionSummary?.agree ?? 0;
      const expertDisagreeCount = incident.opinionSummary?.disagree ?? 0;
      const isCorrectDecision = expertAgreeCount > expertDisagreeCount;
      const isWrongDecision = expertDisagreeCount > expertAgreeCount;

      if (chartAxisSetType === "decision") {
        for (const team of visibleTeams) {
          if (selectedAxisKeys.has("lehine") && incident.inFavorOf === team) {
            teamValuesByAxisKey[team].lehine += contributionValue;
          }
          if (selectedAxisKeys.has("aleyhine") && incident.against === team) {
            teamValuesByAxisKey[team].aleyhine += contributionValue;
          }
          const incidentAffectsTeam =
            incident.inFavorOf === team || incident.against === team;
          if (selectedAxisKeys.has("correct") && isCorrectDecision && incidentAffectsTeam) {
            teamValuesByAxisKey[team].correct += contributionValue;
          }
          if (selectedAxisKeys.has("wrong") && isWrongDecision && incidentAffectsTeam) {
            teamValuesByAxisKey[team].wrong += contributionValue;
          }
        }
      } else {
        const positionCategoryKey = getCategoryKey(incident.type);
        if (selectedAxisKeys.has(positionCategoryKey)) {
          for (const team of visibleTeams) {
            const incidentAffectsTeam =
              incident.inFavorOf === team || incident.against === team;
            if (incidentAffectsTeam) {
              teamValuesByAxisKey[team][positionCategoryKey] += contributionValue;
            }
          }
        }
      }
    }

    const allValues = visibleTeams.flatMap((t) =>
      Object.values(teamValuesByAxisKey[t] ?? {})
    );
    const maximumValueForScale = Math.max(1, ...allValues);

    return activeAxisDefinitions.map((axis) => {
      const point: Record<string, string | number> = {
        axisShortLabel: axis.shortLabel,
        axisFullLabel: axis.label,
        maximumValueForScale,
      };
      for (const team of visibleTeams) {
        point[team] = teamValuesByAxisKey[team]?.[axis.key] ?? 0;
      }
      return point;
    });
  }, [
    incidentsFilteredByPositionAndMinute,
    chartAxisSetType,
    selectedAxisKeys,
    valueDisplayMode,
    visibleTeams,
    currentAxisDefinitions,
  ]);

  const chartHasAnyData = radarChartDataPoints.some((dataPoint) =>
    visibleTeams.some((t) => Number(dataPoint[t] ?? 0) > 0)
  );

  const hasAnyIncidents = incidents.length > 0;
  const hasValidTeams =
    mode === "single_match"
      ? visibleTeams.length >= 2
      : selectedTeams.size >= 2;

  if (!hasAnyIncidents) {
    return null;
  }

  if (mode === "aggregate" && availableTeams.length < 2) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-white">
        Karar Radar Görselleştirmesi
      </h3>

      {/* Kontroller */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Eksen seti:</span>
          <button
            type="button"
            onClick={() => setChartAxisSetType("decision")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              chartAxisSetType === "decision"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Karar
          </button>
          <button
            type="button"
            onClick={() => setChartAxisSetType("position")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              chartAxisSetType === "position"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Pozisyon
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Değer tipi:</span>
          <button
            type="button"
            onClick={() => setValueDisplayMode("count")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              valueDisplayMode === "count"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Sayı
          </button>
          <button
            type="button"
            onClick={() => setValueDisplayMode("points")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              valueDisplayMode === "points"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Puan
          </button>
        </div>

        {mode === "aggregate" && availableTeams.length >= 2 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">Takımlar:</span>
            {availableTeams.map((team) => (
              <label
                key={team}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1 transition-colors hover:bg-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={selectedTeams.has(team)}
                  onChange={() => toggleTeamSelection(team)}
                  className="h-3 w-3 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
                />
                <span className="text-xs text-zinc-300">{team}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Pozisyon tipi:</span>
          {CATEGORY_ORDER.map((categoryKey) => (
            <label
              key={categoryKey}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1 transition-colors hover:bg-zinc-800"
            >
              <input
                type="checkbox"
                checked={selectedPositionCategoryFilters.has(categoryKey)}
                onChange={() => togglePositionCategoryFilter(categoryKey)}
                className="h-3 w-3 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
              />
              <span className="text-xs text-zinc-300">
                {categoryKey === "penalty"
                  ? "Penaltı"
                  : categoryKey === "offside_goal"
                    ? "Ofsayt"
                    : categoryKey === "card"
                      ? "Kart"
                      : categoryKey === "foul_handball"
                        ? "Faul/El"
                        : "Diğer"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dakika filtresi */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-xs text-zinc-500">Dakika:</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMinuteFilterMode("whole_match")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              minuteFilterMode === "whole_match"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Tüm maç
          </button>
          <button
            type="button"
            onClick={() => setMinuteFilterMode("minute_range")}
            className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              minuteFilterMode === "minute_range"
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Zaman dilimi
          </button>
        </div>
        {minuteFilterMode === "minute_range" && (
          <div className="flex flex-1 flex-col gap-2 sm:min-w-[260px]">
            <div className="flex items-center justify-between gap-4 text-xs text-zinc-500">
              <span>Başlangıç: {minuteRangeStart}&apos;</span>
              <span>Bitiş: {minuteRangeEnd}&apos;</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={MINUTE_SLIDER_MAX}
                value={minuteRangeStart}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setMinuteRangeStart(value);
                  if (value > minuteRangeEnd) setMinuteRangeEnd(value);
                }}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-red-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
              />
              <input
                type="range"
                min={0}
                max={MINUTE_SLIDER_MAX}
                value={minuteRangeEnd}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setMinuteRangeEnd(value);
                  if (value < minuteRangeStart) setMinuteRangeStart(value);
                }}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-red-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Eksen seçimi (toggle) */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500">Eksenler (aç/kapat):</span>
        {currentAxisDefinitions.map((axis) => (
          <label
            key={axis.key}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1 transition-colors hover:bg-zinc-800"
          >
            <input
              type="checkbox"
              checked={selectedAxisKeys.has(axis.key)}
              onChange={() => toggleAxisSelection(axis.key)}
              className="h-3 w-3 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
            />
            <span className="text-xs text-zinc-300">{axis.shortLabel}</span>
          </label>
        ))}
      </div>

      {/* Radar Chart */}
      {hasValidTeams && radarChartDataPoints.length >= 2 && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadar
              cx="50%"
              cy="50%"
              outerRadius="70%"
              data={radarChartDataPoints}
              margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis
                dataKey="axisShortLabel"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                tickLine={{ stroke: "#52525b" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "auto"]}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickCount={4}
              />
              {visibleTeams.map((team, idx) => {
                  const colors = TEAM_CHART_COLORS[idx % TEAM_CHART_COLORS.length];
                  return (
                    <Radar
                      key={team}
                      name={team}
                      dataKey={team}
                      stroke={colors.stroke}
                      fill={colors.fill}
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  );
                })}
              <Tooltip
                contentStyle={{
                  backgroundColor: "#27272a",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(value, name) => [
                  `${Number(value ?? 0)} ${valueDisplayMode === "points" ? "puan" : "adet"}`,
                  String(name ?? ""),
                ]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.axisFullLabel ?? ""
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-zinc-300">{value}</span>
                )}
              />
            </RechartsRadar>
          </ResponsiveContainer>
        </div>
      )}

      {(!hasValidTeams || radarChartDataPoints.length < 2) && (
        <p className="py-8 text-center text-sm text-zinc-500">
          {!hasValidTeams && mode === "aggregate"
            ? "En az 2 takım seçin"
            : "En az 2 eksen seçin"}
        </p>
      )}

      {hasValidTeams && radarChartDataPoints.length >= 2 && !chartHasAnyData && (
        <p className="py-4 text-center text-sm text-zinc-500">
          Seçilen filtrelerde veri bulunamadı
        </p>
      )}

    </div>
  );
}

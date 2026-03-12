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

/** Karar tipi eksen tanımları (takım adlarına göre dinamik) */
function getDecisionAxisDefinitions(
  teamA: string,
  teamB: string
): { key: string; label: string; shortLabel: string }[] {
  const shortA = teamA.length > 8 ? teamA.slice(0, 6) + "…" : teamA;
  const shortB = teamB.length > 8 ? teamB.slice(0, 6) + "…" : teamB;
  return [
    { key: "lehine_home", label: `${teamA} lehine verilen kararlar`, shortLabel: `${shortA} Lehine` },
    { key: "aleyhine_home", label: `${teamA} aleyhine verilen kararlar`, shortLabel: `${shortA} Aleyhine` },
    { key: "correct", label: "Yorumculara göre doğru karar", shortLabel: "Doğru Karar" },
    { key: "wrong", label: "Yorumculara göre yanlış karar", shortLabel: "Yanlış Karar" },
    { key: "lehine_away", label: `${teamB} lehine verilen kararlar`, shortLabel: `${shortB} Lehine` },
    { key: "aleyhine_away", label: `${teamB} aleyhine verilen kararlar`, shortLabel: `${shortB} Aleyhine` },
  ];
}

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

function deriveTeamsFromIncidents(incidents: RadarIncident[]): string[] {
  const teams = new Set<string>();
  for (const inc of incidents) {
    if (inc.inFavorOf) teams.add(inc.inFavorOf);
    if (inc.against) teams.add(inc.against);
    if (inc.match) {
      teams.add(inc.match.homeTeam);
      teams.add(inc.match.awayTeam);
    }
  }
  return [...teams].sort();
}

export default function MatchRadarChart({
  incidents,
  homeTeam: homeTeamProp,
  awayTeam: awayTeamProp,
  mode = "single_match",
  availableTeams: availableTeamsProp,
  className = "",
}: MatchRadarChartProps) {
  const derivedTeams = useMemo(
    () => deriveTeamsFromIncidents(incidents),
    [incidents]
  );
  const availableTeams = availableTeamsProp?.length
    ? availableTeamsProp
    : derivedTeams;
  const defaultTeamA = availableTeams[0] ?? "";
  const defaultTeamB = availableTeams[1] ?? availableTeams[0] ?? "";

  const [selectedTeamA, setSelectedTeamA] = useState(defaultTeamA);
  const [selectedTeamB, setSelectedTeamB] = useState(defaultTeamB);

  const homeTeam =
    mode === "single_match"
      ? (homeTeamProp ?? "")
      : selectedTeamA;
  const awayTeam =
    mode === "single_match"
      ? (awayTeamProp ?? "")
      : selectedTeamB;

  useEffect(() => {
    if (mode === "aggregate" && availableTeams.length >= 2) {
      setSelectedTeamA((prev) =>
        availableTeams.includes(prev) ? prev : defaultTeamA
      );
      setSelectedTeamB((prev) =>
        availableTeams.includes(prev) ? prev : defaultTeamB
      );
    }
  }, [mode, availableTeams, defaultTeamA, defaultTeamB]);

  const [chartAxisSetType, setChartAxisSetType] = useState<ChartAxisSetType>("decision");
  const [valueDisplayMode, setValueDisplayMode] = useState<ValueDisplayMode>("count");
  const [isHomeTeamVisible, setIsHomeTeamVisible] = useState(true);
  const [isAwayTeamVisible, setIsAwayTeamVisible] = useState(true);
  const [selectedPositionCategoryFilters, setSelectedPositionCategoryFilters] = useState<Set<string>>(
    () => new Set(CATEGORY_ORDER)
  );
  const [minuteFilterMode, setMinuteFilterMode] = useState<MinuteFilterMode>("whole_match");
  const [minuteRangeStart, setMinuteRangeStart] = useState(0);
  const [minuteRangeEnd, setMinuteRangeEnd] = useState(90);

  const currentAxisDefinitions =
    chartAxisSetType === "decision"
      ? getDecisionAxisDefinitions(homeTeam, awayTeam)
      : POSITION_AXIS_DEFINITIONS;

  const [selectedAxisKeys, setSelectedAxisKeys] = useState<Set<string>>(
    () => new Set(getDecisionAxisDefinitions(homeTeam || "Ev", awayTeam || "Dep").map((axis) => axis.key))
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

    const homeTeamValuesByAxisKey: Record<string, number> = {};
    const awayTeamValuesByAxisKey: Record<string, number> = {};

    for (const axis of activeAxisDefinitions) {
      homeTeamValuesByAxisKey[axis.key] = 0;
      awayTeamValuesByAxisKey[axis.key] = 0;
    }

    for (const incident of incidentsFilteredByPositionAndMinute) {
      const contributionValue =
        valueDisplayMode === "points" ? getIncidentImpactPoints(incident.type) : 1;
      const expertAgreeCount = incident.opinionSummary?.agree ?? 0;
      const expertDisagreeCount = incident.opinionSummary?.disagree ?? 0;
      const isCorrectDecision = expertAgreeCount > expertDisagreeCount;
      const isWrongDecision = expertDisagreeCount > expertAgreeCount;

      if (chartAxisSetType === "decision") {
        if (selectedAxisKeys.has("lehine_home") && incident.inFavorOf === homeTeam) {
          homeTeamValuesByAxisKey.lehine_home += contributionValue;
        }
        if (selectedAxisKeys.has("aleyhine_home") && incident.against === homeTeam) {
          homeTeamValuesByAxisKey.aleyhine_home += contributionValue;
        }
        if (selectedAxisKeys.has("lehine_away") && incident.inFavorOf === awayTeam) {
          awayTeamValuesByAxisKey.lehine_away += contributionValue;
        }
        if (selectedAxisKeys.has("aleyhine_away") && incident.against === awayTeam) {
          awayTeamValuesByAxisKey.aleyhine_away += contributionValue;
        }
        if (selectedAxisKeys.has("correct") && isCorrectDecision) {
          homeTeamValuesByAxisKey.correct += contributionValue;
          awayTeamValuesByAxisKey.correct += contributionValue;
        }
        if (selectedAxisKeys.has("wrong") && isWrongDecision) {
          homeTeamValuesByAxisKey.wrong += contributionValue;
          awayTeamValuesByAxisKey.wrong += contributionValue;
        }
      } else {
        const positionCategoryKey = getCategoryKey(incident.type);
        if (selectedAxisKeys.has(positionCategoryKey)) {
          const incidentAffectsHomeTeam =
            incident.inFavorOf === homeTeam || incident.against === homeTeam;
          const incidentAffectsAwayTeam =
            incident.inFavorOf === awayTeam || incident.against === awayTeam;
          if (incidentAffectsHomeTeam) {
            homeTeamValuesByAxisKey[positionCategoryKey] += contributionValue;
          }
          if (incidentAffectsAwayTeam) {
            awayTeamValuesByAxisKey[positionCategoryKey] += contributionValue;
          }
        }
      }
    }

    const maximumValueForScale = Math.max(
      1,
      ...Object.values(homeTeamValuesByAxisKey),
      ...Object.values(awayTeamValuesByAxisKey)
    );

    return activeAxisDefinitions.map((axis) => {
      const homeTeamValueForAxis = homeTeamValuesByAxisKey[axis.key] ?? 0;
      const awayTeamValueForAxis = awayTeamValuesByAxisKey[axis.key] ?? 0;
      return {
        axisShortLabel: axis.shortLabel,
        axisFullLabel: axis.label,
        [homeTeam]: homeTeamValueForAxis,
        [awayTeam]: awayTeamValueForAxis,
        maximumValueForScale,
      };
    });
  }, [
    incidentsFilteredByPositionAndMinute,
    chartAxisSetType,
    selectedAxisKeys,
    valueDisplayMode,
    homeTeam,
    awayTeam,
    currentAxisDefinitions,
  ]);

  const chartHasAnyData = radarChartDataPoints.some(
    (dataPoint) =>
      Number(dataPoint[homeTeam] ?? 0) > 0 || Number(dataPoint[awayTeam] ?? 0) > 0
  );

  const hasAnyIncidents = incidents.length > 0;
  const hasValidTeams =
    mode === "single_match"
      ? Boolean(homeTeam && awayTeam)
      : availableTeams.length >= 2 &&
        Boolean(selectedTeamA && selectedTeamB && selectedTeamA !== selectedTeamB);

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
            <span className="text-xs text-zinc-500">Karşılaştır:</span>
            <select
              value={selectedTeamA}
              onChange={(e) => setSelectedTeamA(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white outline-none focus:border-red-500"
            >
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-600">vs</span>
            <select
              value={selectedTeamB}
              onChange={(e) => setSelectedTeamB(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white outline-none focus:border-red-500"
            >
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Göster:</span>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={isHomeTeamVisible}
              onChange={(event) => setIsHomeTeamVisible(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
            />
            <span className="text-xs text-zinc-400">{homeTeam}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={isAwayTeamVisible}
              onChange={(event) => setIsAwayTeamVisible(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
            />
            <span className="text-xs text-zinc-400">{awayTeam}</span>
          </label>
        </div>

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
              {isHomeTeamVisible && (
                <Radar
                  name={homeTeam}
                  dataKey={homeTeam}
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              )}
              {isAwayTeamVisible && (
                <Radar
                  name={awayTeam}
                  dataKey={awayTeam}
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              )}
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
            ? "Karşılaştırmak için farklı iki takım seçin"
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

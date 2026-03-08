"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import { Shield, Loader2, TrendingUp, AlertTriangle, Search, ArrowUpDown, Users, Check } from "lucide-react";

const TRACKED_TEAMS = [
  "Fenerbahçe",
  "Galatasaray",
  "Beşiktaş",
  "Trabzonspor",
] as const;

const TEAM_STYLES: Record<(typeof TRACKED_TEAMS)[number], { accent: string; ring: string }> = {
  Fenerbahçe: { accent: "bg-amber-500/15 text-amber-400 ring-amber-500/40", ring: "ring-amber-500/50" },
  Galatasaray: { accent: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/40", ring: "ring-yellow-500/50" },
  Beşiktaş: { accent: "bg-white/15 text-zinc-200 ring-zinc-400/40", ring: "ring-zinc-400/50" },
  Trabzonspor: { accent: "bg-blue-600/15 text-blue-400 ring-blue-500/40", ring: "ring-blue-500/50" },
};

type WeekSort = "asc" | "desc";

interface Match {
  id: string;
  slug?: string | null;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  homeScore?: number | null;
  awayScore?: number | null;
  incidents: { id: string; type: string; status: string; confidenceScore: number }[];
  referee?: { id: string; name: string; slug: string; role?: string } | null;
  varReferee?: { id: string; name: string; slug: string; role?: string } | null;
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [weekSort, setWeekSort] = useState<WeekSort | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setMatches(list);
          setLoading(false);
          return;
        }
      } catch {
        /* API yoksa veya hata varsa statik fallback dene */
      }
      try {
        const fallback = await fetch("/matches.json", { cache: "no-store" });
        const data = await fallback.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch matches:", err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const seasonMatches =
    matches.filter((m) => m.league === "Süper Lig 2025-26").length > 0
      ? matches.filter((m) => m.league === "Süper Lig 2025-26")
      : matches;

  const maxWeek = seasonMatches.length > 0
    ? Math.max(...seasonMatches.map((m) => m.week))
    : 34;

  // Veri yüklendiğinde en son eklenen haftayı öne al (desc = en güncel hafta önce)
  useEffect(() => {
    if (!loading && seasonMatches.length > 0 && weekSort === null) {
      setWeekSort("desc");
    }
  }, [loading, seasonMatches.length, weekSort]);

  const effectiveWeekSort: WeekSort = weekSort ?? "desc";

  const totalApproved = matches.reduce(
    (sum, m) => sum + m.incidents.filter((i) => i.status === "APPROVED").length,
    0
  );

  const filteredMatches = seasonMatches.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.homeTeam.toLowerCase().includes(q) &&
        !m.awayTeam.toLowerCase().includes(q)
      )
        return false;
    }
    if (selectedTeams.length > 0) {
      const hasTeam =
        selectedTeams.includes(m.homeTeam) || selectedTeams.includes(m.awayTeam);
      if (!hasTeam) return false;
    }
    return true;
  });

  const groupedMatches = filteredMatches.reduce<Record<number, Match[]>>((groups, match) => {
    if (!groups[match.week]) {
      groups[match.week] = [];
    }
    groups[match.week].push(match);
    return groups;
  }, {});

  const sortedWeeks = Object.keys(groupedMatches)
    .map(Number)
    .sort((a, b) => (effectiveWeekSort === "asc" ? a - b : b - a));

  const toggleTeam = (team: string) => {
    setSelectedTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const clearTeamFilter = () => setSelectedTeams([]);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-red-500/10 p-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Var <span className="text-red-500">Odası</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
            Tartışmalı hakem kararlarını Reddit ve Ekşi Sözlük tartışmalarını
            analiz ederek otomatik tespit eden AI destekli platform.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <StatCard
              icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
              label="Takip Edilen Maç"
              value={seasonMatches.length}
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
              label="Tespit Edilen Tartışma"
              value={totalApproved}
            />
            <StatCard
              icon={<Shield className="h-5 w-5 text-blue-400" />}
              label="Takip Edilen Takım"
              value={
                new Set(
                  seasonMatches.flatMap((m) => [m.homeTeam, m.awayTeam])
                ).size
              }
            />
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              2025-26 Sezonu Maçları
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Fenerbahçe, Galatasaray, Beşiktaş ve Trabzonspor&apos;un takip edilen lig maçları
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Maç ara..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Sıralama ve gruplama */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-400">Hafta sırası</span>
            </div>
            <div className="flex rounded-xl border border-zinc-700 bg-zinc-800 p-0.5">
              <button
                type="button"
                onClick={() => setWeekSort("asc")}
                title="Sezon başından sona"
                className={`min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                  effectiveWeekSort === "asc"
                    ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                    : "text-zinc-400 active:bg-zinc-700 active:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <span className="opacity-70">1</span>
                  <span className="text-zinc-600">·</span>
                  <span>{maxWeek}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWeekSort("desc")}
                title="En güncel haftadan"
                className={`min-h-[44px] rounded-md px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                  effectiveWeekSort === "desc"
                    ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                    : "text-zinc-400 active:bg-zinc-700 active:text-white"
                }`}
              >
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <span>{maxWeek}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="opacity-70">1</span>
                </span>
              </button>
            </div>
          </div>
          <div className="hidden h-4 w-px bg-zinc-700 sm:block" />
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-400">Takım filtresi</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRACKED_TEAMS.map((team) => {
                const isSelected = selectedTeams.includes(team);
                const style = TEAM_STYLES[team];
                return (
                  <label
                    key={team}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 touch-manipulation hover:scale-[1.02] active:scale-[0.98] ${
                      isSelected
                        ? `${style.accent} border-transparent ring-2 ${style.ring} shadow-lg`
                        : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleTeam(team)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected ? "border-current bg-current/20" : "border-zinc-600"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                    </span>
                    <span>{team}</span>
                  </label>
                );
              })}
              {selectedTeams.length > 0 && (
                <button
                  type="button"
                  onClick={clearTeamFilter}
                  className="min-h-[44px] rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300 active:bg-zinc-800 touch-manipulation"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
            <Shield className="mb-4 h-12 w-12 text-zinc-700" />
            <p className="text-lg text-zinc-400">Henüz sezon maçı yüklenmedi</p>
            <p className="mt-1 text-sm text-zinc-500">
              Takip edilen sezon verileri eklendikçe burada listelenecek
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedWeeks.map((week) => (
              <section key={week}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Hafta {week}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {groupedMatches[week].length} maç listeleniyor
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-400">
                    {groupedMatches[week].reduce(
                      (sum, match) =>
                        sum + match.incidents.filter((i) => i.status === "APPROVED").length,
                      0
                    )}{" "}
                    tartışma
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedMatches[week]
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((match) => (
                      <MatchCard
                        key={match.id}
                        id={match.id}
                        slug={match.slug}
                        homeTeam={match.homeTeam}
                        awayTeam={match.awayTeam}
                        week={match.week}
                        date={match.date}
                        homeScore={match.homeScore}
                        awayScore={match.awayScore}
                        incidentCount={
                          match.incidents.filter((i) => i.status === "APPROVED").length
                        }
                        linkPrefix="/matches"
                        referee={match.referee}
                        varReferee={match.varReferee}
                      />
                    ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

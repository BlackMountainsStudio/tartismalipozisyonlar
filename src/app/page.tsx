"use client";

import { useState, useEffect } from "react";
import MatchCard from "@/components/MatchCard";
import { Shield, Loader2, TrendingUp, AlertTriangle, Search } from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  incidents: { id: string; type: string; status: string; confidenceScore: number }[];
}

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
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

  const seasonMatches = matches.filter((m) => m.league === "Süper Lig 2025-26");

  const totalApproved = matches.reduce(
    (sum, m) => sum + m.incidents.filter((i) => i.status === "APPROVED").length,
    0
  );

  const filteredMatches = seasonMatches.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.homeTeam.toLowerCase().includes(q) ||
      m.awayTeam.toLowerCase().includes(q)
    );
  });

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
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Tartışmalı<span className="text-red-500">Pozisyonlar</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
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
              Fenerbahçe, Galatasaray, Beşiktaş ve Trabzonspor'un takip edilen lig maçları
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                week={match.week}
                date={match.date}
                incidentCount={
                  match.incidents.filter((i) => i.status === "APPROVED").length
                }
                linkPrefix="/matches"
              />
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

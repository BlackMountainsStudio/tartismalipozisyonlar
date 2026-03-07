"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import IncidentCard from "@/components/IncidentCard";
import CommentSection from "@/components/CommentSection";
import { ArrowLeft, Loader2, Calendar, Trophy, Shield } from "lucide-react";

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  videoUrl?: string | null;
}

/** Pozisyon tiplerine göre gruplama: penaltı, ofsayt/gol iptali, kart, faul/el, diğer */
const INCIDENT_CATEGORIES: Record<string, { key: string; label: string }> = {
  PENALTY: { key: "penalty", label: "Penaltı pozisyonları" },
  POSSIBLE_PENALTY: { key: "penalty", label: "Penaltı pozisyonları" },
  GOAL_DISALLOWED: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  OFFSIDE: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  POSSIBLE_OFFSIDE_GOAL: { key: "offside_goal", label: "Ofsayt / Gol iptali" },
  RED_CARD: { key: "card", label: "Kart pozisyonları" },
  YELLOW_CARD: { key: "card", label: "Kart pozisyonları" },
  MISSED_RED_CARD: { key: "card", label: "Kart pozisyonları" },
  FOUL: { key: "foul_handball", label: "Faul / El" },
  HANDBALL: { key: "foul_handball", label: "Faul / El" },
  VAR_CONTROVERSY: { key: "other", label: "Diğer" },
};

function getCategoryKey(type: string): string {
  return INCIDENT_CATEGORIES[type]?.key ?? "other";
}

function getCategoryLabel(type: string): string {
  return INCIDENT_CATEGORIES[type]?.label ?? "Diğer";
}
interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  note?: string | null;
}

export default function PublicMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: matchId } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [matchRes, incidentsRes] = await Promise.all([
        fetch(`/api/matches`),
        fetch(`/api/incidents?matchId=${matchId}&status=approved`),
      ]);
      const matchData = await matchRes.json();
      const matchList = Array.isArray(matchData) ? matchData : [];
      const matchItem = matchList.find((m: Match) => m.id === matchId);
      setMatch(matchItem ?? null);

      const incidentsData = await incidentsRes.json();
      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Maç bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <button
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Maçlara Dön
      </button>

      <div className="mb-10 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-red-400" />
          <span className="text-sm font-medium text-red-400">
            {match.league}
          </span>
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">
            Hafta {match.week}
          </span>
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(match.date).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          {match.note && (
            <span className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              {match.note}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {match.homeTeam}{" "}
          <span className="text-zinc-600">vs</span>{" "}
          {match.awayTeam}
        </h1>
      </div>

      <h2 className="mb-6 text-xl font-bold text-white">
        Tartışmalı Pozisyonlar
      </h2>

      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Shield className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-lg text-zinc-400">
            Bu maç için tartışmalı pozisyon bulunamadı
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Hakem kararlarında önemli bir tartışma tespit edilmedi
          </p>
        </div>
      ) : (
        (() => {
          const sorted = [...incidents].sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
          const byCategory = sorted.reduce<Record<string, Incident[]>>((acc, inc) => {
            const key = getCategoryKey(inc.type);
            if (!acc[key]) acc[key] = [];
            acc[key].push(inc);
            return acc;
          }, {});
          const categoryOrder = ["penalty", "offside_goal", "card", "foul_handball", "other"];
          return (
            <div className="space-y-8">
              {categoryOrder.map((key) => {
                const list = byCategory[key];
                if (!list?.length) return null;
                const label = getCategoryLabel(list[0].type);
                return (
                  <section key={key}>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      {label}
                    </h3>
                    <div className="space-y-4">
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
                          matchInfo={`${match.homeTeam} vs ${match.awayTeam}`}
                          clickable
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          );
        })()
      )}

      {/* Maç Hakkında Genel Yorumlar */}
      <div className="mt-10">
        <CommentSection matchId={matchId} />
      </div>
    </div>
  );
}

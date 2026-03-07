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
      setIncidents(Array.isArray(incidentsData) ? incidentsData.filter((i): i is Incident => i != null && typeof i === "object" && "id" in i) : []);
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
        Var <span className="text-red-500">Odası</span>
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
        <div className="space-y-4">
          {[...incidents]
            .filter((i): i is Incident => i != null && typeof i === "object" && "id" in i)
            .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999))
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
                matchInfo={`${match.homeTeam} vs ${match.awayTeam}`}
                clickable
              />
            ))}
        </div>
      )}

      {/* Maç Hakkında Genel Yorumlar */}
      <div className="mt-10">
        <CommentSection matchId={matchId} />
      </div>
    </div>
  );
}

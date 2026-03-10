"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IncidentCard from "@/components/IncidentCard";
import CommentSection from "@/components/CommentSection";
import { matchUrl, refereeUrl } from "@/lib/links";
import { INCIDENT_TYPE_LABELS, getIncidentImpactPoints } from "@/lib/incidentCategories";
import { ArrowLeft, Loader2, Calendar, Trophy, Shield, UserRound, Scale } from "lucide-react";

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
  opinionSummary?: { agree: number; disagree: number; neutral: number } | null;
  inFavorOf?: string | null;
  against?: string | null;
}

interface Match {
  id: string;
  slug?: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  note?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  referee?: { id: string; name: string; slug: string; role: string } | null;
  varReferee?: { id: string; name: string; slug: string; role: string } | null;
}

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slugOrId } = use(params);
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const slugRes = await fetch(`/api/matches?slug=${encodeURIComponent(slugOrId)}`, { cache: "no-store" });
      let matchItem: Match | null = null;
      if (slugRes.ok) {
        const data = await slugRes.json();
        if (data && typeof data === "object" && data.id) matchItem = data as Match;
      }
      if (!matchItem) {
        const idRes = await fetch(`/api/matches?id=${encodeURIComponent(slugOrId)}`, { cache: "no-store" });
        if (idRes.ok) {
          const data = await idRes.json();
          if (data && typeof data === "object" && data.id) matchItem = data as Match;
        }
      }
      setMatch(matchItem);
      if (matchItem) {
        const incRes = await fetch(`/api/incidents?matchId=${matchItem.id}&status=approved`, { cache: "no-store" });
        const incData = await incRes.json();
        setIncidents(Array.isArray(incData) ? incData.filter((i: unknown): i is Incident => i != null && typeof i === "object" && "id" in i) : []);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setMatch(null);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, [slugOrId]);

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
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Maç bulunamadı</p>
        <Link href="/" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  const currentMatchSlug = match.slug ?? slugOrId;

  const incidentsWithOpinions = incidents.filter(
    (i) => i.opinionSummary && (i.opinionSummary.agree + i.opinionSummary.disagree + i.opinionSummary.neutral) > 0
  );
  const totalWithOpinions = incidentsWithOpinions.length;
  const correctCount = incidentsWithOpinions.filter(
    (i) => (i.opinionSummary?.agree ?? 0) > (i.opinionSummary?.disagree ?? 0)
  ).length;
  const wrongIncidents = incidentsWithOpinions.filter(
    (i) => (i.opinionSummary?.disagree ?? 0) > (i.opinionSummary?.agree ?? 0)
  );
  const wrongCount = wrongIncidents.length;
  const wrongAgainstHome = wrongIncidents.filter((i) => i.against === match.homeTeam).length;
  const wrongAgainstAway = wrongIncidents.filter((i) => i.against === match.awayTeam).length;

  const pointsFor = (inc: Incident) => getIncidentImpactPoints(inc.type);
  const impactHomeAgainst = wrongIncidents
    .filter((i) => i.against === match.homeTeam)
    .reduce((s, i) => s + pointsFor(i), 0);
  const impactHomeFavor = wrongIncidents
    .filter((i) => i.inFavorOf === match.homeTeam)
    .reduce((s, i) => s + pointsFor(i), 0);
  const impactAwayAgainst = wrongIncidents
    .filter((i) => i.against === match.awayTeam)
    .reduce((s, i) => s + pointsFor(i), 0);
  const impactAwayFavor = wrongIncidents
    .filter((i) => i.inFavorOf === match.awayTeam)
    .reduce((s, i) => s + pointsFor(i), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Maçlara Dön
      </Link>

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
          {!match.referee && !match.varReferee && (
            <span className="rounded-md bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-500">
              Hakem bilgisi eklenmemiş
            </span>
          )}
          {match.referee && (
            <Link
              href={refereeUrl(match.referee.slug)}
              className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <UserRound className="h-3.5 w-3.5 text-red-400" />
              Hakem: {match.referee.name}
            </Link>
          )}
          {match.varReferee && (
            <Link
              href={refereeUrl(match.varReferee.slug)}
              className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <UserRound className="h-3.5 w-3.5 text-amber-400" />
              VAR: {match.varReferee.name}
            </Link>
          )}
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {match.homeTeam}
          {match.homeScore != null && match.awayScore != null ? (
            <>
              {" "}
              <span className="text-red-400">{match.homeScore} - {match.awayScore}</span>
              {" "}
            </>
          ) : (
            <>
              {" "}
              <span className="text-zinc-600">vs</span>
              {" "}
            </>
          )}
          {match.awayTeam}
        </h1>
        {totalWithOpinions > 0 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2">
                <Scale className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-zinc-300">
                  <span className="font-semibold text-emerald-400">{correctCount}/{totalWithOpinions}</span>
                  {" "}doğru karar
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2">
                <Scale className="h-4 w-4 text-red-400" />
                <span className="text-sm text-zinc-300">
                  <span className="font-semibold text-red-400">{wrongCount}/{totalWithOpinions}</span>
                  {" "}yanlış karar
                </span>
              </div>
            </div>
            {wrongCount > 0 && (wrongAgainstHome > 0 || wrongAgainstAway > 0) && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
                <span>Yanlış kararlar:</span>
                {wrongAgainstHome > 0 && (
                  <span>
                    <span className="font-medium text-zinc-400">{wrongAgainstHome}/{wrongCount}</span>
                    {" "}{match.homeTeam}
                  </span>
                )}
                {wrongAgainstAway > 0 && (
                  <span>
                    <span className="font-medium text-zinc-400">{wrongAgainstAway}/{wrongCount}</span>
                    {" "}{match.awayTeam}
                  </span>
                )}
              </div>
            )}
            {wrongCount > 0 && (impactHomeAgainst > 0 || impactHomeFavor > 0 || impactAwayAgainst > 0 || impactAwayFavor > 0) && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                <Link
                  href="/rehber"
                  className="text-zinc-500 hover:text-amber-400"
                  title="Puanlama rehberi"
                >
                  Maç etkisi (puan)
                </Link>
                {(impactHomeAgainst > 0 || impactHomeFavor > 0) && (
                  <span className="text-zinc-400">
                    {match.homeTeam}:{" "}
                    {impactHomeFavor > 0 && (
                      <span className="text-emerald-400">+{impactHomeFavor} lehine</span>
                    )}
                    {impactHomeFavor > 0 && impactHomeAgainst > 0 && " · "}
                    {impactHomeAgainst > 0 && (
                      <span className="text-red-400">-{impactHomeAgainst} aleyhine</span>
                    )}
                  </span>
                )}
                {(impactAwayAgainst > 0 || impactAwayFavor > 0) && (
                  <span className="text-zinc-400">
                    {match.awayTeam}:{" "}
                    {impactAwayFavor > 0 && (
                      <span className="text-emerald-400">+{impactAwayFavor} lehine</span>
                    )}
                    {impactAwayFavor > 0 && impactAwayAgainst > 0 && " · "}
                    {impactAwayAgainst > 0 && (
                      <span className="text-red-400">-{impactAwayAgainst} aleyhine</span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
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
                refereeLabel={INCIDENT_TYPE_LABELS[incident.type]}
                opinionSummary={incident.opinionSummary ?? undefined}
                inFavorOf={incident.inFavorOf}
                against={incident.against}
                matchSlug={currentMatchSlug}
                incidentSlug={incident.slug ?? undefined}
                clickable
              />
            ))}
        </div>
      )}

      <div className="mt-10">
        <CommentSection matchId={match.id} />
      </div>
    </div>
  );
}

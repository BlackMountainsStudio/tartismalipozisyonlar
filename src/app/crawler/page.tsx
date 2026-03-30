"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, BugPlay, Copy, Check } from "lucide-react";
import { getSeasonFromDate } from "@/lib/slug";

interface DetectedIncident {
  type: string;
  minute: number | null;
  description: string;
  confidence: number;
}

type SeasonHalf = "first" | "second";

interface CrawlResponse {
  message: string;
  mode: "openai" | "local" | string;
  homeTeam: string;
  awayTeam: string;
  match?: {
    id: string;
    league: string;
    week: number;
    date: string;
    half: SeasonHalf | null;
  } | null;
  redditConfigured?: boolean;
  hasOpenAI?: boolean;
  hint?: string;
  crawledSources: number;
  commentsAnalyzed: number;
  incidentsDetected: number;
  incidents: DetectedIncident[];
  sources: string[];
}

interface MatchMeta {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  league: string;
  week: number;
}

export default function LocalCrawlerPage() {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [season, setSeason] = useState("");
  const [half, setHalf] = useState<SeasonHalf>("first");
  const [forceLocal, setForceLocal] = useState(true);

  const [availableTeams, setAvailableTeams] = useState<string[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [matchesMeta, setMatchesMeta] = useState<MatchMeta[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const [result, setResult] = useState<CrawlResponse | null>(null);
  const [rawJson, setRawJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches", { cache: "no-store" });
        const data = await res.json();
        const list: MatchMeta[] = Array.isArray(data)
          ? data.map((m) => ({
              id: String(m.id),
              homeTeam: String(m.homeTeam),
              awayTeam: String(m.awayTeam),
              date: String(m.date),
              league: String(m.league),
              week: Number(m.week),
            }))
          : [];

        setMatchesMeta(list);

        const teamSet = new Set<string>();
        const seasonSet = new Set<string>();
        for (const m of list) {
          if (m.homeTeam) teamSet.add(m.homeTeam);
          if (m.awayTeam) teamSet.add(m.awayTeam);
          seasonSet.add(getSeasonFromDate(m.date));
        }

        const teams = Array.from(teamSet).sort((a, b) =>
          a.localeCompare(b, "tr"),
        );
        const seasons = Array.from(seasonSet).sort().reverse();

        setAvailableTeams(teams);
        setAvailableSeasons(seasons);
        if (!season && seasons.length > 0) {
          setSeason(seasons[0]);
        }
      } catch {
        setAvailableTeams([]);
        setAvailableSeasons([]);
      } finally {
        setMetaLoading(false);
      }
    }

    loadMatches();
  }, [season]);

  const seasonLabel = useMemo(() => {
    if (!season) return "";
    return season.replace("-", "–");
  }, [season]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCopied(false);
    setResult(null);
    setRawJson("");

    if (!teamA || !teamB) {
      setError("İki takım da seçilmelidir.");
      return;
    }
    if (teamA === teamB) {
      setError("Aynı takımı iki kez seçemezsiniz.");
      return;
    }
    if (!season) {
      setError("Sezon seçmelisiniz.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dev/crawler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA,
          teamB,
          season,
          half,
          forceLocal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Crawler çağrısı başarısız.");
        return;
      }
      setResult(data as CrawlResponse);
      setRawJson(JSON.stringify(data, null, 2));
    } catch {
      setError("İstek gönderilemedi. Konsolu kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
          <BugPlay className="h-6 w-6 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Local Crawler Aracı</h1>
          <p className="text-sm text-zinc-400">
            İki takım, sezon ve ilk/ikinci yarı seç; sistem doğru maçı bulup
            Reddit + Ekşi Sözlük tartışmalarından incident JSON çıktısı üretsin
            (veritabanına yazmaz).
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Takım 1
            </label>
            <select
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              disabled={metaLoading}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Takım seçin</option>
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Takım 2
            </label>
            <select
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              disabled={metaLoading}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Takım seçin</option>
              {availableTeams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Sezon
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              disabled={metaLoading || availableSeasons.length === 0}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Sezon seçin</option>
              {availableSeasons.map((s) => (
                <option key={s} value={s}>
                  {s.replace("-", "–")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-300">
              Maç
            </label>
            <div className="flex gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1">
              <button
                type="button"
                onClick={() => setHalf("first")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
                  half === "first"
                    ? "bg-red-500/20 text-red-400"
                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                Sezon ilk yarı maçı
              </button>
              <button
                type="button"
                onClick={() => setHalf("second")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${
                  half === "second"
                    ? "bg-red-500/20 text-red-400"
                    : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                Sezon ikinci yarı maçı
              </button>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Aynı sezonda iki maç varsa, ilk yarı = ilk maç, ikinci yarı = ikinci
              maç kabul edilir.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={forceLocal}
            onChange={(e) => setForceLocal(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
          />
          OpenAI API anahtarı olsa bile sadece yerel (keyword tabanlı) analiz
          kullan
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading || metaLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Çalıştırılıyor...
            </>
          ) : (
            <>
              <BugPlay className="h-4 w-4" />
              Crawler&apos;ı Çalıştır
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-300">
            <p className="mb-1">
              <span className="font-semibold text-white">
                {result.homeTeam} vs {result.awayTeam}
              </span>{" "}
              için crawler sonucu:
            </p>
            {result.match && (
              <p className="mb-1 text-xs text-zinc-400">
                {seasonLabel && (
                  <>
                    {seasonLabel} ·{" "}
                  </>
                )}
                {result.match.league} · Hafta {result.match.week} ·{" "}
                {result.match.half === "second"
                  ? "Sezon ikinci yarı maçı"
                  : "Sezon ilk yarı maçı"}
              </p>
            )}
            <ul className="mt-1 space-y-1 text-xs text-zinc-400">
              <li>
                Kaynak sayısı:{" "}
                <span className="text-zinc-100">
                  {result.crawledSources}
                </span>
              </li>
              <li>
                İncelenen yorum:{" "}
                <span className="text-zinc-100">
                  {result.commentsAnalyzed}
                </span>
              </li>
              <li>
                Tespit edilen incident:{" "}
                <span className="text-zinc-100">
                  {result.incidentsDetected}
                </span>
              </li>
              <li>
                Mod:{" "}
                <span className="text-zinc-100">
                  {result.mode === "openai" ? "OpenAI" : "Local"}
                </span>
              </li>
              <li>
                Reddit yapılandırması:{" "}
                <span className="text-zinc-100">
                  {result.redditConfigured ? "Var" : "YOK"}
                </span>
              </li>
              <li>
                OpenAI anahtarı:{" "}
                <span className="text-zinc-100">
                  {result.hasOpenAI ? "Var" : "YOK"}
                </span>
              </li>
            </ul>
            {result.hint && (
              <p className="mt-2 text-xs text-amber-400">
                Not: {result.hint}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-300">Ham JSON çıktı</p>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!rawJson}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    JSON&apos;u kopyala
                  </>
                )}
              </button>
            </div>
            <textarea
              value={rawJson}
              readOnly
              rows={16}
              className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}


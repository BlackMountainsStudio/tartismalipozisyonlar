"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  Search,
  Loader2,
  ExternalLink,
  Plus,
  Link2,
  Check,
  Globe,
  Crosshair,
} from "lucide-react";
import { getVideoLinkLabel, getSourceLabel } from "@/lib/linkLabels";

interface Incident {
  id: string;
  type: string;
  description: string;
  videoUrl: string | null;
  relatedVideos: string[];
  match?: { homeTeam: string; awayTeam: string; week: number };
}

interface VideoResult {
  title: string;
  url: string;
  thumbnail: string;
  source: string;
}

export default function DashboardVideosPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<VideoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<string>("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "with" | "without">("all");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setIncidents(
        list
          .filter((i: unknown) => i != null && typeof i === "object" && "id" in i)
          .map((i: Incident & { relatedVideos?: string | string[] }) => ({
            ...i,
            match: (i as { match?: Incident["match"] }).match ?? undefined,
            relatedVideos: Array.isArray(i.relatedVideos)
              ? i.relatedVideos
              : typeof i.relatedVideos === "string"
                ? (() => { try { return JSON.parse(i.relatedVideos); } catch { return []; } })()
                : [],
          }))
      );
    } catch {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search/videos?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function attachVideo(incidentId: string, videoUrl: string) {
    setSaving(true);
    try {
      const incident = incidents.find((i) => i.id === incidentId);
      const existingRelated = incident?.relatedVideos ?? [];
      const isMainVideo = !incident?.videoUrl;

      const body: Record<string, unknown> = {};
      if (isMainVideo) {
        body.videoUrl = videoUrl;
      } else {
        body.relatedVideos = JSON.stringify([...existingRelated, videoUrl]);
      }

      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSuccessMessage(isMainVideo ? "Ana video eklendi!" : "İlgili video eklendi!");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchIncidents();
      }
    } catch {
      console.error("Failed to attach video");
    } finally {
      setSaving(false);
    }
  }

  async function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedIncident || !videoUrlInput.trim()) return;
    await attachVideo(selectedIncident, videoUrlInput.trim());
    setVideoUrlInput("");
  }

  const filtered = incidents.filter((i) => {
    if (i == null || typeof i !== "object" || !("id" in i)) return false;
    if (filter === "with") return !!i.videoUrl;
    if (filter === "without") return !i.videoUrl;
    return true;
  });

  const withVideoCount = incidents.filter((i) => i.videoUrl).length;
  const withoutVideoCount = incidents.filter((i) => !i.videoUrl).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Video className="h-6 w-6 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Video Yönetimi</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Web&apos;den video arayın ve pozisyonlara ekleyin
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Web Search */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Globe className="h-5 w-5 text-blue-400" />
          Web&apos;den Video Ara
        </h2>
        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ör. Fenerbahçe penaltı pozisyonu hafta 12..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Ara
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{searchResults.length} sonuç bulundu</p>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-3"
              >
                {result.thumbnail ? (
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="h-16 w-24 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md bg-zinc-800">
                    <Video className="h-6 w-6 text-zinc-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{result.title}</p>
                  <p className="text-xs text-zinc-500">{result.source}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-zinc-800 p-2 text-zinc-400 transition-colors hover:text-white"
                    title={getSourceLabel(result.url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {selectedIncident && (
                    <button
                      onClick={() => attachVideo(selectedIncident, result.url)}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Ekle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Add */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Plus className="h-5 w-5 text-emerald-400" />
          Manuel Video Ekle
        </h2>
        <form onSubmit={handleManualAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <select
            value={selectedIncident}
            onChange={(e) => setSelectedIncident(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
          >
            <option value="">Pozisyon seçin</option>
            {incidents.filter((i) => i != null).map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.match ? `${inc.match.homeTeam} vs ${inc.match.awayTeam}` : `Pozisyon #${inc.id.slice(0, 8)}`} – {inc.description.slice(0, 50)}
              </option>
            ))}
          </select>
          <input
            type="url"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            placeholder="Video URL yapıştırın..."
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!selectedIncident || !videoUrlInput || saving}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Video Ekle
          </button>
        </form>
      </div>

      {/* Incident Video List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Crosshair className="h-5 w-5 text-red-400" />
            Pozisyon Videoları
          </h2>
          <div className="flex gap-2">
            {[
              { key: "all" as const, label: `Tümü (${incidents.length})` },
              { key: "with" as const, label: `Videolu (${withVideoCount})` },
              { key: "without" as const, label: `Videosuz (${withoutVideoCount})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-purple-500/10 text-purple-400"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className={`rounded-lg p-2 ${inc.videoUrl ? "bg-purple-500/10" : "bg-zinc-800"}`}>
                  <Video className={`h-4 w-4 ${inc.videoUrl ? "text-purple-400" : "text-zinc-600"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{inc.description}</p>
                  <p className="text-xs text-zinc-500">
                    {inc.match?.homeTeam} vs {inc.match?.awayTeam}
                    {inc.videoUrl && (
                      <a
                        href={inc.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-purple-400 hover:text-purple-300"
                        title={inc.videoUrl}
                      >
                        {getVideoLinkLabel(inc.videoUrl)} ↗
                      </a>
                    )}
                    {Array.isArray(inc.relatedVideos) && inc.relatedVideos.length > 0 && (
                      <span className="ml-2 text-zinc-600">
                        +{inc.relatedVideos.length} ilgili video
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedIncident(inc.id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedIncident === inc.id
                      ? "bg-purple-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  {selectedIncident === inc.id ? "Seçili" : "Seç"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

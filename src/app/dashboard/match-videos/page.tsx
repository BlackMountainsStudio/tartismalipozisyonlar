"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Video,
  Loader2,
  Plus,
  ExternalLink,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight,
  Trash2,
  Download,
  AlertCircle,
} from "lucide-react";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  week: number;
  date: string;
  league: string;
  slug?: string | null;
}

interface MatchVideo {
  id: string;
  matchId: string;
  videoUrl: string;
  title: string | null;
  durationMin: number | null;
  transcript: string | null;
  source: string | null;
  notes: string | null;
  match: Match;
}

export default function MatchVideosPage() {
  const [videos, setVideos] = useState<MatchVideo[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [fetchingTranscript, setFetchingTranscript] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [vRes, mRes] = await Promise.all([
        fetch("/api/match-videos", { cache: "no-store" }),
        fetch("/api/matches?league=Süper Lig 2025-26", { cache: "no-store" }),
      ]);
      const vData = await vRes.json();
      const mData = await mRes.json();
      setVideos(Array.isArray(vData) ? vData : []);
      setMatches(Array.isArray(mData) ? mData : mData && typeof mData === "object" ? [mData] : []);
    } catch {
      setVideos([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatchId || !videoUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/match-videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatchId,
          videoUrl: videoUrl.trim(),
          title: title.trim() || null,
          durationMin: durationMin ? parseInt(durationMin, 10) : null,
          transcript: transcript.trim() || null,
          notes: notes.trim() || null,
          source: "youtube",
        }),
      });
      if (res.ok) {
        setVideoUrl("");
        setTranscript("");
        setTitle("");
        setDurationMin("");
        setNotes("");
        setSelectedMatchId("");
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Eklenemedi");
      }
    } catch (err) {
      alert("Hata: " + (err instanceof Error ? err.message : "Bilinmeyen"));
    } finally {
      setAdding(false);
    }
  }

  async function handleFetchTranscript(videoId: string, url: string) {
    setFetchingTranscript(videoId);
    try {
      const res = await fetch("/api/match-videos/fetch-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: url }),
      });
      const data = await res.json();
      if (res.ok && data.transcript) {
        if (videoId === "new") {
          setTranscript(data.transcript);
          if (data.durationMin && !durationMin) setDurationMin(String(data.durationMin));
        } else {
          // Mevcut video - transcripti kaydet
          const video = videos.find((v) => v.id === videoId);
          if (video) {
            await handleSaveTranscript(video, data.transcript);
            if (data.durationMin && !video.durationMin) {
              await fetch(`/api/match-videos/${videoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ durationMin: data.durationMin }),
              });
            }
            fetchData();
          }
        }
      } else {
        alert(data.error || "Transcript alınamadı");
      }
    } catch (err) {
      alert("Hata: " + (err instanceof Error ? err.message : "Bilinmeyen"));
    } finally {
      setFetchingTranscript(null);
    }
  }

  async function handleSaveTranscript(v: MatchVideo, newTranscript: string) {
    try {
      const res = await fetch(`/api/match-videos/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: newTranscript }),
      });
      if (res.ok) fetchData();
    } catch {
      alert("Kaydedilemedi");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu videoyu silmek istediğinizden emin misiniz?")) return;
    try {
      const res = await fetch(`/api/match-videos/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch {
      alert("Silinemedi");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Maç Videoları ve Transcript</h1>
        <p className="mt-1 text-sm text-zinc-400">
          30+ dk maç özet videoları ekleyin, transcript çıkarın. Doğru maç eşleşmesini buradan kontrol edebilirsiniz.
        </p>
      </div>

      {/* Yeni video ekle formu */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Plus className="h-5 w-5 text-red-400" />
          Yeni Video Ekle
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Maç</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
              required
            >
              <option value="">Maç seçin</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} (Hafta {m.week})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Video URL (YouTube)</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => videoUrl && handleFetchTranscript("new", videoUrl)}
                disabled={!videoUrl.trim() || !!fetchingTranscript}
                className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
              >
                {fetchingTranscript === "new" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Transcript Çıkar
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Transcript (otomatik veya manuel yapıştır)</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Transcript buraya... [0:12] İlk dakikalar..."
              rows={6}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 font-mono text-sm text-zinc-300 placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Başlık</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Maç özeti"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-400">Süre (dk)</label>
              <input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                placeholder="30"
                min={1}
                max={120}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">Notlar</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: beIN maç özeti"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Kaydet
          </button>
        </form>
      </div>

      {/* Kayıtlı videolar listesi */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Video className="h-5 w-5 text-red-400" />
          Kayıtlı Maç Videoları ({videos.length})
        </h2>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Henüz video eklenmemiş</p>
            <p className="mt-1 text-sm text-zinc-500">
              Yukarıdaki form ile maç seçip video URL ekleyin, transcript çıkarıp kaydedin
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((v) => {
              const m = v.match;
              const expanded = expandedId === v.id;
              return (
                <div
                  key={v.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-800/30 overflow-hidden"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between gap-4 p-4"
                    onClick={() => setExpandedId(expanded ? null : v.id)}
                    onKeyDown={(e) => e.key === "Enter" && setExpandedId(expanded ? null : v.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {expanded ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-zinc-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500" />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {m.homeTeam} vs {m.awayTeam}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Hafta {m.week}
                          </span>
                          {v.durationMin && (
                            <>
                              <span>·</span>
                              <span>{v.durationMin} dk</span>
                            </>
                          )}
                          {v.transcript && (
                            <>
                              <span>·</span>
                              <span className="text-emerald-500">{v.transcript.length} karakter transcript</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Video
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(v.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Sil
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-zinc-800 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Transcript</span>
                        <button
                          type="button"
                          onClick={() => handleFetchTranscript(v.id, v.videoUrl)}
                          disabled={!!fetchingTranscript}
                          className="flex items-center gap-1 rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          {fetchingTranscript === v.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          Yeniden çıkar
                        </button>
                      </div>
                      {v.transcript ? (
                        <div className="space-y-2">
                          <textarea
                            defaultValue={v.transcript}
                            rows={12}
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 font-mono text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                            onBlur={(e) => {
                              const val = e.target.value;
                              if (val !== v.transcript) handleSaveTranscript(v, val);
                            }}
                          />
                          <p className="flex items-center gap-2 text-xs text-amber-500/90">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Transcripti kontrol edin: Maç adları, takım isimleri doğru mu?
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 py-8 text-center">
                          <p className="text-sm text-zinc-500">Transcript yok</p>
                          <button
                            type="button"
                            onClick={() => handleFetchTranscript(v.id, v.videoUrl)}
                            disabled={!!fetchingTranscript}
                            className="mt-2 text-sm text-amber-400 hover:text-amber-300"
                          >
                            {fetchingTranscript === v.id ? "Çıkarılıyor..." : "Transcript Çıkar"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { getSourceLabel, getVideoProviderName, getOpenInNewTabLabel, getOpinionSourceLabel } from "@/lib/linkLabels";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  Play,
  ExternalLink,
  Flag,
  Eye,
  ShieldAlert,
  AlertTriangle,
  Newspaper,
  Scale,
  Video,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ChevronRight,
  Link2,
  Copy,
} from "lucide-react";

interface ExpertOpinion {
  id: string;
  comment: string;
  stance: string;
  sourceUrl: string | null;
  commentator: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
}

interface RelatedVideo {
  url: string;
  title: string;
}

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  author: string;
}

interface RefereeComment {
  author?: string;
  text: string;
}

interface Incident {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  videoUrl: string | null;
  relatedVideos: RelatedVideo[] | string;
  newsArticles: NewsArticle[] | string;
  refereeComments?: RefereeComment[] | string;
  opinions: ExpertOpinion[];
  status: string;
  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    week: number;
    date: string;
  } | null;
}

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  POSSIBLE_PENALTY: { label: "Penaltı Pozisyonu", icon: <Flag className="h-5 w-5" />, color: "text-amber-400" },
  PENALTY: { label: "Penaltı Kararı", icon: <Flag className="h-5 w-5" />, color: "text-amber-400" },
  POSSIBLE_OFFSIDE_GOAL: { label: "Ofsayt Tartışması", icon: <Eye className="h-5 w-5" />, color: "text-blue-400" },
  OFFSIDE: { label: "Ofsayt Kararı", icon: <Eye className="h-5 w-5" />, color: "text-blue-400" },
  MISSED_RED_CARD: { label: "Verilmeyen Kırmızı Kart", icon: <ShieldAlert className="h-5 w-5" />, color: "text-red-400" },
  RED_CARD: { label: "Kırmızı Kart", icon: <ShieldAlert className="h-5 w-5" />, color: "text-red-400" },
  YELLOW_CARD: { label: "Sarı Kart", icon: <ShieldAlert className="h-5 w-5" />, color: "text-yellow-400" },
  VAR_CONTROVERSY: { label: "VAR Tartışması", icon: <AlertTriangle className="h-5 w-5" />, color: "text-purple-400" },
  GOAL_DISALLOWED: { label: "İptal Edilen Gol", icon: <AlertTriangle className="h-5 w-5" />, color: "text-orange-400" },
  FOUL: { label: "Faul Kararı", icon: <Flag className="h-5 w-5" />, color: "text-cyan-400" },
  HANDBALL: { label: "El ile Temas", icon: <Flag className="h-5 w-5" />, color: "text-pink-400" },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
  REJECTED: "bg-red-500/10 text-red-400 ring-red-500/30",
};

const STANCE_INFO: Record<string, { label: string; icon: React.ReactNode; style: string; bg: string }> = {
  AGREE: {
    label: "Karar Doğru",
    icon: <CheckCircle2 className="h-4 w-4" />,
    style: "text-emerald-400",
    bg: "border-emerald-500/20 bg-emerald-500/5",
  },
  DISAGREE: {
    label: "Karara İtiraz",
    icon: <XCircle className="h-4 w-4" />,
    style: "text-red-400",
    bg: "border-red-500/20 bg-red-500/5",
  },
  NEUTRAL: {
    label: "Kararsız",
    icon: <MinusCircle className="h-4 w-4" />,
    style: "text-zinc-400",
    bg: "border-zinc-700 bg-zinc-800/30",
  },
};

function parseJson<T>(raw: T | string, fallback: T): T {
  if (Array.isArray(raw)) return raw as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return fallback; }
  }
  return fallback;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:watch\?v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getVideoProviderLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
      return "YouTube";
    }
    if (hostname.includes("beinsports.com.tr")) {
      return "beIN Sports";
    }
    return hostname;
  } catch {
    return "Harici kaynak";
  }
}

/** Kaynak URL'sinden anlamlı etiket üretir (görünürlük ve anlaşılırlık için) */
function getVideoProviderLabel(url: string): string {
  return getVideoProviderName(url);
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: incidentId } = use(params);
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`);
      if (!res.ok) { setIncident(null); return; }
      const data = await res.json();
      setIncident(data);
      if (data.videoUrl) setActiveVideo(data.videoUrl);
    } catch {
      setIncident(null);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (typeof window !== "undefined") setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!incident) return;
    const m = incident.match;
    const summary = m
      ? [
          m.homeTeam,
          "vs",
          m.awayTeam,
          incident.minute != null ? `${incident.minute}. dk` : "",
          (TYPE_LABELS[incident.type] as { label: string } | undefined)?.label ?? incident.type,
        ]
          .filter(Boolean)
          .join(" · ")
      : [
          incident.minute != null ? `${incident.minute}. dk` : "",
          (TYPE_LABELS[incident.type] as { label: string } | undefined)?.label ?? incident.type,
        ]
          .filter(Boolean)
          .join(" · ");
    document.title = summary ? `${summary} | Tartışmalı Pozisyonlar` : "Tartışmalı Pozisyonlar";
    return () => {
      document.title = "Tartışmalı Pozisyonlar - Hakem Kararları Analiz Platformu";
    };
  }, [incident]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Pozisyon bulunamadı</p>
      </div>
    );
  }

  const typeInfo = TYPE_LABELS[incident.type] ?? {
    label: incident.type,
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-zinc-400",
  };

  const relatedVideos = parseJson<RelatedVideo[]>(incident.relatedVideos, []);
  const newsArticles = parseJson<NewsArticle[]>(incident.newsArticles, []);
  const refereeComments = parseJson<RefereeComment[]>(incident.refereeComments ?? [], []);
  const opinions = incident.opinions ?? [];

  const activeYtId = activeVideo ? extractYouTubeId(activeVideo) : null;
  const activeVideoProvider = activeVideo ? getVideoProviderLabel(activeVideo) : null;

  const agreeCount = opinions.filter((o) => o.stance === "AGREE").length;
  const disagreeCount = opinions.filter((o) => o.stance === "DISAGREE").length;

  const positionLink = baseUrl ? `${baseUrl}/incidents/${incidentId}` : "";
  const positionSummary = incident.match
    ? [
        incident.match.homeTeam,
        "vs",
        incident.match.awayTeam,
        incident.minute != null ? `${incident.minute}. dk` : "",
        typeInfo.label,
      ]
        .filter(Boolean)
        .join(", ")
    : [incident.minute != null ? `${incident.minute}. dk` : "", typeInfo.label].filter(Boolean).join(", ");

  const copyPositionLink = () => {
    if (!positionLink) return;
    navigator.clipboard.writeText(positionLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sources = Array.isArray(incident.sources) ? incident.sources : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {incident.match && (
        <button
          onClick={() => router.push(`/matches/${incident.match!.id}`)}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {incident.match.homeTeam} vs {incident.match.awayTeam} maçına dön
        </button>
      )}

      {/* === BAŞLIK KARTI === */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{typeInfo.label}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[incident.status] ?? STATUS_STYLES.PENDING}`}
          >
            {STATUS_LABELS[incident.status] ?? incident.status}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {incident.minute && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {incident.minute}. dakika
            </span>
          )}
          {incident.match && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(incident.match.date).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
          <ConfidenceBadge score={incident.confidenceScore} />
        </div>

        {incident.match && (
          <div className="inline-block rounded-lg bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300">
            {incident.match.homeTeam} vs {incident.match.awayTeam} — {incident.match.league}, Hafta {incident.match.week}
          </div>
        )}
      </div>

      {/* === POZİSYON LİNKİ (paylaşılabilir, anlamlı URL) === */}
      {positionLink && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
            <Link2 className="h-5 w-5 text-red-400" />
            Bu pozisyonun linki
          </h2>
          <p className="mb-2 text-xs text-zinc-500">
            Paylaşmak veya yer imi eklemek için aşağıdaki linki kullanabilirsiniz. Maç, dakika ve pozisyon türü ile tanımlanır.
          </p>
          <p className="mb-2 text-sm font-medium text-amber-400/90">{positionSummary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="block flex-1 break-all rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-300">
              {positionLink}
            </code>
            <button
              type="button"
              onClick={copyPositionLink}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              {copiedLink ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copiedLink ? "Kopyalandı" : "Kopyala"}
            </button>
          </div>
        </div>
      )}

      {/* === KAYNAKLAR (anlamlı etiketlerle) === */}
      {sources.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <ExternalLink className="h-5 w-5 text-red-400" />
            Kaynaklar
          </h2>
          <p className="mb-4 text-xs text-zinc-500">
            Bu pozisyona dair haber, video ve analiz linkleri; etiketler içeriği özetler.
          </p>
          <ul className="space-y-3">
            {sources.map((url, i) => (
              <li key={i}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 px-4 py-3 transition-colors hover:border-zinc-600 hover:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium text-white group-hover:text-red-400">
                    {getSourceLabel(url)}
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-red-400" />
                </a>
                <p className="mt-1 truncate pl-1 text-[10px] text-zinc-600" title={url}>
                  {url}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* === GENEL YAZI === */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Pozisyon Detayı</h2>
        <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">{incident.description}</p>
      </div>

      {/* === HAKEM YORUMLARI (Trio / eski hakem) === */}
      {refereeComments.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
            <Scale className="h-5 w-5 text-amber-400" />
            Hakem Yorumları
          </h2>
          <p className="mb-4 text-xs text-zinc-500">
            beIN Trio ve eski hakemlerin bu pozisyona dair yorumları
          </p>
          <div className="space-y-4">
            {refereeComments.map((rc, i) => (
              <div key={i} className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                {rc.author && (
                  <p className="mb-2 text-xs font-semibold text-amber-400/90">{rc.author}</p>
                )}
                <p className="text-sm leading-relaxed text-zinc-300 italic">&ldquo;{rc.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === VİDEOLAR === */}
      {(activeVideo || relatedVideos.length > 0) && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
            <Video className="h-5 w-5 text-red-400" />
            Videolar
          </h2>

          {activeYtId && (
            <div className="mb-5 aspect-video overflow-hidden rounded-xl border border-zinc-700">
              <iframe
                src={`https://www.youtube.com/embed/${activeYtId}`}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {activeVideo && !activeYtId && (
            <div className="mb-5 aspect-video overflow-hidden rounded-xl border border-zinc-700">
              <iframe
                src={activeVideo}
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={`Pozisyon videosu - ${activeVideoProvider}`}
              />
              <p className="mt-2 text-xs text-zinc-500">
                Kaynak: {activeVideoProvider}
                {" · "}
                <a href={activeVideo} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                  {getOpenInNewTabLabel(activeVideo)}
                </a>
              </p>
            </div>
          )}

          {relatedVideos.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedVideos.map((vid, i) => {
                const ytId = extractYouTubeId(vid.url);
                const isActive = activeVideo === vid.url;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveVideo(vid.url)}
                    className={`group flex gap-3 rounded-lg border p-3 text-left transition-all ${
                      isActive ? "border-red-500/50 bg-red-500/5" : "border-zinc-800 bg-zinc-800/30 hover:border-zinc-700"
                    }`}
                  >
                    <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                      {ytId ? (
                        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt={vid.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Video className="h-5 w-5 text-zinc-600" /></div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-white line-clamp-2">{vid.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{getVideoProviderLabel(vid.url)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* === UZMAN YORUMLARI (ExpertOpinion) === */}
      {opinions.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Scale className="h-5 w-5 text-red-400" />
              Hakem ve Uzman Yorumları
            </h2>
            {opinions.length >= 2 && (
              <div className="flex items-center gap-3 text-xs">
                {disagreeCount > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle className="h-3.5 w-3.5" /> {disagreeCount} itiraz
                  </span>
                )}
                {agreeCount > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {agreeCount} onay
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {opinions.map((op) => {
              const si = STANCE_INFO[op.stance] ?? STANCE_INFO.NEUTRAL;
              return (
                <div key={op.id} className={`rounded-lg border p-4 ${si.bg}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Link
                      href={`/commentators/${op.commentator.slug}`}
                      className="font-semibold text-white hover:text-red-400"
                    >
                      {op.commentator.name}
                    </Link>
                    <span className="text-xs text-zinc-500">{op.commentator.role}</span>
                    <Link
                      href={`/commentators/${op.commentator.slug}`}
                      className="text-zinc-600 hover:text-red-400"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 italic">
                    &ldquo;{op.comment}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`flex items-center gap-1 text-xs font-medium ${si.style}`}>
                      {si.icon} {si.label}
                    </span>
                    {op.sourceUrl && (
                      <a
                        href={op.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-zinc-800/60 px-2 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-zinc-800 hover:text-red-300"
                        title={op.sourceUrl}
                      >
                        {getOpinionSourceLabel(op.sourceUrl)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === BASIN VE HABERLER === */}
      {newsArticles.length > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
            <Newspaper className="h-5 w-5 text-red-400" />
            Basın ve Haberler
          </h2>
          <div className="space-y-3">
            {newsArticles.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/20 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-700/50">
                  <Newspaper className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white group-hover:text-red-400 line-clamp-2">{article.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-400">{article.source}</span>
                    {article.author && <><span>·</span><span>{article.author}</span></>}
                  </div>
                </div>
                <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-red-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* === YORUMLAR === */}
      <CommentSection incidentId={incidentId} />
    </div>
  );
}

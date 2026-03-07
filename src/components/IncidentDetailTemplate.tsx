"use client";

import Link from "next/link";
import ConfidenceBadge from "./ConfidenceBadge";
import { getSourceLabel, getVideoProviderName, getOpenInNewTabLabel, getOpinionSourceLabel } from "@/lib/linkLabels";
import {
  ArrowLeft,
  Calendar,
  Clock,
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
} from "lucide-react";

export interface IncidentDetailData {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  videoUrl: string | null;
  relatedVideos: { url: string; title: string }[];
  newsArticles: { title: string; url: string; source: string; author: string }[];
  refereeComments: { author?: string; text: string; sourceUrl?: string }[];
  opinions: {
    id: string;
    comment: string;
    stance: string;
    sourceUrl: string | null;
    commentator: { id: string; name: string; slug: string; role: string };
  }[];
  status: string;
  match?: { id: string; homeTeam: string; awayTeam: string; league: string; week: number; date: string } | null;
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
  AGREE: { label: "Karar Doğru", icon: <CheckCircle2 className="h-4 w-4" />, style: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-500/5" },
  DISAGREE: { label: "Karara İtiraz", icon: <XCircle className="h-4 w-4" />, style: "text-red-400", bg: "border-red-500/20 bg-red-500/5" },
  NEUTRAL: { label: "Kararsız", icon: <MinusCircle className="h-4 w-4" />, style: "text-zinc-400", bg: "border-zinc-700 bg-zinc-800/30" },
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:watch\?v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

interface IncidentDetailTemplateProps {
  incident: IncidentDetailData;
  activeVideo: string | null;
  onBack?: () => void;
  children?: React.ReactNode;
}

export default function IncidentDetailTemplate({
  incident,
  activeVideo,
  onBack,
  children,
}: IncidentDetailTemplateProps) {
  const typeInfo = TYPE_LABELS[incident.type] ?? { label: incident.type, icon: <AlertTriangle className="h-5 w-5" />, color: "text-zinc-400" };
  const activeYtId = activeVideo ? extractYouTubeId(activeVideo) : null;
  const activeVideoProvider = activeVideo ? getVideoProviderName(activeVideo) : null;
  const relatedVideos = incident.relatedVideos ?? [];
  const refereeComments = incident.refereeComments ?? [];
  const opinions = incident.opinions ?? [];
  const newsArticles = incident.newsArticles ?? [];
  const agreeCount = opinions.filter((o) => o.stance === "AGREE").length;
  const disagreeCount = opinions.filter((o) => o.stance === "DISAGREE").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {onBack && incident.match && (
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          {incident.match.homeTeam} vs {incident.match.awayTeam} maçına dön
        </button>
      )}

      {/* 1. BAŞLIK KARTI */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{typeInfo.label}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[incident.status] ?? STATUS_STYLES.PENDING}`}>
            {STATUS_LABELS[incident.status] ?? incident.status}
          </span>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {incident.minute != null && (
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

      {/* 2. POZİSYON DETAYI */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Pozisyon Detayı</h2>
        <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">{incident.description}</p>
      </div>

      {/* 3. VİDEO */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Video className="h-5 w-5 text-red-400" />
          Video
        </h2>

        {(incident.videoUrl || relatedVideos.length > 0) ? (
          <div className="space-y-4">
            {activeYtId && (
              <div className="aspect-video overflow-hidden rounded-xl border border-zinc-700">
                <iframe
                  src={`https://www.youtube.com/embed/${activeYtId}`}
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title="Pozisyon videosu"
                />
              </div>
            )}
            {activeVideo && !activeYtId && (
              <div className="aspect-video overflow-hidden rounded-xl border border-zinc-700">
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
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Bu pozisyonda henüz video eklenmemiş.</p>
        )}
      </div>

      {/* 4. HAKEM VE UZMAN YORUMLARI */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Scale className="h-5 w-5 text-red-400" />
            Hakem ve Uzman Yorumları
          </h2>
          {opinions.length >= 2 && (
            <div className="flex items-center gap-3 text-xs">
              {disagreeCount > 0 && <span className="flex items-center gap-1 text-red-400"><XCircle className="h-3.5 w-3.5" /> {disagreeCount} itiraz</span>}
              {agreeCount > 0 && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> {agreeCount} onay</span>}
            </div>
          )}
        </div>
        <p className="mb-4 text-xs text-zinc-500">beIN Trio, eski hakemler ve uzmanların bu pozisyona dair yorumları</p>
        {(refereeComments.length > 0 || opinions.length > 0) ? (
          <div className="space-y-4">
            {refereeComments.map((rc, i) => (
              <div key={`rc-${i}`} className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                {rc.author && <p className="mb-2 text-xs font-semibold text-amber-400/90">{rc.author}</p>}
                <p className="text-sm leading-relaxed text-zinc-300 italic">&ldquo;{rc.text}&rdquo;</p>
                {rc.sourceUrl && (
                  <div className="mt-3 flex justify-end">
                    <a
                      href={rc.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-zinc-800 hover:text-red-300"
                      title={rc.sourceUrl}
                    >
                      {getSourceLabel(rc.sourceUrl)} <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
            {opinions.map((op) => {
              const si = STANCE_INFO[op.stance] ?? STANCE_INFO.NEUTRAL;
              return (
                <div key={op.id} className={`rounded-lg border p-4 ${si.bg}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Link href={`/commentators/${op.commentator.slug}`} className="font-semibold text-white hover:text-red-400">{op.commentator.name}</Link>
                    <span className="text-xs text-zinc-500">{op.commentator.role}</span>
                    <Link href={`/commentators/${op.commentator.slug}`} className="text-zinc-600 hover:text-red-400"><ChevronRight className="h-3.5 w-3.5" /></Link>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300 italic">&ldquo;{op.comment}&rdquo;</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`flex items-center gap-1 text-xs font-medium ${si.style}`}>{si.icon} {si.label}</span>
                    {op.sourceUrl && (
                      <a href={op.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-md bg-zinc-800/60 px-2 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-zinc-800 hover:text-red-300" title={op.sourceUrl}>
                        {getOpinionSourceLabel(op.sourceUrl)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Bu pozisyonda henüz hakem veya uzman yorumu eklenmemiş.</p>
        )}
      </div>

      {/* 6. BASIN VE HABERLER */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
          <Newspaper className="h-5 w-5 text-red-400" />
          Basın ve Haberler
        </h2>
        {newsArticles.length > 0 ? (
          <div className="space-y-3">
            {newsArticles.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/20 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40">
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
        ) : (
          <p className="text-sm text-zinc-500">Bu pozisyonda henüz basın haberi eklenmemiş.</p>
        )}
      </div>

      {/* 7. YORUMLAR (children = CommentSection) */}
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import ConfidenceBadge from "./ConfidenceBadge";
import VoteSection from "./VoteSection";
import SimilarPositionsSection from "./SimilarPositionsSection";
import AIPredictionSection from "./AIPredictionSection";
import { getSourceLabel, getVideoProviderName, getOpenInNewTabLabel, getOpinionSourceLabel } from "@/lib/linkLabels";
import { getIncidentImpactPoints } from "@/lib/incidentCategories";
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
  UserRound,
} from "lucide-react";

export interface IncidentDetailData {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  inFavorOf?: string | null;
  against?: string | null;
  videoUrl: string | null;
  relatedVideos: { url: string; title: string }[];
  newsArticles: { title: string; url: string; source: string; author: string }[];
  refereeComments: { author?: string; text: string; sourceUrl?: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[];
  opinions: {
    id: string;
    comment: string;
    stance: string;
    sourceUrl: string | null;
    commentator: { id: string; name: string; slug: string; role: string };
  }[];
  status: string;
  match?: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    week: number;
    date: string;
    referee?: { id: string; name: string; slug: string; role: string } | null;
    varReferee?: { id: string; name: string; slug: string; role: string } | null;
  } | null;
}

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  POSSIBLE_PENALTY: { label: "Penaltı Pozisyonu", icon: <Flag className="h-5 w-5" />, color: "text-amber-400" },
  PENALTY: { label: "Penaltı Kararı", icon: <Flag className="h-5 w-5" />, color: "text-amber-400" },
  POSSIBLE_OFFSIDE_GOAL: { label: "Ofsayt Tartışması", icon: <Eye className="h-5 w-5" />, color: "text-blue-400" },
  OFFSIDE: { label: "Ofsayt Kararı", icon: <Eye className="h-5 w-5" />, color: "text-blue-400" },
  MISSED_RED_CARD: { label: "Verilmeyen Kırmızı Kart", icon: <ShieldAlert className="h-5 w-5" />, color: "text-red-400" },
  MISSED_YELLOW: { label: "Verilmeyen Sarı Kart", icon: <ShieldAlert className="h-5 w-5" />, color: "text-yellow-400" },
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

const BEIN_TRIO_NAMES = ["Deniz Çoban (beIN Trio)", "Bahattin Duran (beIN Trio)", "Bülent Yıldırım (beIN Trio)"];

function expandRefereeCommentsForDisplay(
  comments: { author?: string; text: string; sourceUrl?: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[]
): { author: string; text: string; sourceUrl?: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[] {
  const result: { author: string; text: string; sourceUrl?: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[] = [];
  for (const rc of comments) {
    if (rc.author === "beIN Trio" && (rc.stance === "AGREE" || rc.stance === "DISAGREE")) {
      for (const name of BEIN_TRIO_NAMES) {
        result.push({ ...rc, author: name });
      }
    } else {
      result.push({ ...rc, author: rc.author ?? "" });
    }
  }
  return result;
}

function countRefereeStances(
  comments: { author?: string; text: string; stance?: "AGREE" | "DISAGREE" | "NEUTRAL" }[]
): { agree: number; disagree: number; total: number } {
  let agree = 0;
  let disagree = 0;
  for (const rc of comments) {
    if (!rc.stance || !["AGREE", "DISAGREE", "NEUTRAL"].includes(rc.stance)) continue;
    const weight = rc.author === "beIN Trio" ? 3 : 1;
    if (rc.stance === "AGREE") agree += weight;
    else if (rc.stance === "DISAGREE") disagree += weight;
  }
  return { agree, disagree, total: agree + disagree };
}

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
  const rcStanceCounts = countRefereeStances(refereeComments);
  const rcAgreeCount = rcStanceCounts.agree;
  const rcDisagreeCount = rcStanceCounts.disagree;
  const rcTotalWithStance = rcStanceCounts.total;
  const displayRefereeComments = expandRefereeCommentsForDisplay(refereeComments);

  const hasVerdict = opinions.length > 0 || rcTotalWithStance > 0;
  const verdictAgree = opinions.length > 0 ? agreeCount : rcAgreeCount;
  const verdictDisagree = opinions.length > 0 ? disagreeCount : rcDisagreeCount;
  const verdictTotal = verdictAgree + verdictDisagree;
  const agreePercent = verdictTotal > 0 ? (verdictAgree / verdictTotal) * 100 : 0;
  const verdict =
    !hasVerdict || verdictTotal === 0
      ? null
      : agreePercent >= 60
        ? { label: "Doğru karar", style: "text-emerald-400", bg: "bg-emerald-500/10" }
        : agreePercent <= 40
          ? { label: "Yanlış karar", style: "text-red-400", bg: "bg-red-500/10" }
          : { label: "Kararsız", style: "text-amber-400", bg: "bg-amber-500/10" };

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
          <Link
            href="/rehber"
            className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20 transition-colors hover:bg-amber-500/20"
            title="Puanlama rehberi"
          >
            {getIncidentImpactPoints(incident.type)} puan
          </Link>
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
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300">
              {incident.match.homeTeam} vs {incident.match.awayTeam} — {incident.match.league}, Hafta {incident.match.week}
            </div>
            {(incident.inFavorOf || incident.against) && (
              <div className="flex flex-wrap items-center gap-2">
                {incident.inFavorOf && (
                  <span className="rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    {incident.inFavorOf} lehine
                  </span>
                )}
                {incident.against && (
                  <span className="rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-400">
                    {incident.against} aleyhine
                  </span>
                )}
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-zinc-400">Hakem kararı:</span>
                <span className="text-sm font-medium text-white">{typeInfo.label}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-zinc-700 pl-4">
                <span className="text-sm text-zinc-500">Yorumcular:</span>
                {opinions.length > 0 ? (
                  <span className="text-sm">
                    <span className="text-emerald-400">{agreeCount}/{opinions.length} katılıyor</span>
                    <span className="mx-2 text-zinc-600">·</span>
                    <span className="text-red-400">{disagreeCount}/{opinions.length} karşı</span>
                  </span>
                ) : rcTotalWithStance > 0 ? (
                  <span className="text-sm">
                    <span className="text-emerald-400">{rcAgreeCount}/{rcTotalWithStance} katılıyor</span>
                    <span className="mx-2 text-zinc-600">·</span>
                    <span className="text-red-400">{rcDisagreeCount}/{rcTotalWithStance} karşı</span>
                  </span>
                ) : refereeComments.length > 0 ? (
                  <span className="text-sm text-zinc-500">
                    {refereeComments.length} alıntı
                  </span>
                ) : (
                  <span className="text-sm text-zinc-500">–</span>
                )}
              </div>
              {verdict && (
                <div className={`flex items-center gap-2 border-l border-zinc-700 pl-4`}>
                  <span className="text-sm text-zinc-500">Sonuç:</span>
                  <span className={`rounded-md px-2 py-0.5 text-sm font-medium ${verdict.bg} ${verdict.style}`}>
                    {verdict.label}
                  </span>
                </div>
              )}
            </div>
            {(incident.match.referee || incident.match.varReferee) && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {incident.match.referee && (
                  <Link
                    href={`/hakemler/${incident.match.referee.slug}`}
                    className="flex items-center gap-1.5 rounded-md bg-zinc-800/50 px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    <UserRound className="h-3.5 w-3.5 text-red-400" />
                    Hakem: {incident.match.referee.name}
                  </Link>
                )}
                {incident.match.varReferee && (
                  <Link
                    href={`/hakemler/${incident.match.varReferee.slug}`}
                    className="flex items-center gap-1.5 rounded-md bg-zinc-800/50 px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
                  >
                    <UserRound className="h-3.5 w-3.5 text-amber-400" />
                    VAR: {incident.match.varReferee.name}
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. POZİSYON DETAYI */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Pozisyon Detayı</h2>
        {incident.match && (incident.match.referee || incident.match.varReferee) && (
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Maç hakemleri</span>
            {incident.match.referee && (
              <Link
                href={`/hakemler/${incident.match.referee.slug}`}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <UserRound className="h-3.5 w-3.5 text-red-400" />
                {incident.match.referee.name} <span className="text-zinc-500">(Hakem)</span>
              </Link>
            )}
            {incident.match.varReferee && (
              <Link
                href={`/hakemler/${incident.match.varReferee.slug}`}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800/80 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
              >
                <UserRound className="h-3.5 w-3.5 text-amber-400" />
                {incident.match.varReferee.name} <span className="text-zinc-500">(VAR)</span>
              </Link>
            )}
          </div>
        )}
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

      {/* 3.5 KULLANICI OYLAMA */}
      <VoteSection
        incidentId={incident.id}
        refereeDecisionLabel={typeInfo.label}
      />

      {/* 3.6 BENZER POZİSYONLAR */}
      <SimilarPositionsSection incidentId={incident.id} />

      {/* 3.7 AI KARAR TAHMİNİ */}
      <AIPredictionSection incidentId={incident.id} />

      {/* 4. HAKEM VE UZMAN YORUMLARI */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Scale className="h-5 w-5 text-red-400" />
            Hakem ve Uzman Yorumları
          </h2>
          {(opinions.length > 0 || rcTotalWithStance > 0) && (
            <div className="flex items-center gap-2 rounded-full bg-zinc-800/70 px-3 py-1 text-xs">
              {opinions.length > 0 ? (
                <>
                  <span className="text-emerald-400">{agreeCount}/{opinions.length} katılıyor</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-red-400">{disagreeCount}/{opinions.length} karşı</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-400">{rcAgreeCount}/{rcTotalWithStance} katılıyor</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-red-400">{rcDisagreeCount}/{rcTotalWithStance} karşı</span>
                </>
              )}
            </div>
          )}
        </div>
        {(refereeComments.length > 0 || opinions.length > 0) ? (
          <div className="space-y-4">
            {displayRefereeComments.map((rc, i) => {
              const si = rc.stance ? (STANCE_INFO[rc.stance] ?? STANCE_INFO.NEUTRAL) : null;
              return (
              <div key={`rc-${i}`} className={`rounded-lg border p-4 ${si ? si.bg : "border-zinc-700/50 bg-zinc-800/30"}`}>
                {rc.author && <p className="mb-2 text-xs font-semibold text-amber-400/90">{rc.author}</p>}
                <p className="text-sm leading-relaxed text-zinc-300 italic">&ldquo;{rc.text}&rdquo;</p>
                {si && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className={`flex items-center gap-1 text-xs font-medium ${si.style}`}>{si.icon} {si.label}</span>
                  </div>
                )}
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
            );
            })}
            {opinions.map((op) => {
              const si = STANCE_INFO[op.stance] ?? STANCE_INFO.NEUTRAL;
              return (
                <div key={op.id} className={`rounded-lg border p-4 ${si.bg}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <Link href={`/yorumcular/${op.commentator.slug}`} className="font-semibold text-white hover:text-red-400">{op.commentator.name}</Link>
                    <span className="text-xs text-zinc-500">{op.commentator.role}</span>
                    <Link href={`/yorumcular/${op.commentator.slug}`} className="text-zinc-600 hover:text-red-400"><ChevronRight className="h-3.5 w-3.5" /></Link>
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

"use client";

import Link from "next/link";
import { Clock, AlertTriangle, ShieldAlert, Eye, Flag, ChevronRight, Video } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge";
import { getVideoLinkLabel } from "@/lib/linkLabels";

interface IncidentCardProps {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  confidenceScore: number;
  sources: string[];
  status: string;
  matchInfo?: string;
  videoUrl?: string | null;
  actions?: React.ReactNode;
  clickable?: boolean;
}

const INCIDENT_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  MAÇ_ÖZETİ: { label: "Maç Özeti", icon: <Eye className="h-4 w-4" /> },
  POSSIBLE_PENALTY: { label: "Penaltı Pozisyonu", icon: <Flag className="h-4 w-4" /> },
  PENALTY: { label: "Penaltı Kararı", icon: <Flag className="h-4 w-4" /> },
  POSSIBLE_OFFSIDE_GOAL: { label: "Ofsayt Tartışması", icon: <Eye className="h-4 w-4" /> },
  OFFSIDE: { label: "Ofsayt Kararı", icon: <Eye className="h-4 w-4" /> },
  MISSED_RED_CARD: { label: "Verilmeyen Kırmızı Kart", icon: <ShieldAlert className="h-4 w-4" /> },
  RED_CARD: { label: "Kırmızı Kart", icon: <ShieldAlert className="h-4 w-4" /> },
  YELLOW_CARD: { label: "Sarı Kart", icon: <ShieldAlert className="h-4 w-4" /> },
  VAR_CONTROVERSY: { label: "VAR Tartışması", icon: <AlertTriangle className="h-4 w-4" /> },
  GOAL_DISALLOWED: { label: "İptal Edilen Gol", icon: <AlertTriangle className="h-4 w-4" /> },
  FOUL: { label: "Faul Kararı", icon: <Flag className="h-4 w-4" /> },
  HANDBALL: { label: "El ile Temas", icon: <Flag className="h-4 w-4" /> },
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

export default function IncidentCard({
  id,
  type,
  minute,
  description,
  confidenceScore,
  status,
  matchInfo,
  videoUrl,
  actions,
  clickable = false,
}: IncidentCardProps) {
  const typeInfo = INCIDENT_TYPE_LABELS[type] ?? {
    label: type,
    icon: <AlertTriangle className="h-4 w-4" />,
  };

  const cardContent = (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">{typeInfo.icon}</span>
          <span className="font-semibold text-white">{typeInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge score={confidenceScore} />
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status] ?? STATUS_STYLES.PENDING}`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
          {clickable && <ChevronRight className="h-4 w-4 text-zinc-500" />}
        </div>
      </div>

      {(minute || matchInfo) && (
        <div className="mb-3 flex items-center gap-3 text-sm text-zinc-400">
          {minute && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {minute}&apos;
            </span>
          )}
          {matchInfo && <span>{matchInfo}</span>}
        </div>
      )}

      <p className="text-sm leading-relaxed text-zinc-300 line-clamp-2">
        {description}
      </p>

      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300"
          title={videoUrl}
        >
          <Video className="h-3.5 w-3.5" />
          {getVideoLinkLabel(videoUrl)}
        </a>
      )}

      {clickable && (
        <div className="mt-3 text-xs font-medium text-red-400">
          Pozisyon detayı, video ve yorumlar →
        </div>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">{actions}</div>}
    </>
  );

  if (clickable) {
    return (
      <Link
        href={`/incidents/${id}`}
        className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-red-500/30 hover:bg-zinc-900"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-zinc-700">
      {cardContent}
    </div>
  );
}

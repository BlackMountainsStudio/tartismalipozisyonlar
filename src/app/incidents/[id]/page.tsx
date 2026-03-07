"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import IncidentDetailTemplate, { type IncidentDetailData } from "@/components/IncidentDetailTemplate";
import { Loader2 } from "lucide-react";

const TYPE_LABELS: Record<string, { label: string }> = {
  POSSIBLE_PENALTY: { label: "Penaltı Pozisyonu" },
  PENALTY: { label: "Penaltı Kararı" },
  POSSIBLE_OFFSIDE_GOAL: { label: "Ofsayt Tartışması" },
  OFFSIDE: { label: "Ofsayt Kararı" },
  MISSED_RED_CARD: { label: "Verilmeyen Kırmızı Kart" },
  RED_CARD: { label: "Kırmızı Kart" },
  YELLOW_CARD: { label: "Sarı Kart" },
  VAR_CONTROVERSY: { label: "VAR Tartışması" },
  GOAL_DISALLOWED: { label: "İptal Edilen Gol" },
  FOUL: { label: "Faul Kararı" },
  HANDBALL: { label: "El ile Temas" },
};

function parseJson<T>(raw: T | string, fallback: T): T {
  if (Array.isArray(raw)) return raw as T;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return fallback; }
  }
  return fallback;
}

function toTemplateData(incident: unknown): IncidentDetailData | null {
  if (!incident || typeof incident !== "object") return null;
  const d = incident as Record<string, unknown>;
  return {
    id: String(d.id ?? ""),
    type: String(d.type ?? ""),
    minute: typeof d.minute === "number" ? d.minute : null,
    description: String(d.description ?? ""),
    confidenceScore: Number(d.confidenceScore ?? 0),
    sources: Array.isArray(d.sources) ? d.sources.map(String) : [],
    videoUrl: d.videoUrl ? String(d.videoUrl) : null,
    relatedVideos: parseJson<{ url: string; title: string }[]>(d.relatedVideos as string | unknown[], []),
    newsArticles: parseJson<{ title: string; url: string; source: string; author: string }[]>(d.newsArticles as string | unknown[], []),
    refereeComments: parseJson<{ author?: string; text: string; sourceUrl?: string }[]>(d.refereeComments as string | unknown[] ?? [], []),
    opinions: Array.isArray(d.opinions) ? d.opinions as IncidentDetailData["opinions"] : [],
    status: String(d.status ?? "PENDING"),
    match: d.match && typeof d.match === "object" ? (d.match as IncidentDetailData["match"]) : null,
  };
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: incidentId } = use(params);
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`);
      if (!res.ok) { setIncident(null); return; }
      const data = await res.json();
      const parsed = toTemplateData(data);
      setIncident(parsed);
      if (parsed?.videoUrl) setActiveVideo(parsed.videoUrl);
    } catch {
      setIncident(null);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!incident) return;
    const m = incident.match;
    const summary = m
      ? [m.homeTeam, "vs", m.awayTeam, incident.minute != null ? `${incident.minute}. dk` : "", (TYPE_LABELS[incident.type] as { label: string } | undefined)?.label ?? incident.type].filter(Boolean).join(" · ")
      : [incident.minute != null ? `${incident.minute}. dk` : "", (TYPE_LABELS[incident.type] as { label: string } | undefined)?.label ?? incident.type].filter(Boolean).join(" · ");
    document.title = summary ? `${summary} | Var Odası` : "Var Odası";
    return () => {
      document.title = "Var Odası - Hakem Kararları Analiz Platformu";
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
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Pozisyon bulunamadı</p>
      </div>
    );
  }

  return (
    <IncidentDetailTemplate
      incident={incident}
      activeVideo={activeVideo}
      onBack={incident.match ? () => router.push(`/matches/${incident.match!.id}`) : undefined}
    >
      <CommentSection incidentId={incidentId} />
    </IncidentDetailTemplate>
  );
}

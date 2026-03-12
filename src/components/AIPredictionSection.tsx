"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

interface AIPredictionSectionProps {
  incidentId: string;
}

const LABELS: Record<string, string> = {
  PENALTY: "Penaltı",
  CONTINUE: "Devam",
  YELLOW_CARD: "Sarı Kart",
  RED_CARD: "Kırmızı Kart",
};

export default function AIPredictionSection({ incidentId }: AIPredictionSectionProps) {
  const [data, setData] = useState<{
    predictions: Record<string, number>;
    note?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/incidents/${incidentId}/ai-prediction`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.predictions) {
          setData(d);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [incidentId]);

  if (loading || !data) return null;

  const entries = Object.entries(data.predictions)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <Sparkles className="h-5 w-5 text-amber-400" />
        AI Tahmini
      </h2>
      <div className="space-y-3">
        {entries.map(([key, pct]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 text-sm text-zinc-400">{LABELS[key] ?? key}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-2 rounded-full bg-amber-500/80 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm font-medium text-white">%{pct}</span>
          </div>
        ))}
      </div>
      {data.note && (
        <p className="mt-3 text-xs text-zinc-500">{data.note}</p>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { incidentUrl } from "@/lib/links";
import { GitCompare, ChevronRight } from "lucide-react";

interface SimilarPosition {
  id: string;
  type: string;
  minute: number | null;
  description: string;
  similarityScore: number;
  matchInfo: string;
  matchSlug: string;
  incidentSlug: string;
}

interface SimilarPositionsSectionProps {
  incidentId: string;
}

export default function SimilarPositionsSection({ incidentId }: SimilarPositionsSectionProps) {
  const [similar, setSimilar] = useState<SimilarPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/incidents/${incidentId}/similar`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data.similar)) {
          setSimilar(data.similar);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [incidentId]);

  if (loading || similar.length === 0) return null;

  return (
    <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <GitCompare className="h-5 w-5 text-red-400" />
        Bu pozisyona benzer olaylar
      </h2>
      <div className="space-y-3">
        {similar.map((s) => (
          <Link
            key={s.id}
            href={incidentUrl(s.matchSlug, s.incidentSlug)}
            className="block rounded-lg border border-zinc-800 bg-zinc-800/30 p-4 transition hover:border-red-500/30 hover:bg-zinc-800/50"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{s.matchInfo}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{s.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  {s.minute != null && <span>{s.minute}. dk</span>}
                  <span>·</span>
                  <span>Benzerlik: %{Math.round(s.similarityScore * 100)}</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

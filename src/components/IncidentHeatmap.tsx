"use client";

import { useMemo } from "react";

interface Incident {
  minute: number | null;
  type: string;
}

interface IncidentHeatmapProps {
  incidents: Incident[];
  title?: string;
}

/** Dakika bazlı pozisyon yoğunluğu - 15'er dakikalık dilimler */
const MINUTE_BUCKETS = [
  { min: 0, max: 15, label: "0-15" },
  { min: 16, max: 30, label: "16-30" },
  { min: 31, max: 45, label: "31-45" },
  { min: 46, max: 60, label: "46-60" },
  { min: 61, max: 90, label: "61-90" },
  { min: 91, max: 120, label: "90+" },
];

export default function IncidentHeatmap({ incidents, title = "Pozisyon yoğunluğu (dakika)" }: IncidentHeatmapProps) {
  const byBucket = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of MINUTE_BUCKETS) {
      counts[b.label] = 0;
    }
    for (const inc of incidents) {
      const min = inc.minute ?? 0;
      for (const b of MINUTE_BUCKETS) {
        if (min >= b.min && min <= b.max) {
          counts[b.label] += 1;
          break;
        }
      }
    }
    return counts;
  }, [incidents]);

  const maxCount = Math.max(...Object.values(byBucket), 1);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      )}
      <div className="flex gap-2">
        {MINUTE_BUCKETS.map((b) => {
          const count = byBucket[b.label] ?? 0;
          const intensity = maxCount > 0 ? count / maxCount : 0;
          const bg = intensity > 0.7
            ? "bg-red-500"
            : intensity > 0.4
              ? "bg-amber-500"
              : intensity > 0.1
                ? "bg-amber-500/50"
                : "bg-zinc-700/50";
          return (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={`h-12 w-full rounded-md ${bg} transition-all`}
                style={{ minHeight: intensity > 0 ? 24 + intensity * 48 : 12 }}
                title={`${b.label}. dk: ${count} pozisyon`}
              />
              <span className="text-xs text-zinc-500">{b.label}</span>
              {count > 0 && (
                <span className="text-xs font-medium text-zinc-400">{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

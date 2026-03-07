"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tags,
  Loader2,
  BarChart3,
  Crosshair,
} from "lucide-react";
import {
  INCIDENT_TYPE_LABELS,
  INCIDENT_CATEGORIES,
  CATEGORY_ORDER,
} from "@/lib/incidentCategories";

interface TypeCount {
  type: string;
  count: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface CategoryGroup {
  key: string;
  label: string;
  types: TypeCount[];
  total: number;
}

export default function DashboardCategoriesPage() {
  const [typeStats, setTypeStats] = useState<TypeCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/incidents");
      const data = await res.json();
      const incidents = Array.isArray(data) ? data : [];

      const countMap: Record<string, TypeCount> = {};
      for (const type of Object.keys(INCIDENT_TYPE_LABELS)) {
        countMap[type] = { type, count: 0, approved: 0, pending: 0, rejected: 0 };
      }

      for (const inc of incidents) {
        if (!countMap[inc.type]) {
          countMap[inc.type] = { type: inc.type, count: 0, approved: 0, pending: 0, rejected: 0 };
        }
        countMap[inc.type].count++;
        if (inc.status === "APPROVED") countMap[inc.type].approved++;
        else if (inc.status === "PENDING") countMap[inc.type].pending++;
        else if (inc.status === "REJECTED") countMap[inc.type].rejected++;
      }

      setTypeStats(Object.values(countMap));
    } catch {
      setTypeStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoryGroups: CategoryGroup[] = CATEGORY_ORDER.map((catKey) => {
    const matchingTypes = Object.entries(INCIDENT_CATEGORIES)
      .filter(([, val]) => val.key === catKey)
      .map(([type]) => type);

    const types = matchingTypes
      .map((t) => typeStats.find((ts) => ts.type === t))
      .filter((t): t is TypeCount => !!t);

    const label = INCIDENT_CATEGORIES[matchingTypes[0]]?.label ?? catKey;
    const total = types.reduce((acc, t) => acc + t.count, 0);

    return { key: catKey, label, types, total };
  });

  const totalIncidents = typeStats.reduce((acc, t) => acc + t.count, 0);
  const totalApproved = typeStats.reduce((acc, t) => acc + t.approved, 0);
  const totalPending = typeStats.reduce((acc, t) => acc + t.pending, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Tags className="h-6 w-6 text-pink-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Kategori Yönetimi</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Pozisyon kategorileri ve tür dağılımı
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <p className="text-3xl font-bold text-white">{totalIncidents}</p>
          <p className="mt-1 text-sm text-zinc-500">Toplam Pozisyon</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <p className="text-3xl font-bold text-emerald-400">{totalApproved}</p>
          <p className="mt-1 text-sm text-zinc-500">Onaylanan</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{totalPending}</p>
          <p className="mt-1 text-sm text-zinc-500">Bekleyen</p>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-6">
        {categoryGroups.map((group) => (
          <div key={group.key} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <BarChart3 className="h-5 w-5 text-pink-400" />
                {group.label}
              </h2>
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm font-medium text-zinc-400">
                {group.total} pozisyon
              </span>
            </div>

            {/* Visual bar */}
            {totalIncidents > 0 && (
              <div className="mb-4">
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pink-500 to-red-500 transition-all"
                    style={{ width: `${(group.total / totalIncidents) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-xs text-zinc-600">
                  {totalIncidents > 0 ? ((group.total / totalIncidents) * 100).toFixed(1) : 0}%
                </p>
              </div>
            )}

            <div className="space-y-2">
              {group.types.map((t) => (
                <div
                  key={t.type}
                  className="flex items-center gap-4 rounded-lg bg-zinc-800/50 px-4 py-3"
                >
                  <Crosshair className="h-4 w-4 shrink-0 text-red-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {INCIDENT_TYPE_LABELS[t.type] ?? t.type}
                    </p>
                    <p className="text-xs text-zinc-500">{t.type}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <span className="text-zinc-400">{t.count} toplam</span>
                    <span className="text-emerald-400">{t.approved} onaylı</span>
                    <span className="text-amber-400">{t.pending} bekleyen</span>
                    <span className="text-red-400">{t.rejected} red</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, UserRound, ChevronRight, AlertTriangle } from "lucide-react";

interface RefereeListItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  matchesWithIncidentsCount: number;
  totalIncidentsInThoseMatches: number;
}

const ROLE_LABELS: Record<string, string> = {
  REFEREE: "Hakem",
  VAR: "VAR Hakemi",
};

type RoleFilter = "all" | "REFEREE" | "VAR";

const FILTER_TABS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "REFEREE", label: "Hakem" },
  { value: "VAR", label: "VAR" },
];

export default function HakemlerPage() {
  const [referees, setReferees] = useState<RefereeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  useEffect(() => {
    fetch("/api/referees", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setReferees(Array.isArray(d) ? d : []))
      .catch(() => setReferees([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredReferees =
    roleFilter === "all"
      ? referees
      : referees.filter((r) => r.role === roleFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <UserRound className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">Hakemler</h1>
        <p className="text-zinc-400">
          Maçlarda görev yapan hakem ve VAR hakemleri · Tartışmalı karar aldıkları maçlar
        </p>
      </div>

      {/* Hakem / VAR filtresi */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-500">Görev:</span>
        <div className="flex rounded-xl border border-zinc-700 bg-zinc-800/80 p-0.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRoleFilter(tab.value)}
              className={`min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                roleFilter === tab.value
                  ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/50"
                  : "text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">
          {filteredReferees.length} kişi
        </span>
      </div>

      {referees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
          <UserRound className="mb-4 h-12 w-12 text-zinc-700" />
          <p className="text-lg text-zinc-400">Henüz hakem kaydı yok</p>
          <p className="mt-1 text-sm text-zinc-500">
            Maçlara hakem atandıkça burada listelenecek
          </p>
        </div>
      ) : filteredReferees.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <p className="text-zinc-400">Bu filtrede hakem bulunamadı</p>
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className="mt-3 text-sm text-red-400 hover:text-red-300"
          >
            Tümünü göster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredReferees.map((r) => (
            <Link
              key={r.id}
              href={`/hakemler/${r.slug}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-red-500/30 hover:bg-zinc-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-red-400">
                    {r.name}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {ROLE_LABELS[r.role] ?? r.role}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-400" />
              </div>

              {r.bio && (
                <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{r.bio}</p>
              )}

              {r.matchesWithIncidentsCount > 0 && (
                <div className="flex items-center gap-4 border-t border-zinc-800 pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {r.matchesWithIncidentsCount} maçta tartışmalı karar
                  </span>
                  <span className="text-xs text-zinc-500">
                    {r.totalIncidentsInThoseMatches} pozisyon
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

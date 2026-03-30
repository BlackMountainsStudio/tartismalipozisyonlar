"use client";

import { useState } from "react";
import Link from "next/link";
import IncidentRadarSection from "@/components/IncidentRadarSection";
import { Scale, ChevronRight, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

export interface CommentatorListItem {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  expertise: string[];
  opinions: { id: string; stance: string }[];
}

interface YorumcularClientProps {
  initialCommentators: CommentatorListItem[];
}

export default function YorumcularClient({ initialCommentators }: YorumcularClientProps) {
  const [radarCommentatorSlug, setRadarCommentatorSlug] = useState<string>("");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-red-500/10 p-4">
            <Scale className="h-10 w-10 text-red-500" aria-hidden="true" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">Uzman Yorumcular</h1>
        <p className="text-zinc-400">
          Tartışmalı pozisyonları değerlendiren eski hakemler ve spor yorumcuları
        </p>
      </div>

      {/* Radar görselleştirme */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label htmlFor="radar-commentator-filter" className="text-xs text-zinc-500">Yorumcu filtresi (radar):</label>
          <select
            id="radar-commentator-filter"
            value={radarCommentatorSlug}
            onChange={(e) => setRadarCommentatorSlug(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
          >
            <option value="">Tüm yorumcular</option>
            {initialCommentators.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <IncidentRadarSection
          currentIncidents={[]}
          scope="all"
          onScopeChange={() => {}}
          allDataFetchParams={{
            ...(radarCommentatorSlug && { commentatorSlug: radarCommentatorSlug }),
          }}
          mode="aggregate"
          showScopeToggle={false}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {initialCommentators.map((c) => {
          const agreeCount = c.opinions.filter((o) => o.stance === "AGREE").length;
          const disagreeCount = c.opinions.filter((o) => o.stance === "DISAGREE").length;
          const neutralCount = c.opinions.filter((o) => o.stance === "NEUTRAL").length;

          return (
            <Link
              key={c.id}
              href={`/yorumcular/${c.slug}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-red-500/30 hover:bg-zinc-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-red-400">
                    {c.name}
                  </h2>
                  <p className="text-xs text-zinc-500">{c.role}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-400" aria-hidden="true" />
              </div>

              <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{c.bio}</p>

              {c.opinions.length > 0 && (
                <div className="flex items-center gap-4 border-t border-zinc-800 pt-3">
                  <span className="text-xs text-zinc-500">{c.opinions.length} pozisyon yorumu</span>
                  <div className="flex items-center gap-3">
                    {agreeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> {agreeCount}
                      </span>
                    )}
                    {disagreeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" aria-hidden="true" /> {disagreeCount}
                      </span>
                    )}
                    {neutralCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <MinusCircle className="h-3 w-3" aria-hidden="true" /> {neutralCount}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

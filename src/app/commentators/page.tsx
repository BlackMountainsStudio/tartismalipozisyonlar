"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Scale, ChevronRight, CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface Opinion {
  id: string;
  stance: string;
  incident: {
    id: string;
    type: string;
    match: { homeTeam: string; awayTeam: string };
  };
}

interface Commentator {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string;
  expertise: string[];
  opinions: Opinion[];
}

export default function CommentatorsPage() {
  const [commentators, setCommentators] = useState<Commentator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commentators", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCommentators(Array.isArray(d) ? d : []))
      .catch(() => setCommentators([]))
      .finally(() => setLoading(false));
  }, []);

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
            <Scale className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-white">Uzman Yorumcular</h1>
        <p className="text-zinc-400">
          Tartışmalı pozisyonları değerlendiren eski hakemler ve spor yorumcuları
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {commentators.map((c) => {
          const agreeCount = c.opinions.filter((o) => o.stance === "AGREE").length;
          const disagreeCount = c.opinions.filter((o) => o.stance === "DISAGREE").length;
          const neutralCount = c.opinions.filter((o) => o.stance === "NEUTRAL").length;

          return (
            <Link
              key={c.id}
              href={`/commentators/${c.slug}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-red-500/30 hover:bg-zinc-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-red-400">
                    {c.name}
                  </h2>
                  <p className="text-xs text-zinc-500">{c.role}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-red-400" />
              </div>

              <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{c.bio}</p>

              {c.opinions.length > 0 && (
                <div className="flex items-center gap-4 border-t border-zinc-800 pt-3">
                  <span className="text-xs text-zinc-500">{c.opinions.length} pozisyon yorumu</span>
                  <div className="flex items-center gap-3">
                    {agreeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> {agreeCount}
                      </span>
                    )}
                    {disagreeCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="h-3 w-3" /> {disagreeCount}
                      </span>
                    )}
                    {neutralCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <MinusCircle className="h-3 w-3" /> {neutralCount}
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

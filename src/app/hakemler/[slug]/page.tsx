"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { matchUrl } from "@/lib/links";
import {
  ArrowLeft,
  Loader2,
  UserRound,
  Calendar,
  AlertTriangle,
  Video,
  ChevronRight,
} from "lucide-react";

interface MatchWithIncidents {
  id: string;
  slug: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  week: number;
  date: string;
  roleInMatch: string;
  incidentCount: number;
}

interface RefereeDetail {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  matchesWithIncidents: MatchWithIncidents[];
}

const ROLE_LABELS: Record<string, string> = {
  REFEREE: "Orta hakem",
  VAR: "VAR hakemi",
};

export default function HakemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [referee, setReferee] = useState<RefereeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/referees/${slug}`, { cache: "no-store" });
      if (!res.ok) {
        setReferee(null);
        return;
      }
      const data = await res.json();
      setReferee(data);
    } catch {
      setReferee(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!referee) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-lg text-zinc-400">Hakem bulunamadı</p>
        <button
          type="button"
          onClick={() => router.push("/hakemler")}
          className="mt-4 text-sm text-red-400 hover:text-red-300"
        >
          Hakemlere dön
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.push("/hakemler")}
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Hakemlere Dön
      </button>

      <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          {referee.photoUrl ? (
            <img
              src={referee.photoUrl}
              alt={referee.name}
              className="mb-4 h-24 w-24 rounded-full object-cover sm:mb-0 sm:mr-6"
            />
          ) : (
            <div className="mb-4 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mb-0 sm:mr-6">
              <UserRound className="h-12 w-12 text-red-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {referee.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-red-400">
              {ROLE_LABELS[referee.role] ?? referee.role}
            </p>
            {referee.bio && (
              <p className="mt-3 text-zinc-400">{referee.bio}</p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        Tartışmalı karar aldığı maçlar
      </h2>

      {referee.matchesWithIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Video className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400">
            Bu hakemin tartışmalı karar verdiği maç bulunamadı
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Onaylanmış tartışmalı pozisyon tespit edilen maçlar burada listelenir
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {referee.matchesWithIncidents.map((m) => (
            <Link
              key={m.id}
              href={matchUrl(m.slug)}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-all hover:border-red-500/30 hover:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-white">
                    {m.homeTeam} vs {m.awayTeam}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                    <span>{m.league}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Hafta {m.week}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(m.date).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                    {ROLE_LABELS[m.roleInMatch] ?? m.roleInMatch}
                  </span>
                  <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400">
                    {m.incidentCount} tartışmalı pozisyon
                  </span>
                  <ChevronRight className="h-5 w-5 text-zinc-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

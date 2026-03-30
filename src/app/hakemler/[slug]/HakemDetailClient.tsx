"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { matchUrl } from "@/lib/links";
import {
  ArrowLeft,
  UserRound,
  Calendar,
  AlertTriangle,
  Video,
  ChevronRight,
  Flag,
  Square,
  CircleDot,
  Radio,
} from "lucide-react";
import IncidentRadarSection from "@/components/IncidentRadarSection";

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

interface RefereeStats {
  totalMatches: number;
  penalties: number;
  redCards: number;
  yellowCards: number;
  varInterventions: number;
  controversialDecisions: number;
  refereeRating?: number | null;
}

export interface RefereeDetailProps {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  photoUrl: string | null;
  matchesWithIncidents: MatchWithIncidents[];
  stats: RefereeStats;
}

const ROLE_LABELS: Record<string, string> = {
  REFEREE: "Orta hakem",
  VAR: "VAR hakemi",
};

export default function HakemDetailClient({ referee }: { referee: RefereeDetailProps }) {
  const [radarDataCount, setRadarDataCount] = useState<number | null>(null);
  const onRadarDataLoaded = useCallback((count: number) => setRadarDataCount(count), []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/hakemler"
        className="mb-6 flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Hakemlere Dön
      </Link>

      <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          {referee.photoUrl ? (
            <Image
              src={referee.photoUrl}
              alt={referee.name}
              width={96}
              height={96}
              className="mb-4 h-24 w-24 rounded-full object-cover sm:mb-0 sm:mr-6"
              unoptimized
            />
          ) : (
            <div className="mb-4 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:mb-0 sm:mr-6">
              <UserRound className="h-12 w-12 text-red-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{referee.name}</h1>
            <p className="mt-1 text-sm font-medium text-red-400">
              {ROLE_LABELS[referee.role] ?? referee.role}
            </p>
            {referee.bio && <p className="mt-3 text-zinc-400">{referee.bio}</p>}
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-white">{referee.stats.totalMatches}</p>
          <p className="mt-1 text-xs font-medium text-zinc-500">Toplam maç</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{referee.stats.penalties}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-zinc-500">
            <Flag className="h-3.5 w-3.5" />
            Penaltı
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{referee.stats.redCards}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-zinc-500">
            <Square className="h-3.5 w-3.5" />
            Kırmızı kart
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{referee.stats.yellowCards}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-zinc-500">
            <CircleDot className="h-3.5 w-3.5" />
            Sarı kart
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{referee.stats.varInterventions}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-zinc-500">
            <Radio className="h-3.5 w-3.5" />
            VAR müdahalesi
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{referee.stats.controversialDecisions}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-zinc-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Tartışmalı karar
          </p>
        </div>
        {referee.stats.refereeRating != null && (
          <div className="col-span-2 rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4 text-center sm:col-span-3 lg:col-span-6">
            <p className="text-3xl font-bold text-red-400">{referee.stats.refereeRating}</p>
            <p className="mt-1 text-xs font-medium text-zinc-400">Performans Rating (0-10)</p>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-white">Karar istatistikleri</h2>
        <IncidentRadarSection
          currentIncidents={[]}
          scope="all"
          onScopeChange={() => {}}
          allDataFetchParams={{}}
          showScopeToggle={false}
          mode="aggregate"
          onDataLoaded={onRadarDataLoaded}
          enableRefereeFilter
          initialRefereeSlug={referee.slug}
        />
        {radarDataCount === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 py-8 text-center">
            <p className="text-sm text-zinc-500">
              Bu hakemin maçlarında görselleştirilecek onaylı pozisyon bulunamadı
            </p>
          </div>
        )}
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        Tartışmalı karar aldığı maçlar
      </h2>

      {referee.matchesWithIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-16 text-center">
          <Video className="mb-4 h-10 w-10 text-zinc-700" />
          <p className="text-zinc-400">Bu hakemin tartışmalı karar verdiği maç bulunamadı</p>
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

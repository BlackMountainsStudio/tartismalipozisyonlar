import { Shield, TrendingUp, AlertTriangle } from "lucide-react";

export default function RootLoading() {
  return (
    <div>
      {/* Hero Skeleton */}
      <section className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-red-500/10 p-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Var <span className="text-red-500">Odası</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
            Tartışmalı hakem kararlarını Reddit ve Ekşi Sözlük tartışmalarını
            analiz ederek otomatik tespit eden AI destekli platform.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <StatCardSkeleton icon={<TrendingUp className="h-5 w-5 text-emerald-400" />} />
            <StatCardSkeleton icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} />
            <StatCardSkeleton icon={<Shield className="h-5 w-5 text-blue-400" />} />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-zinc-800"></div>
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="relative w-full sm:w-72">
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800"></div>
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
              <div className="h-8 w-24 animate-pulse rounded bg-zinc-800"></div>
            </div>
            <div className="hidden h-4 w-px bg-zinc-700 sm:block" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-24 animate-pulse rounded-xl bg-zinc-800"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar Section Skeleton */}
        <div className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="h-64 animate-pulse rounded bg-zinc-800"></div>
        </div>

        {/* Match Cards Skeleton */}
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, weekIndex) => (
            <section key={weekIndex}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="h-7 w-24 animate-pulse rounded bg-zinc-800"></div>
                  <div className="mt-1 h-4 w-32 animate-pulse rounded bg-zinc-800"></div>
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800"></div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, cardIndex) => (
                  <MatchCardSkeleton key={cardIndex} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCardSkeleton({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
      </div>
      <div className="h-8 w-12 animate-pulse rounded bg-zinc-800"></div>
    </div>
  );
}

function MatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-800"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <div className="mb-4 flex items-center justify-center gap-3">
        <div className="h-6 w-20 animate-pulse rounded bg-zinc-800"></div>
        <div className="h-6 w-12 animate-pulse rounded bg-zinc-800"></div>
        <div className="h-6 w-20 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="h-4 w-16 animate-pulse rounded bg-zinc-800"></div>
        <div className="h-4 w-4 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <div className="mt-3 border-t border-zinc-800/80 pt-3">
        <div className="h-3 w-32 animate-pulse rounded bg-zinc-800"></div>
      </div>
    </div>
  );
}
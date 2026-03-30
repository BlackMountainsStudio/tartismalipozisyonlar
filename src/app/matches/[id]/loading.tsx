import { ArrowLeft, Trophy, Calendar, UserRound } from "lucide-react";

export default function MatchLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <div className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400">
        <ArrowLeft className="h-4 w-4" />
        Maçlara Dön
      </div>

      {/* Match Header Skeleton */}
      <div className="mb-10 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-red-400" />
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
          <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-800"></div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5">
            <UserRound className="h-3.5 w-3.5 text-red-400" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-700"></div>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5">
            <UserRound className="h-3.5 w-3.5 text-amber-400" />
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-700"></div>
          </div>
        </div>
        <div className="text-3xl font-bold text-white sm:text-4xl">
          <div className="flex items-center justify-center gap-4">
            <div className="h-10 w-32 animate-pulse rounded bg-zinc-800"></div>
            <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
            <div className="h-10 w-32 animate-pulse rounded bg-zinc-800"></div>
          </div>
        </div>
      </div>

      {/* Note Section Skeleton */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="h-5 w-24 animate-pulse rounded bg-zinc-800 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800"></div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-zinc-800"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-800"></div>
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
          </div>
        ))}
      </div>

      {/* Radar Section Skeleton */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-800"></div>
            <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
          </div>
        </div>
        <div className="h-64 animate-pulse rounded bg-zinc-800"></div>
      </div>

      {/* Incidents Grid Skeleton */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-48 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <IncidentCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-zinc-700"></div>
                <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800"></div>
        <div className="h-4 w-12 animate-pulse rounded bg-zinc-800"></div>
      </div>

      <div className="mb-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-800 mb-2"></div>
        <div className="space-y-1">
          <div className="h-3 w-full animate-pulse rounded bg-zinc-800"></div>
          <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800"></div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-800"></div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800"></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="h-8 w-24 animate-pulse rounded bg-zinc-800"></div>
        <div className="h-8 w-8 animate-pulse rounded bg-zinc-800"></div>
      </div>
    </div>
  );
}
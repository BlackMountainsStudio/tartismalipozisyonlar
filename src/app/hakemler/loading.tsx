import { Search, Filter, UserRound, TrendingUp, AlertTriangle } from "lucide-react";

export default function RefereesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-2xl bg-blue-500/10 p-4">
            <UserRound className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        <div className="mb-2 h-8 w-48 mx-auto animate-pulse rounded bg-zinc-800"></div>
        <div className="h-4 w-64 mx-auto animate-pulse rounded bg-zinc-800"></div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800"></div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="h-10 w-20 animate-pulse rounded-lg bg-zinc-800"></div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-400" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
        </div>
      </div>

      {/* Referees Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <RefereeCardSkeleton key={i} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex items-center justify-center gap-2">
        <div className="h-9 w-9 animate-pulse rounded bg-zinc-800"></div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-9 animate-pulse rounded bg-zinc-800"></div>
          ))}
        </div>
        <div className="h-9 w-9 animate-pulse rounded bg-zinc-800"></div>
      </div>
    </div>
  );
}

function RefereeCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Referee Avatar & Basic Info */}
      <div className="mb-4 text-center">
        <div className="mb-3 h-16 w-16 mx-auto animate-pulse rounded-full bg-zinc-800"></div>
        <div className="mb-1 h-5 w-32 mx-auto animate-pulse rounded bg-zinc-800"></div>
        <div className="h-4 w-20 mx-auto animate-pulse rounded bg-zinc-800"></div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-3 w-8 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-3 w-12 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 w-18 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-3 w-6 animate-pulse rounded bg-zinc-800"></div>
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 animate-pulse rounded bg-zinc-800"></div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 w-4 animate-pulse rounded bg-zinc-800"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4">
        <div className="h-9 w-full animate-pulse rounded-lg bg-zinc-800"></div>
      </div>
    </div>
  );
}
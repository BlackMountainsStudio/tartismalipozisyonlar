import { ArrowLeft, Play } from "lucide-react";

export default function IncidentLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <div className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400">
        <ArrowLeft className="h-4 w-4" />
        Pozisyonlara Dön
      </div>

      {/* Incident Header Skeleton */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800"></div>
          <div className="h-4 w-16 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-800"></div>
        </div>

        <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-zinc-800"></div>

        <div className="mb-6 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800"></div>
          <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800"></div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-zinc-800"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-800"></div>
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-800"></div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-zinc-800"></div>
        </div>
      </div>

      {/* Video Section Skeleton */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
        <div className="aspect-video rounded-lg bg-zinc-800 flex items-center justify-center">
          <Play className="h-16 w-16 text-zinc-600" />
        </div>
      </div>

      {/* Stats and Info Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Confidence & Impact */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 h-5 w-24 animate-pulse rounded bg-zinc-800"></div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-16 animate-pulse rounded bg-zinc-800"></div>
              <div className="h-4 w-12 animate-pulse rounded bg-zinc-800"></div>
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-zinc-800"></div>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4 h-5 w-28 animate-pulse rounded bg-zinc-800"></div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-zinc-800"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-800"></div>
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-zinc-800"></div>
            <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-800"></div>
          </div>
        </div>
      </div>

      {/* Opinion Summary Skeleton */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="mb-2 h-8 w-16 mx-auto animate-pulse rounded bg-zinc-800"></div>
              <div className="h-4 w-12 mx-auto animate-pulse rounded bg-zinc-800"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Incidents Skeleton */}
      <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-800"></div>
          <div className="h-8 w-24 animate-pulse rounded bg-zinc-800"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-zinc-700"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-700"></div>
              </div>
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-zinc-700"></div>
              <div className="h-3 w-full animate-pulse rounded bg-zinc-700"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section Skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-zinc-800"></div>

        {/* Comment Form Skeleton */}
        <div className="mb-6 space-y-3 rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
          <div className="h-20 w-full animate-pulse rounded bg-zinc-700"></div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 w-16 animate-pulse rounded bg-zinc-700"></div>
              ))}
            </div>
            <div className="h-9 w-20 animate-pulse rounded bg-zinc-700"></div>
          </div>
        </div>

        {/* Comments List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-700"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-700"></div>
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-700"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-zinc-700"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-zinc-700"></div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-8 w-12 animate-pulse rounded bg-zinc-700"></div>
                <div className="h-8 w-16 animate-pulse rounded bg-zinc-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
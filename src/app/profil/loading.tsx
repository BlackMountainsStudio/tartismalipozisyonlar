import { User, MessageCircle, Calendar, ThumbsUp } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Profile Header Skeleton */}
      <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
          {/* Avatar */}
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-800"></div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-2 h-7 w-48 animate-pulse rounded bg-zinc-800"></div>
            <div className="mb-2 h-4 w-32 animate-pulse rounded bg-zinc-800"></div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4 text-zinc-500" />
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-800"></div>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-zinc-500" />
                <div className="h-3 w-12 animate-pulse rounded bg-zinc-800"></div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-4 sm:mt-0">
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Tab Navigation Skeleton */}
      <div className="mb-6">
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded bg-zinc-800"></div>
          ))}
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="space-y-6">
          {/* Recent Activity Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-800"></div>
          </div>

          {/* Activity Items */}
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ActivityItemSkeleton key={i} />
            ))}
          </div>

          {/* Load More Button */}
          <div className="pt-4 text-center">
            <div className="h-9 w-32 mx-auto animate-pulse rounded-lg bg-zinc-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-800/30 p-4">
      {/* Activity Icon */}
      <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-700"></div>

      {/* Content */}
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-700"></div>
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-700"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 w-full animate-pulse rounded bg-zinc-700"></div>
          <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-700"></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-6 w-16 animate-pulse rounded bg-zinc-700"></div>
          <div className="h-6 w-20 animate-pulse rounded bg-zinc-700"></div>
        </div>
      </div>
    </div>
  );
}
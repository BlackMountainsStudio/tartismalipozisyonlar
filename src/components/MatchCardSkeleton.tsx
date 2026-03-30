export default function MatchCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-zinc-800" />
        <div className="h-4 w-16 rounded bg-zinc-800" />
      </div>
      <div className="mb-4 h-6 w-3/4 rounded bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}

export default function RefereeCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div>
          <div className="mb-1.5 h-4 w-28 rounded bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-800" />
        </div>
      </div>
      <div className="flex gap-4 border-t border-zinc-800 pt-3">
        <div className="h-3 w-16 rounded bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

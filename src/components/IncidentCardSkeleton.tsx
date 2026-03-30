export default function IncidentCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-800" />
        <div className="ml-auto h-5 w-16 rounded-full bg-zinc-800" />
      </div>
      <div className="mb-2 h-4 w-full rounded bg-zinc-800" />
      <div className="mb-4 h-4 w-4/5 rounded bg-zinc-800" />
      <div className="flex gap-2">
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}

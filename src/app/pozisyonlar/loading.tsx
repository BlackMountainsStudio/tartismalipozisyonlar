export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
      <div className="mb-6 h-8 w-56 rounded-lg bg-zinc-800" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="mb-2 flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-zinc-800" />
              <div className="h-5 w-2/3 rounded bg-zinc-800" />
            </div>
            <div className="h-4 w-1/3 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

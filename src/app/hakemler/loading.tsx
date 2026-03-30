export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
      <div className="mb-6 h-8 w-48 rounded-lg bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-800" />
              <div className="flex-1">
                <div className="mb-1 h-4 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-700" />
              </div>
            </div>
            <div className="h-4 w-1/3 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

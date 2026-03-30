export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar Skeleton */}
      <aside className="hidden w-64 border-r border-zinc-800 bg-zinc-900/50 md:block">
        <div className="flex h-full flex-col p-4">
          {/* Sidebar Header */}
          <div className="mb-6 border-b border-zinc-800 pb-4">
            <div className="h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                <div className="h-5 w-5 animate-pulse rounded bg-zinc-800"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-800"></div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Button Skeleton */}
      <div className="fixed left-4 top-20 z-50 md:hidden">
        <div className="h-10 w-10 animate-pulse rounded-lg bg-zinc-800"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded bg-zinc-800 mb-2"></div>
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-800"></div>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-5 w-5 animate-pulse rounded bg-zinc-800"></div>
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-800"></div>
                </div>
                <div className="h-8 w-16 animate-pulse rounded bg-zinc-800"></div>
              </div>
            ))}
          </div>

          {/* Data Table/Cards Section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
            {/* Table Header */}
            <div className="border-b border-zinc-800 p-6">
              <div className="flex items-center justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-zinc-800"></div>
                <div className="flex gap-2">
                  <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-800"></div>
                  <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800"></div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 animate-pulse rounded bg-zinc-800"></div>
                      <div>
                        <div className="h-4 w-32 animate-pulse rounded bg-zinc-800 mb-1"></div>
                        <div className="h-3 w-24 animate-pulse rounded bg-zinc-800"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-16 animate-pulse rounded bg-zinc-800"></div>
                      <div className="h-8 w-8 animate-pulse rounded bg-zinc-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
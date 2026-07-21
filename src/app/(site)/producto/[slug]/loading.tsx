export default function ProductoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8" aria-busy="true" aria-label="Cargando producto">
      <div className="mb-6 h-3 w-48 animate-pulse rounded bg-surface-muted" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="aspect-square animate-pulse rounded-2xl bg-surface-muted" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface-muted" />
          <div className="h-7 w-28 animate-pulse rounded bg-surface-muted" />
          <div className="h-16 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-12 w-full animate-pulse rounded-full bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}

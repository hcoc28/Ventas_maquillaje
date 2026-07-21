export default function CatalogoLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8" aria-busy="true" aria-label="Cargando catálogo">
      <div className="mb-10 h-40 animate-pulse rounded-3xl bg-surface-muted" />

      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="h-11 w-full max-w-xs animate-pulse rounded-full bg-surface-muted" />
        <div className="h-11 w-32 animate-pulse rounded-full bg-surface-muted" />
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square animate-pulse rounded-2xl bg-surface-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

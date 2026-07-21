export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando panel">
      <div className="h-8 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
    </div>
  );
}

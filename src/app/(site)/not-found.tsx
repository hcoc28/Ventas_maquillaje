import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Error 404</span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Página no encontrada</h1>
      <p className="max-w-md text-sm text-text-muted">
        El producto o la página que buscas no existe o ya no está disponible.
      </p>
      <div className="mt-2 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className="rounded-full border border-border px-8 py-3 text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-surface-muted"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}

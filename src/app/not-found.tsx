import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Error 404</span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Página no encontrada</h1>
      <p className="max-w-md text-sm text-text-muted">
        La página que buscas no existe o fue movida. Vuelve al inicio para seguir explorando.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

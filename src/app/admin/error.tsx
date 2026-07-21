"use client";

import { useEffect } from "react";

export default function AdminErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-surface p-12 text-center shadow-[var(--shadow-soft)]">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Error</span>
      <h1 className="font-[family-name:var(--font-display)] text-2xl">No se pudo cargar esta sección</h1>
      <p className="max-w-md text-sm text-text-muted">Ocurrió un problema al procesar esta página del panel.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong"
      >
        Reintentar
      </button>
    </div>
  );
}

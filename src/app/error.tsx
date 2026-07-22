"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Algo salió mal</span>
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Ocurrió un error inesperado</h1>
      <p className="max-w-md text-sm text-text-muted">
        Nuestro equipo ya fue notificado. Intenta de nuevo en unos momentos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

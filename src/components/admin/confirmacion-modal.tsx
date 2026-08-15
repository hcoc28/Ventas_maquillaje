"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface Props {
  abierto: boolean;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  procesando?: boolean;
  variante?: "peligro" | "normal";
  onConfirmar: () => void | Promise<void>;
  onCerrar: () => void;
}

export function ConfirmacionModal({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  procesando = false,
  variante = "peligro",
  onConfirmar,
  onCerrar,
}: Props) {
  useEffect(() => {
    if (!abierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !procesando) onCerrar();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [abierto, onCerrar, procesando]);

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-modal-titulo"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-strong)]"
      >
        <div className="flex items-start gap-4 p-6">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              variante === "peligro" ? "bg-red-500/10 text-red-600" : "bg-accent-strong/10 text-accent-strong"
            }`}
          >
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirmacion-modal-titulo" className="text-lg font-semibold text-foreground">
              {titulo}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">{descripcion}</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            aria-label="Cerrar"
            className="rounded-full p-2 text-text-muted hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted/35 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-background disabled:opacity-50"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${
              variante === "peligro" ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-accent-strong"
            }`}
          >
            {procesando ? "Procesando..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

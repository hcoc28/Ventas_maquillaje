"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Power, Trash2 } from "lucide-react";

interface Props {
  activo: boolean;
  nombre: string;
  onCambiarActivo: (activo: boolean) => Promise<void> | void;
}

export function AccionesMenu({ activo, nombre, onCambiarActivo }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setConfirmando(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, [abierto]);

  async function confirmarDesactivar() {
    setProcesando(true);
    try {
      await onCambiarActivo(false);
      setAbierto(false);
      setConfirmando(false);
    } finally {
      setProcesando(false);
    }
  }

  async function activar() {
    setProcesando(true);
    try {
      await onCambiarActivo(true);
      setAbierto(false);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Más acciones"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
      >
        <MoreVertical size={15} />
      </button>
      {abierto && (
        <div className="absolute right-0 top-full z-20 mt-1 w-60 rounded-xl border border-border bg-surface p-2 text-left shadow-[var(--shadow-strong)]">
          {confirmando ? (
            <div className="flex flex-col gap-2 p-1.5">
              <p className="text-xs text-text-muted">¿Estás segura/o de desactivar &quot;{nombre}&quot;?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="flex-1 rounded-full border border-border py-1.5 text-xs font-semibold hover:bg-surface-muted"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesando}
                  onClick={confirmarDesactivar}
                  className="flex-1 rounded-full bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Sí, desactivar
                </button>
              </div>
            </div>
          ) : activo ? (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10"
            >
              <Trash2 size={14} /> Desactivar
            </button>
          ) : (
            <button
              type="button"
              disabled={procesando}
              onClick={activar}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              <Power size={14} /> Activar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

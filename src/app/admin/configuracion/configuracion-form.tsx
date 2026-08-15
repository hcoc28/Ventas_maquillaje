"use client";

import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";

interface Configuracion {
  mostrarFiltroMarcas: boolean;
}

export function ConfiguracionForm({ configuracionInicial }: { configuracionInicial: Configuracion }) {
  const { mostrar } = useToast();
  const [mostrarFiltroMarcas, setMostrarFiltroMarcas] = useState(configuracionInicial.mostrarFiltroMarcas);
  const [guardando, setGuardando] = useState(false);

  async function alternar(valor: boolean) {
    const anterior = mostrarFiltroMarcas;
    setMostrarFiltroMarcas(valor);
    setGuardando(true);
    try {
      await axios.put("/api/admin/configuracion", { mostrarFiltroMarcas: valor });
      mostrar(valor ? "Filtro de marcas activado en el catálogo." : "Filtro de marcas desactivado en el catálogo.");
    } catch {
      setMostrarFiltroMarcas(anterior);
      mostrar("No se pudo actualizar la configuración.", "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-2xl rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">Filtro de marcas en el catálogo</p>
          <p className="mt-0.5 text-sm text-text-muted">
            Muestra u oculta el bloque &quot;Marcas&quot; en los filtros del catálogo público.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={mostrarFiltroMarcas}
          aria-label="Mostrar filtro de marcas en el catálogo"
          disabled={guardando}
          onClick={() => alternar(!mostrarFiltroMarcas)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            mostrarFiltroMarcas ? "bg-accent-strong" : "bg-surface-muted"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              mostrarFiltroMarcas ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

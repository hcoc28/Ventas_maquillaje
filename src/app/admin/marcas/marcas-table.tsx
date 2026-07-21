"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodasLasMarcasAdmin } from "@/server/services/marca.service";

type Marca = Awaited<ReturnType<typeof getTodasLasMarcasAdmin>>[number];

export function MarcasTable({ marcas }: { marcas: Marca[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Desactivar la marca "${nombre}"?`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/marcas/${id}`);
      mostrar("Marca desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo desactivar la marca.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Nombre</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3">Productos</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {marcas.map((m) => (
            <tr key={m.id}>
              <td className="px-5 py-3 font-medium">{m.nombre}</td>
              <td className="px-5 py-3 text-text-muted">{m.slug}</td>
              <td className="px-5 py-3">{m._count.products}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    m.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {m.activo ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/marcas/${m.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(m.id, m.nombre)}
                    disabled={eliminando === m.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Desactivar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {marcas.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay marcas registradas.</p>}
    </div>
  );
}

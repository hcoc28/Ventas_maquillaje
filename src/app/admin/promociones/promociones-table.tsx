"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodasLasPromocionesAdmin } from "@/server/services/promocion.service";

type Promocion = Awaited<ReturnType<typeof getTodasLasPromocionesAdmin>>[number];

export function PromocionesTable({ promociones }: { promociones: Promocion[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Desactivar la promoción "${nombre}"?`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/promociones/${id}`);
      mostrar("Promoción desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo desactivar la promoción.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Nombre</th>
            <th className="px-5 py-3">Descuento</th>
            <th className="px-5 py-3">Vigencia</th>
            <th className="px-5 py-3">Productos</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {promociones.map((p) => (
            <tr key={p.id}>
              <td className="px-5 py-3 font-medium">{p.nombre}</td>
              <td className="px-5 py-3">{Number(p.porcentajeDescuento)}%</td>
              <td className="px-5 py-3 text-text-muted">
                {new Date(p.fechaInicio).toLocaleDateString("es-GT")} – {new Date(p.fechaFin).toLocaleDateString("es-GT")}
              </td>
              <td className="px-5 py-3">{p._count.products}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {p.activo ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/promociones/${p.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(p.id, p.nombre)}
                    disabled={eliminando === p.id}
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
      {promociones.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay promociones registradas.</p>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { AccionesMenu } from "@/components/admin/acciones-menu";
import type { getTodasLasPromocionesAdmin } from "@/server/services/promocion.service";

type Promocion = Awaited<ReturnType<typeof getTodasLasPromocionesAdmin>>[number];

export function PromocionesTable({ promociones, mostrarTodosInicial }: { promociones: Promocion[]; mostrarTodosInicial: boolean }) {
  const router = useRouter();
  const { mostrar } = useToast();

  function alternarMostrarTodos(mostrarTodos: boolean) {
    const params = new URLSearchParams();
    if (mostrarTodos) params.set("todos", "1");
    router.push(`/admin/promociones?${params.toString()}`);
  }

  async function cambiarActivo(id: number, activo: boolean) {
    try {
      await axios.patch(`/api/admin/promociones/${id}`, { activo });
      mostrar(activo ? "Promoción activada." : "Promoción desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar la promoción.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={mostrarTodosInicial}
          onChange={(e) => alternarMostrarTodos(e.target.checked)}
          className="h-4 w-4"
        />
        Mostrar inactivas
      </label>

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
                  <AccionesMenu activo={p.activo} nombre={p.nombre} onCambiarActivo={(activo) => cambiarActivo(p.id, activo)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {promociones.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay promociones registradas.</p>}
      </div>
    </div>
  );
}

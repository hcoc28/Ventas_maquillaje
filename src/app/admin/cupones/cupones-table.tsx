"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { AccionesMenu } from "@/components/admin/acciones-menu";
import type { getTodosLosCuponesAdmin } from "@/server/services/cupon.service";

type Cupon = Awaited<ReturnType<typeof getTodosLosCuponesAdmin>>[number];

export function CuponesTable({ cupones, mostrarTodosInicial }: { cupones: Cupon[]; mostrarTodosInicial: boolean }) {
  const router = useRouter();
  const { mostrar } = useToast();

  function alternarMostrarTodos(mostrarTodos: boolean) {
    const params = new URLSearchParams();
    if (mostrarTodos) params.set("todos", "1");
    router.push(`/admin/cupones?${params.toString()}`);
  }

  async function cambiarActivo(id: number, activo: boolean) {
    try {
      await axios.patch(`/api/admin/cupones/${id}`, { activo });
      mostrar(activo ? "Cupón activado." : "Cupón eliminado.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar el cupón.", "error");
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
        Mostrar inactivos
      </label>

      <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Código</th>
            <th className="px-5 py-3">Descuento</th>
            <th className="px-5 py-3">Vigencia</th>
            <th className="px-5 py-3">Usos</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {cupones.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-mono font-medium">{c.codigo}</td>
              <td className="px-5 py-3">{Number(c.porcentajeDescuento)}%</td>
              <td className="px-5 py-3 text-text-muted">
                {new Date(c.fechaInicio).toLocaleDateString("es-GT")} – {new Date(c.fechaFin).toLocaleDateString("es-GT")}
              </td>
              <td className="px-5 py-3">
                {c.vecesUsado}
                {c.usoMaximo ? ` / ${c.usoMaximo}` : ""}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    c.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {c.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/cupones/${c.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <AccionesMenu activo={c.activo} nombre={c.codigo} onCambiarActivo={(activo) => cambiarActivo(c.id, activo)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {cupones.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay cupones registrados.</p>}
      </div>
    </div>
  );
}

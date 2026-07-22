"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodosLosCuponesAdmin } from "@/server/services/cupon.service";

type Cupon = Awaited<ReturnType<typeof getTodosLosCuponesAdmin>>[number];

export function CuponesTable({ cupones }: { cupones: Cupon[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function eliminar(id: number, codigo: string) {
    if (!confirm(`¿Desactivar el cupón "${codigo}"?`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/cupones/${id}`);
      mostrar("Cupón desactivado.");
      router.refresh();
    } catch {
      mostrar("No se pudo desactivar el cupón.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
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
                  <button
                    type="button"
                    onClick={() => eliminar(c.id, c.codigo)}
                    disabled={eliminando === c.id}
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
      {cupones.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay cupones registrados.</p>}
    </div>
  );
}

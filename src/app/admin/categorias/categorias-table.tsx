"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodasLasCategoriasAdmin } from "@/services/categoria.service";

type Categoria = Awaited<ReturnType<typeof getTodasLasCategoriasAdmin>>[number];

export function CategoriasTable({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Desactivar la categoría "${nombre}"?`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/categorias/${id}`);
      mostrar("Categoría desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo desactivar la categoría.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Nombre</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3">Orden</th>
            <th className="px-5 py-3">Productos</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categorias.map((c) => (
            <tr key={c.id}>
              <td className="px-5 py-3 font-medium">{c.nombre}</td>
              <td className="px-5 py-3 text-text-muted">{c.slug}</td>
              <td className="px-5 py-3">{c.orden}</td>
              <td className="px-5 py-3">{c._count.products}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    c.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {c.activo ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/categorias/${c.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(c.id, c.nombre)}
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
      {categorias.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay categorías registradas.</p>}
    </div>
  );
}

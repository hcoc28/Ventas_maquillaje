"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { AccionesMenu } from "@/components/admin/acciones-menu";
import type { getTodasLasCategoriasAdmin } from "@/server/services/categoria.service";

type Categoria = Awaited<ReturnType<typeof getTodasLasCategoriasAdmin>>[number];

export function CategoriasTable({ categorias, mostrarTodosInicial }: { categorias: Categoria[]; mostrarTodosInicial: boolean }) {
  const router = useRouter();
  const { mostrar } = useToast();

  function alternarMostrarTodos(mostrarTodos: boolean) {
    const params = new URLSearchParams();
    if (mostrarTodos) params.set("todos", "1");
    router.push(`/admin/categorias?${params.toString()}`);
  }

  async function cambiarActivo(id: number, activo: boolean) {
    try {
      await axios.patch(`/api/admin/categorias/${id}`, { activo });
      mostrar(activo ? "Categoría activada." : "Categoría desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar la categoría.", "error");
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
                  <AccionesMenu activo={c.activo} nombre={c.nombre} onCambiarActivo={(activo) => cambiarActivo(c.id, activo)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {categorias.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay categorías registradas.</p>}
      </div>
    </div>
  );
}

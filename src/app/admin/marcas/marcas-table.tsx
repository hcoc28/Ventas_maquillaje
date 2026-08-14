"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { AccionesMenu } from "@/components/admin/acciones-menu";
import type { getTodasLasMarcasAdmin } from "@/server/services/marca.service";

type Marca = Awaited<ReturnType<typeof getTodasLasMarcasAdmin>>[number];

export function MarcasTable({ marcas, mostrarTodosInicial }: { marcas: Marca[]; mostrarTodosInicial: boolean }) {
  const router = useRouter();
  const { mostrar } = useToast();

  function alternarMostrarTodos(mostrarTodos: boolean) {
    const params = new URLSearchParams();
    if (mostrarTodos) params.set("todos", "1");
    router.push(`/admin/marcas?${params.toString()}`);
  }

  async function cambiarActivo(id: number, activo: boolean) {
    try {
      await axios.patch(`/api/admin/marcas/${id}`, { activo });
      mostrar(activo ? "Marca activada." : "Marca desactivada.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar la marca.", "error");
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
                  <AccionesMenu activo={m.activo} nombre={m.nombre} onCambiarActivo={(activo) => cambiarActivo(m.id, activo)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        {marcas.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay marcas registradas.</p>}
      </div>
    </div>
  );
}

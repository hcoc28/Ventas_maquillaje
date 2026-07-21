"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodosLosBannersAdmin } from "@/services/banner.service";

type Banner = Awaited<ReturnType<typeof getTodosLosBannersAdmin>>[number];

export function BannersTable({ banners }: { banners: Banner[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [eliminando, setEliminando] = useState<number | null>(null);

  async function eliminar(id: number, titulo: string) {
    if (!confirm(`¿Eliminar el banner "${titulo}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/banners/${id}`);
      mostrar("Banner eliminado.");
      router.refresh();
    } catch {
      mostrar("No se pudo eliminar el banner.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Imagen</th>
            <th className="px-5 py-3">Título</th>
            <th className="px-5 py-3">Orden</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {banners.map((b) => (
            <tr key={b.id}>
              <td className="px-5 py-3">
                <div className="relative h-10 w-16 overflow-hidden rounded-md bg-surface-muted">
                  <Image src={b.imagenUrl} alt={b.titulo} fill sizes="64px" className="object-cover" />
                </div>
              </td>
              <td className="px-5 py-3 font-medium">{b.titulo}</td>
              <td className="px-5 py-3">{b.orden}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    b.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {b.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/banners/${b.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                    aria-label="Editar"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => eliminar(b.id, b.titulo)}
                    disabled={eliminando === b.id}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {banners.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay banners registrados.</p>}
    </div>
  );
}

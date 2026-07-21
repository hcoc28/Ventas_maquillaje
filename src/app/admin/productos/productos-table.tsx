"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { formatearMoneda } from "@/lib/utils";
import type { getTodosLosProductosAdmin } from "@/server/services/producto.service";

type Producto = Awaited<ReturnType<typeof getTodosLosProductosAdmin>>[number];

export function ProductosTable({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [termino, setTermino] = useState("");
  const [eliminando, setEliminando] = useState<number | null>(null);

  const filtrados = useMemo(() => {
    const q = termino.trim().toLowerCase();
    if (!q) return productos;
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.brand.nombre.toLowerCase().includes(q) || p.category.nombre.toLowerCase().includes(q)
    );
  }, [productos, termino]);

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Desactivar el producto "${nombre}"?`)) return;
    setEliminando(id);
    try {
      await axios.delete(`/api/admin/productos/${id}`);
      mostrar("Producto desactivado.");
      router.refresh();
    } catch {
      mostrar("No se pudo desactivar el producto.", "error");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
          placeholder="Buscar por nombre, marca o categoría..."
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-11 pr-4 text-sm outline-none focus:border-accent-strong"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3">Marca</th>
              <th className="px-5 py-3">Precio</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtrados.map((p) => {
              const imagen = p.images.find((i) => i.esPrincipal) ?? p.images[0];
              const stock = p.inventory?.stock ?? 0;
              const bajoStock = stock <= (p.inventory?.stockMinimo ?? 5);
              return (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {imagen && (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                          <Image src={imagen.url} alt={imagen.textoAlt} fill sizes="40px" className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium">{p.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text-muted">{p.category.nombre}</td>
                  <td className="px-5 py-3 text-text-muted">{p.brand.nombre}</td>
                  <td className="px-5 py-3">{formatearMoneda(Number(p.precio))}</td>
                  <td className="px-5 py-3">
                    <span className={bajoStock ? "font-semibold text-red-600" : ""}>{stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        p.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/productos/${p.id}`}
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
              );
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No se encontraron productos.</p>}
      </div>
    </div>
  );
}

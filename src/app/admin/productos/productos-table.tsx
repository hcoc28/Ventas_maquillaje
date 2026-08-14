"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Pencil, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { formatearMoneda } from "@/lib/utils";
import type { getTodosLosProductosAdmin } from "@/server/services/producto.service";

type Resultado = Awaited<ReturnType<typeof getTodosLosProductosAdmin>>;

export function ProductosTable({
  resultado,
  busquedaInicial,
  mostrarTodosInicial,
}: {
  resultado: Resultado;
  busquedaInicial: string;
  mostrarTodosInicial: boolean;
}) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [termino, setTermino] = useState(busquedaInicial);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (termino === busquedaInicial) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (termino.trim()) params.set("q", termino.trim());
      if (mostrarTodosInicial) params.set("todos", "1");
      params.set("pagina", "1");
      router.push(`/admin/productos?${params.toString()}`);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termino]);

  function irAPagina(p: number) {
    const params = new URLSearchParams();
    if (busquedaInicial) params.set("q", busquedaInicial);
    if (mostrarTodosInicial) params.set("todos", "1");
    params.set("pagina", String(p));
    router.push(`/admin/productos?${params.toString()}`);
  }

  function alternarMostrarTodos(mostrarTodos: boolean) {
    const params = new URLSearchParams();
    if (busquedaInicial) params.set("q", busquedaInicial);
    if (mostrarTodos) params.set("todos", "1");
    params.set("pagina", "1");
    router.push(`/admin/productos?${params.toString()}`);
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            value={termino}
            onChange={(e) => setTermino(e.target.value)}
            placeholder="Buscar por nombre, marca o categoría..."
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-11 pr-4 text-sm outline-none focus:border-accent-strong"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={mostrarTodosInicial}
            onChange={(e) => alternarMostrarTodos(e.target.checked)}
            className="h-4 w-4"
          />
          Mostrar inactivos
        </label>
        <span className="text-sm text-text-muted">{resultado.totalRegistros} productos</span>
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
            {resultado.items.map((p) => {
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
        {resultado.items.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No se encontraron productos.</p>}
      </div>

      {resultado.totalPaginas > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - resultado.pagina) <= 2 || p === 1 || p === resultado.totalPaginas)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-text-muted">…</span>}
                <button
                  type="button"
                  onClick={() => irAPagina(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm transition ${
                    p === resultado.pagina ? "bg-black text-white" : "hover:bg-surface-muted"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

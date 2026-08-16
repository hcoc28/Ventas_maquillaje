"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { formatearMoneda } from "@/lib/utils";
import { ESTADOS_PEDIDO } from "@/validators/admin";
import { construirEnlaceNotificacionEstado } from "@/server/services/whatsapp.service";
import type { getTodosLosPedidosAdmin } from "@/server/services/pedido.service";

type Resultado = Awaited<ReturnType<typeof getTodosLosPedidosAdmin>>;

const colorPorEstado: Record<string, string> = {
  Pendiente: "bg-amber-500/10 text-amber-600",
  Confirmado: "bg-blue-500/10 text-blue-600",
  Enviado: "bg-indigo-500/10 text-indigo-600",
  Entregado: "bg-emerald-500/10 text-emerald-600",
  Cancelado: "bg-red-500/10 text-red-600",
};

export function PedidosTable({ resultado, estadoInicial }: { resultado: Resultado; estadoInicial: string }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const pedidos = resultado.items;
  const [estadosEditados, setEstadosEditados] = useState(new Map<number, string>());
  const [guardando, setGuardando] = useState<number | null>(null);

  function irAPagina(p: number) {
    const params = new URLSearchParams();
    if (estadoInicial) params.set("estado", estadoInicial);
    params.set("pagina", String(p));
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  function filtrarPorEstado(estado: string) {
    const params = new URLSearchParams();
    if (estado) params.set("estado", estado);
    params.set("pagina", "1");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  async function actualizarEstado(id: number, estado: string) {
    setGuardando(id);
    try {
      await axios.put(`/api/admin/pedidos/${id}`, { estado });
      setEstadosEditados((prev) => new Map(prev).set(id, estado));
      mostrar("Estado del pedido actualizado.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar el estado.", "error");
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          value={estadoInicial}
          onChange={(e) => filtrarPorEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus:border-accent-strong"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PEDIDO.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <span className="text-sm text-text-muted">{resultado.totalRegistros} pedidos</span>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Pedido</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Fecha</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Pago</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Notificar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pedidos.map((p) => {
            const estado = estadosEditados.get(p.id) ?? p.estado;
            return (
              <tr key={p.id}>
                <td className="px-5 py-3 font-medium">{p.numeroPedido}</td>
                <td className="px-5 py-3">
                  <p>{p.clienteNombre}</p>
                  <p className="text-xs text-text-muted">{p.clienteEmail}</p>
                </td>
                <td className="px-5 py-3 text-text-muted">{new Date(p.fechaPedido).toLocaleDateString("es-GT")}</td>
                <td className="px-5 py-3 font-semibold">{formatearMoneda(p.total)}</td>
                <td className="px-5 py-3 text-text-muted">{p.metodoPago}</td>
                <td className="px-5 py-3">
                  <select
                    value={estado}
                    disabled={guardando === p.id}
                    onChange={(e) => actualizarEstado(p.id, e.target.value)}
                    className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide outline-none disabled:opacity-50 ${
                      colorPorEstado[estado] ?? "bg-surface-muted"
                    }`}
                  >
                    {ESTADOS_PEDIDO.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <a
                    href={construirEnlaceNotificacionEstado({
                      nombreContacto: p.nombreContacto,
                      telefonoContacto: p.telefonoContacto,
                      numeroPedido: p.numeroPedido,
                      estado,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Notificar por WhatsApp"
                    title="Notificar al cliente por WhatsApp"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-500/10"
                  >
                    <MessageCircle size={16} />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
        {pedidos.length === 0 && <p className="py-10 text-center text-sm text-text-muted">Aún no hay pedidos.</p>}
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

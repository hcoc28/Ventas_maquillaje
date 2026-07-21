"use client";

import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { formatearMoneda } from "@/lib/utils";
import { ESTADOS_PEDIDO } from "@/validators/admin";
import type { getTodosLosPedidosAdmin } from "@/server/services/pedido.service";

type Pedido = Awaited<ReturnType<typeof getTodosLosPedidosAdmin>>[number];

const colorPorEstado: Record<string, string> = {
  Pendiente: "bg-amber-500/10 text-amber-600",
  Confirmado: "bg-blue-500/10 text-blue-600",
  Enviado: "bg-indigo-500/10 text-indigo-600",
  Entregado: "bg-emerald-500/10 text-emerald-600",
  Cancelado: "bg-red-500/10 text-red-600",
};

export function PedidosTable({ pedidos }: { pedidos: Pedido[] }) {
  const { mostrar } = useToast();
  const [estados, setEstados] = useState(new Map(pedidos.map((p) => [p.id, p.estado])));
  const [guardando, setGuardando] = useState<number | null>(null);

  async function actualizarEstado(id: number, estado: string) {
    setGuardando(id);
    try {
      await axios.put(`/api/admin/pedidos/${id}`, { estado });
      setEstados((prev) => new Map(prev).set(id, estado));
      mostrar("Estado del pedido actualizado.");
    } catch {
      mostrar("No se pudo actualizar el estado.", "error");
    } finally {
      setGuardando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Pedido</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Fecha</th>
            <th className="px-5 py-3">Total</th>
            <th className="px-5 py-3">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pedidos.map((p) => {
            const estado = estados.get(p.id) ?? p.estado;
            return (
              <tr key={p.id}>
                <td className="px-5 py-3 font-medium">{p.numeroPedido}</td>
                <td className="px-5 py-3">
                  <p>{p.clienteNombre}</p>
                  <p className="text-xs text-text-muted">{p.clienteEmail}</p>
                </td>
                <td className="px-5 py-3 text-text-muted">{new Date(p.fechaPedido).toLocaleDateString("es-GT")}</td>
                <td className="px-5 py-3 font-semibold">{formatearMoneda(p.total)}</td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
      {pedidos.length === 0 && <p className="py-10 text-center text-sm text-text-muted">Aún no hay pedidos.</p>}
    </div>
  );
}

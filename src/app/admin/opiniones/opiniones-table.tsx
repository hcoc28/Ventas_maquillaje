"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Check, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmacionModal } from "@/components/admin/confirmacion-modal";
import type { listarOpinionesAdmin } from "@/server/services/opinion.service";

type Opinion = Awaited<ReturnType<typeof listarOpinionesAdmin>>[number];

export function OpinionesTable({ opiniones }: { opiniones: Opinion[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [opinionConfirmacion, setOpinionConfirmacion] = useState<Opinion | null>(null);

  async function aprobar(id: number) {
    setProcesando(id);
    try {
      await axios.patch(`/api/admin/opiniones/${id}`);
      mostrar("Opinión aprobada.");
      router.refresh();
    } catch {
      mostrar("No se pudo aprobar la opinión.", "error");
    } finally {
      setProcesando(null);
    }
  }

  async function eliminar() {
    if (!opinionConfirmacion) return;
    setProcesando(opinionConfirmacion.id);
    try {
      await axios.delete(`/api/admin/opiniones/${opinionConfirmacion.id}`);
      mostrar("Opinión eliminada.");
      setOpinionConfirmacion(null);
      router.refresh();
    } catch {
      mostrar("No se pudo eliminar la opinión.", "error");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Producto</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Calificación</th>
            <th className="px-5 py-3">Comentario</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {opiniones.map((o) => (
            <tr key={o.id}>
              <td className="px-5 py-3 font-medium">{o.product.nombre}</td>
              <td className="px-5 py-3 text-text-muted">
                {o.user.nombre} {o.user.apellido}
              </td>
              <td className="px-5 py-3 text-brand-gold">
                {"★".repeat(o.calificacion)}
                {"☆".repeat(5 - o.calificacion)}
              </td>
              <td className="max-w-xs px-5 py-3 text-text-muted">{o.comentario}</td>
              <td className="px-5 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    o.aprobada ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {o.aprobada ? "Aprobada" : "Pendiente"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  {!o.aprobada && (
                    <button
                      type="button"
                      onClick={() => aprobar(o.id)}
                      disabled={procesando === o.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-50"
                      aria-label="Aprobar"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpinionConfirmacion(o)}
                    disabled={procesando === o.id}
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
      {opiniones.length === 0 && <p className="py-10 text-center text-sm text-text-muted">No hay opiniones registradas.</p>}
      <ConfirmacionModal
        abierto={opinionConfirmacion !== null}
        titulo="Eliminar opinión"
        descripcion={`Se eliminará la opinión de ${opinionConfirmacion?.user.nombre ?? "este cliente"}. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        procesando={procesando !== null}
        onCerrar={() => {
          if (procesando === null) setOpinionConfirmacion(null);
        }}
        onConfirmar={eliminar}
      />
    </div>
  );
}

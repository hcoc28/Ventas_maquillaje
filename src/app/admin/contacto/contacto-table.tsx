"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Check, Mail, MailOpen, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmacionModal } from "@/components/admin/confirmacion-modal";
import type { getTodosLosMensajesAdmin } from "@/server/services/contacto.service";

type Mensaje = Awaited<ReturnType<typeof getTodosLosMensajesAdmin>>[number];

export function ContactoTable({ mensajes }: { mensajes: Mensaje[] }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [procesando, setProcesando] = useState<number | null>(null);
  const [mensajeEliminar, setMensajeEliminar] = useState<Mensaje | null>(null);

  async function cambiarLeido(id: number, leido: boolean) {
    setProcesando(id);
    try {
      await axios.patch(`/api/admin/contacto/${id}`, { leido });
      mostrar(leido ? "Mensaje marcado como leído." : "Mensaje marcado como no leído.");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo actualizar el mensaje.", "error");
    } finally {
      setProcesando(null);
    }
  }

  async function eliminarMensaje() {
    if (!mensajeEliminar) return;
    setProcesando(mensajeEliminar.id);
    try {
      await axios.delete(`/api/admin/contacto/${mensajeEliminar.id}`);
      mostrar("Mensaje eliminado.");
      setMensajeEliminar(null);
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo eliminar el mensaje.", "error");
    } finally {
      setProcesando(null);
    }
  }

  if (mensajes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface py-16 text-center shadow-[var(--shadow-soft)]">
        <Mail size={32} className="text-text-muted" />
        <p className="text-sm text-text-muted">No hay mensajes de contacto todavía.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {mensajes.map((m) => (
        <div
          key={m.id}
          className={`rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)] ${!m.leido ? "border-l-4 border-accent-strong" : ""}`}
        >
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold">{m.nombre}</p>
              <a href={`mailto:${m.email}`} className="text-sm text-text-muted hover:underline">
                {m.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  m.leido ? "bg-surface-muted text-text-muted" : "bg-accent-strong/15 text-accent-strong"
                }`}
              >
                {m.leido ? "Leído" : "No leído"}
              </span>
              <span className="text-xs text-text-muted">
                {new Date(m.createdAt).toLocaleDateString("es-GT", { dateStyle: "long" })}
              </span>
            </div>
          </div>

          <p className="mb-1 text-sm font-semibold">{m.asunto}</p>
          <p className="whitespace-pre-wrap text-sm text-text-muted">{m.mensaje}</p>

          <div className="mt-4 flex flex-wrap gap-2">
          {!m.leido ? (
            <button
              type="button"
              onClick={() => cambiarLeido(m.id, true)}
              disabled={procesando === m.id}
              className="mt-4 flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted disabled:opacity-50"
            >
              <Check size={14} /> Marcar como leído
            </button>
          ) : (
            <button
              type="button"
              onClick={() => cambiarLeido(m.id, false)}
              disabled={procesando === m.id}
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted disabled:opacity-50"
            >
              <MailOpen size={14} /> Marcar no leído
            </button>
          )}
            <button
              type="button"
              onClick={() => setMensajeEliminar(m)}
              disabled={procesando === m.id}
              className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </div>
        </div>
      ))}
      <ConfirmacionModal
        abierto={mensajeEliminar !== null}
        titulo="Eliminar mensaje"
        descripcion={`Se eliminará el mensaje de ${mensajeEliminar?.nombre ?? "este contacto"}. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        procesando={procesando !== null}
        onCerrar={() => {
          if (procesando === null) setMensajeEliminar(null);
        }}
        onConfirmar={eliminarMensaje}
      />
    </div>
  );
}

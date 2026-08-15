"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Download, Mail } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { AccionesMenu } from "@/components/admin/acciones-menu";
import type { getTodosLosSuscriptoresAdmin } from "@/server/services/newsletter.service";

type Suscriptor = Awaited<ReturnType<typeof getTodosLosSuscriptoresAdmin>>[number];

export function NewsletterTable({ suscriptores }: { suscriptores: Suscriptor[] }) {
  const router = useRouter();
  const { mostrar } = useToast();

  async function cambiarActivo(id: number, activo: boolean) {
    try {
      await axios.patch(`/api/admin/newsletter/${id}`, { activo });
      mostrar(activo ? "Suscriptor activado." : "Suscriptor desactivado.");
      router.refresh();
    } catch {
      mostrar("No se pudo actualizar el suscriptor.", "error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link
          href="/api/admin/newsletter/exportar"
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted"
        >
          <Download size={14} /> Exportar CSV
        </Link>
      </div>

      {suscriptores.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface py-16 text-center shadow-[var(--shadow-soft)]">
          <Mail size={32} className="text-text-muted" />
          <p className="text-sm text-text-muted">No hay suscriptores todavía.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-5 py-3">Correo</th>
                <th className="px-5 py-3">Fecha de suscripción</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suscriptores.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3 font-medium">{s.email}</td>
                  <td className="px-5 py-3 text-text-muted">
                    {new Date(s.createdAt).toLocaleDateString("es-GT", { dateStyle: "long" })}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.activo ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      }`}
                    >
                      {s.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <AccionesMenu
                        activo={s.activo}
                        nombre={s.email}
                        accionDesactivar="Desactivar"
                        onCambiarActivo={(activo) => cambiarActivo(s.id, activo)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

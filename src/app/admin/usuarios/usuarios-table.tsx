"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import type { getTodosLosUsuariosAdmin } from "@/server/services/usuario.service";

type Usuario = Awaited<ReturnType<typeof getTodosLosUsuariosAdmin>>[number];

export function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  const { data: session } = useSession();
  const { mostrar } = useToast();
  const [estado, setEstado] = useState(new Map(usuarios.map((u) => [u.id, { activo: u.activo }])));
  const [guardando, setGuardando] = useState<number | null>(null);

  async function guardar(userId: number) {
    const datos = estado.get(userId);
    if (!datos) return;
    setGuardando(userId);
    try {
      await axios.put(`/api/admin/usuarios/${userId}`, datos);
      mostrar("Usuario actualizado.");
    } catch {
      mostrar("No se pudo actualizar el usuario.", "error");
    } finally {
      setGuardando(null);
    }
  }

  function actualizar(userId: number, activo: boolean) {
    setEstado((prev) => {
      const nuevo = new Map(prev);
      nuevo.set(userId, { activo });
      return nuevo;
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow-soft)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-5 py-3">Nombre</th>
            <th className="px-5 py-3">Correo</th>
            <th className="px-5 py-3">Pedidos</th>
            <th className="px-5 py-3">Rol</th>
            <th className="px-5 py-3">Activo</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {usuarios.map((u) => {
            const datos = estado.get(u.id)!;
            const esUsuarioActual = session?.user?.email === u.email;
            const cambiado = datos.activo !== u.activo;
            return (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium">
                  {u.nombre} {u.apellido}
                </td>
                <td className="px-5 py-3 text-text-muted">{u.email}</td>
                <td className="px-5 py-3">{u._count.orders}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-semibold text-text-muted">
                    {u.role.nombre}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <input
                    type="checkbox"
                    checked={datos.activo}
                    disabled={esUsuarioActual}
                    onChange={(e) => actualizar(u.id, e.target.checked)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => guardar(u.id)}
                    disabled={!cambiado || guardando === u.id || esUsuarioActual}
                    className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent-strong disabled:opacity-40"
                  >
                    Guardar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

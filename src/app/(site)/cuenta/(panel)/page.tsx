import Link from "next/link";
import { Heart, Package, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { obtenerPerfil } from "@/server/services/usuario.service";
import { getPedidosPorUsuario } from "@/server/services/pedido.service";
import { getIdsFavoritos } from "@/server/services/favorito.service";
import { formatearMoneda } from "@/lib/utils";

export default async function CuentaIndexPage() {
  const session = await auth();
  const userId = Number(session!.user.id);

  const [perfil, pedidos, idsFavoritos] = await Promise.all([
    obtenerPerfil(userId),
    getPedidosPorUsuario(userId),
    getIdsFavoritos(userId),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Mi cuenta</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Hola, {perfil?.nombre}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/cuenta/pedidos" className="flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-strong)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
            <Package size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold">{pedidos.length}</p>
            <p className="text-sm text-text-muted">Pedidos realizados</p>
          </div>
        </Link>
        <Link href="/cuenta/favoritos" className="flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-strong)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
            <Heart size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold">{idsFavoritos.length}</p>
            <p className="text-sm text-text-muted">Favoritos guardados</p>
          </div>
        </Link>
        <Link href="/cuenta/perfil" className="flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-strong)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
            <User size={20} />
          </span>
          <div>
            <p className="text-2xl font-bold">{perfil?.rol}</p>
            <p className="text-sm text-text-muted">Tipo de cuenta</p>
          </div>
        </Link>
      </div>

      <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos recientes</h2>
          <Link href="/cuenta/pedidos" className="text-sm font-medium text-accent-strong hover:underline">
            Ver todos
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">Todavía no has realizado ningún pedido.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {pedidos.slice(0, 3).map((pedido) => (
              <div key={pedido.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{pedido.numeroPedido}</p>
                  <p className="text-xs text-text-muted">{new Date(pedido.fechaPedido).toLocaleDateString("es-GT", { dateStyle: "long" })}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatearMoneda(pedido.total)}</p>
                  <p className="text-xs text-text-muted">{pedido.estado}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

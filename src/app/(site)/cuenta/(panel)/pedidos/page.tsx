import { MessageCircle, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPedidosPorUsuario } from "@/server/services/pedido.service";
import { formatearMoneda } from "@/lib/utils";

export default async function CuentaPedidosPage() {
  const session = await auth();
  const pedidos = await getPedidosPorUsuario(Number(session!.user.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Historial</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Mis pedidos</h1>
      </div>

      {pedidos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface py-16 text-center shadow-[var(--shadow-soft)]">
          <Package size={32} className="text-text-muted" />
          <p className="text-sm text-text-muted">Todavía no has realizado ningún pedido.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <p className="font-semibold">{pedido.numeroPedido}</p>
                  <p className="text-xs text-text-muted">{new Date(pedido.fechaPedido).toLocaleDateString("es-GT", { dateStyle: "long" })}</p>
                </div>
                <span className="rounded-full bg-accent-strong/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-strong">
                  {pedido.estado}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {pedido.detalles.map((detalle, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>
                      {detalle.cantidad} × {detalle.nombreProducto}
                    </span>
                    <span className="text-text-muted">{formatearMoneda(detalle.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-text-muted">Total</span>
                <span className="text-lg font-bold">{formatearMoneda(pedido.total)}</span>
              </div>

              {pedido.enlaceWhatsApp && (
                <a
                  href={pedido.enlaceWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-full border border-border py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted"
                >
                  <MessageCircle size={14} /> Reenviar pedido por WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

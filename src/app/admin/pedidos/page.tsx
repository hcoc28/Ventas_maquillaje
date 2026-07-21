import { getTodosLosPedidosAdmin } from "@/server/services/pedido.service";
import { PedidosTable } from "./pedidos-table";

export default async function AdminPedidosPage() {
  const pedidos = await getTodosLosPedidosAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Ventas</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Pedidos</h1>
      </div>

      <PedidosTable pedidos={pedidos} />
    </div>
  );
}

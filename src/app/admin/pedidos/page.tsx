import { getTodosLosPedidosAdmin } from "@/server/services/pedido.service";
import { ESTADOS_PEDIDO } from "@/validators/admin";
import { PedidosTable } from "./pedidos-table";

const TAMANO_PAGINA = 20;

interface Props {
  searchParams: Promise<{ pagina?: string; estado?: string }>;
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const params = await searchParams;
  const pagina = Math.max(Number(params.pagina) || 1, 1);
  const estado = (ESTADOS_PEDIDO as readonly string[]).includes(params.estado ?? "") ? params.estado : undefined;

  const resultado = await getTodosLosPedidosAdmin({ pagina, tamanoPagina: TAMANO_PAGINA, estado });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Ventas</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Pedidos</h1>
      </div>

      <PedidosTable resultado={resultado} estadoInicial={estado ?? ""} />
    </div>
  );
}

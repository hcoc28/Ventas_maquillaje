import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodosLosProductosAdmin } from "@/server/services/producto.service";
import { ProductosTable } from "./productos-table";

const TAMANO_PAGINA = 20;

interface Props {
  searchParams: Promise<{ pagina?: string; q?: string }>;
}

export default async function AdminProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const pagina = Math.max(Number(params.pagina) || 1, 1);
  const busqueda = params.q?.trim() || undefined;

  const resultado = await getTodosLosProductosAdmin({ pagina, tamanoPagina: TAMANO_PAGINA, busqueda });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nuevo producto
        </Link>
      </div>

      <ProductosTable resultado={resultado} busquedaInicial={busqueda ?? ""} />
    </div>
  );
}

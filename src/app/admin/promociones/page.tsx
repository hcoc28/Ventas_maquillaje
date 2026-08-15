import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodasLasPromocionesAdmin } from "@/server/services/promocion.service";
import { PromocionesTable } from "./promociones-table";

interface Props {
  searchParams: Promise<{ todos?: string }>;
}

export default async function AdminPromocionesPage({ searchParams }: Props) {
  const params = await searchParams;
  const mostrarTodos = params.todos === "1";
  const promociones = await getTodasLasPromocionesAdmin(!mostrarTodos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Promociones</h1>
        </div>
        <Link
          href="/admin/promociones/nueva"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nueva promoción
        </Link>
      </div>

      <PromocionesTable promociones={promociones} mostrarTodosInicial={mostrarTodos} />
    </div>
  );
}

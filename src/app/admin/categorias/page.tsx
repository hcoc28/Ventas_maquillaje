import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodasLasCategoriasAdmin } from "@/server/services/categoria.service";
import { CategoriasTable } from "./categorias-table";

export default async function AdminCategoriasPage() {
  const categorias = await getTodasLasCategoriasAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Categorías</h1>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nueva categoría
        </Link>
      </div>

      <CategoriasTable categorias={categorias} />
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodasLasMarcasAdmin } from "@/server/services/marca.service";
import { MarcasTable } from "./marcas-table";

export default async function AdminMarcasPage() {
  const marcas = await getTodasLasMarcasAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Marcas</h1>
        </div>
        <Link
          href="/admin/marcas/nueva"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nueva marca
        </Link>
      </div>

      <MarcasTable marcas={marcas} />
    </div>
  );
}

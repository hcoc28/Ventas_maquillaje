import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodosLosCuponesAdmin } from "@/server/services/cupon.service";
import { CuponesTable } from "./cupones-table";

interface Props {
  searchParams: Promise<{ todos?: string }>;
}

export default async function AdminCuponesPage({ searchParams }: Props) {
  const params = await searchParams;
  const mostrarTodos = params.todos === "1";
  const cupones = await getTodosLosCuponesAdmin(!mostrarTodos);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Cupones</h1>
        </div>
        <Link
          href="/admin/cupones/nuevo"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nuevo cupón
        </Link>
      </div>

      <CuponesTable cupones={cupones} mostrarTodosInicial={mostrarTodos} />
    </div>
  );
}

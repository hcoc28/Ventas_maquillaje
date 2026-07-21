import { notFound } from "next/navigation";
import { getCategoriaPorId } from "@/server/services/categoria.service";
import { CategoriaForm } from "../categoria-form";

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const categoria = await getCategoriaPorId(Number(id));
  if (!categoria) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar categoría</h1>
      </div>
      <CategoriaForm
        categoriaId={categoria.id}
        valoresIniciales={{
          nombre: categoria.nombre,
          slug: categoria.slug,
          descripcion: categoria.descripcion ?? "",
          imagenUrl: categoria.imagenUrl ?? "",
          icono: categoria.icono ?? "",
          orden: categoria.orden,
          activo: categoria.activo,
        }}
      />
    </div>
  );
}

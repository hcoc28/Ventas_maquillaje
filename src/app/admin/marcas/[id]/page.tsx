import { notFound } from "next/navigation";
import { getMarcaPorId } from "@/services/marca.service";
import { MarcaForm } from "../marca-form";

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const marca = await getMarcaPorId(Number(id));
  if (!marca) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar marca</h1>
      </div>
      <MarcaForm
        marcaId={marca.id}
        valoresIniciales={{
          nombre: marca.nombre,
          slug: marca.slug,
          descripcion: marca.descripcion ?? "",
          logoUrl: marca.logoUrl ?? "",
          activo: marca.activo,
        }}
      />
    </div>
  );
}

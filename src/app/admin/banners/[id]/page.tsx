import { notFound } from "next/navigation";
import { getBannerPorId } from "@/services/banner.service";
import { BannerForm } from "../banner-form";

export default async function EditarBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await getBannerPorId(Number(id));
  if (!banner) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Contenido</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar banner</h1>
      </div>
      <BannerForm
        bannerId={banner.id}
        valoresIniciales={{
          titulo: banner.titulo,
          subtitulo: banner.subtitulo ?? "",
          imagenUrl: banner.imagenUrl,
          textoBotonPrimario: banner.textoBotonPrimario ?? "",
          urlBotonPrimario: banner.urlBotonPrimario ?? "",
          orden: banner.orden,
          activo: banner.activo,
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getProductoPorIdAdmin } from "@/services/producto.service";
import { getTodasLasCategoriasAdmin } from "@/services/categoria.service";
import { getTodasLasMarcasAdmin } from "@/services/marca.service";
import { getTodasLasPromocionesAdmin } from "@/services/promocion.service";
import { ProductoForm } from "../producto-form";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [producto, categorias, marcas, promociones] = await Promise.all([
    getProductoPorIdAdmin(Number(id)),
    getTodasLasCategoriasAdmin(),
    getTodasLasMarcasAdmin(),
    getTodasLasPromocionesAdmin(),
  ]);
  if (!producto) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar producto</h1>
      </div>
      <ProductoForm
        productoId={producto.id}
        opciones={{
          categorias: categorias.map((c) => ({ id: c.id, nombre: c.nombre })),
          marcas: marcas.map((m) => ({ id: m.id, nombre: m.nombre })),
          promociones: promociones.map((p) => ({ id: p.id, nombre: p.nombre })),
        }}
        valoresIniciales={{
          nombre: producto.nombre,
          slug: producto.slug,
          descripcionCorta: producto.descripcionCorta,
          descripcionLarga: producto.descripcionLarga,
          ingredientes: producto.ingredientes ?? "",
          modoUso: producto.modoUso ?? "",
          beneficios: producto.beneficios ?? "",
          precio: Number(producto.precio),
          esNuevo: producto.esNuevo,
          esEdicionLimitada: producto.esEdicionLimitada,
          activo: producto.activo,
          categoryId: producto.categoryId,
          brandId: producto.brandId,
          promotionId: producto.promotionId,
          stock: producto.inventory?.stock ?? 0,
          stockMinimo: producto.inventory?.stockMinimo ?? 5,
          imagenes: producto.images
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((img) => ({ url: img.url, textoAlt: img.textoAlt, esPrincipal: img.esPrincipal })),
        }}
      />
    </div>
  );
}

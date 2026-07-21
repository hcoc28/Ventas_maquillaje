import { getTodasLasCategoriasAdmin } from "@/server/services/categoria.service";
import { getTodasLasMarcasAdmin } from "@/server/services/marca.service";
import { getTodasLasPromocionesAdmin } from "@/server/services/promocion.service";
import { ProductoForm } from "../producto-form";

export default async function NuevoProductoPage() {
  const [categorias, marcas, promociones] = await Promise.all([
    getTodasLasCategoriasAdmin(),
    getTodasLasMarcasAdmin(),
    getTodasLasPromocionesAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Nuevo producto</h1>
      </div>
      <ProductoForm
        opciones={{
          categorias: categorias.map((c) => ({ id: c.id, nombre: c.nombre })),
          marcas: marcas.map((m) => ({ id: m.id, nombre: m.nombre })),
          promociones: promociones.map((p) => ({ id: p.id, nombre: p.nombre })),
        }}
      />
    </div>
  );
}

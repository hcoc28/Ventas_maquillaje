import { notFound } from "next/navigation";
import { getPromocionPorId } from "@/server/services/promocion.service";
import { PromocionForm } from "../promocion-form";

function aFechaLocal(fecha: Date): string {
  const offset = fecha.getTimezoneOffset();
  const local = new Date(fecha.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditarPromocionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promocion = await getPromocionPorId(Number(id));
  if (!promocion) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar promoción</h1>
      </div>
      <PromocionForm
        promocionId={promocion.id}
        valoresIniciales={{
          nombre: promocion.nombre,
          descripcion: promocion.descripcion ?? "",
          porcentajeDescuento: Number(promocion.porcentajeDescuento),
          fechaInicio: aFechaLocal(promocion.fechaInicio),
          fechaFin: aFechaLocal(promocion.fechaFin),
          activo: promocion.activo,
        }}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getCuponPorIdAdmin } from "@/server/services/cupon.service";
import { CuponForm } from "../cupon-form";

function aFechaLocal(fecha: Date): string {
  const offset = fecha.getTimezoneOffset();
  const local = new Date(fecha.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default async function EditarCuponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cupon = await getCuponPorIdAdmin(Number(id));
  if (!cupon) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Editar cupón</h1>
      </div>
      <CuponForm
        cuponId={cupon.id}
        valoresIniciales={{
          codigo: cupon.codigo,
          porcentajeDescuento: Number(cupon.porcentajeDescuento),
          fechaInicio: aFechaLocal(cupon.fechaInicio),
          fechaFin: aFechaLocal(cupon.fechaFin),
          usoMaximo: cupon.usoMaximo,
          activo: cupon.activo,
        }}
      />
    </div>
  );
}

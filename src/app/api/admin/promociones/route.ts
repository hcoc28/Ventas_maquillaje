import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { promocionAdminSchema } from "@/validators/admin";
import { crearPromocion } from "@/server/services/promocion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = promocionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let promocion;
  try {
    promocion = await crearPromocion(parsed.data);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo crear la promoción.");
  }

  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: promocion.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(promocion, { status: 201 });
}

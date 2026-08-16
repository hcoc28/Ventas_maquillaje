import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { estadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoSuscriptorAdmin } from "@/server/services/newsletter.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let suscriptor;
  try {
    suscriptor = await actualizarEstadoSuscriptorAdmin(Number(id), parsed.data.activo);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo actualizar el suscriptor.");
  }

  await registrarAuditoria({
    entidad: "NewsletterSubscriber",
    entidadId: suscriptor.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json(suscriptor);
}

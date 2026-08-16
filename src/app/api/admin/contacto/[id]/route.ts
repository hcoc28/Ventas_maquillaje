import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { estadoLecturaContactoSchema } from "@/validators/admin";
import { cambiarEstadoMensajeAdmin, eliminarMensajeContactoAdmin } from "@/server/services/contacto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoLecturaContactoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let mensaje;
  try {
    mensaje = await cambiarEstadoMensajeAdmin(Number(id), parsed.data.leido);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo actualizar el mensaje.");
  }

  await registrarAuditoria({
    entidad: "ContactMessage",
    entidadId: mensaje.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json(mensaje);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  try {
    await eliminarMensajeContactoAdmin(Number(id));
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo eliminar el mensaje.");
  }

  await registrarAuditoria({
    entidad: "ContactMessage",
    entidadId: Number(id),
    accion: "eliminar",
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json({ ok: true });
}

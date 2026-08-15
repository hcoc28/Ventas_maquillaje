import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { estadoLecturaContactoSchema } from "@/validators/admin";
import { cambiarEstadoMensajeAdmin, eliminarMensajeContactoAdmin } from "@/server/services/contacto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoLecturaContactoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const mensaje = await cambiarEstadoMensajeAdmin(Number(id), parsed.data.leido);

  const session = await auth();
  await registrarAuditoria({
    entidad: "ContactMessage",
    entidadId: mensaje.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(mensaje);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarMensajeContactoAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "ContactMessage",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { marcarMensajeLeidoAdmin } from "@/server/services/contacto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mensaje = await marcarMensajeLeidoAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "ContactMessage",
    entidadId: mensaje.id,
    accion: "actualizar",
    valoresNuevos: { leido: true },
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(mensaje);
}

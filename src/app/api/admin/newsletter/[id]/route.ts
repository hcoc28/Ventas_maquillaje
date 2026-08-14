import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { estadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoSuscriptorAdmin } from "@/server/services/newsletter.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const suscriptor = await actualizarEstadoSuscriptorAdmin(Number(id), parsed.data.activo);

  const session = await auth();
  await registrarAuditoria({
    entidad: "NewsletterSubscriber",
    entidadId: suscriptor.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(suscriptor);
}

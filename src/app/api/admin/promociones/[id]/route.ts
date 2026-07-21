import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { promocionAdminSchema } from "@/validators/admin";
import { actualizarPromocion, eliminarPromocion } from "@/server/services/promocion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = promocionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = await actualizarPromocion(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: promocion.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(promocion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarPromocion(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json({ ok: true });
}

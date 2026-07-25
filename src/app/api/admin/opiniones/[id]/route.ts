import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aprobarOpinionAdmin, eliminarOpinionAdmin } from "@/server/services/opinion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opinion = await aprobarOpinionAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Opinion",
    entidadId: opinion.id,
    accion: "actualizar",
    valoresNuevos: { aprobada: true },
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(opinion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarOpinionAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Opinion",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json({ ok: true });
}

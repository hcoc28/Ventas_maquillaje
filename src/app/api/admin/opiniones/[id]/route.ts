import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(opinion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede eliminar permanentemente." }, { status: 403 });
  }

  await eliminarOpinionAdmin(Number(id));

  await registrarAuditoria({
    entidad: "Opinion",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json({ ok: true });
}

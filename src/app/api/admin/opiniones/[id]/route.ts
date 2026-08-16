import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin-auth";
import { aprobarOpinionAdmin, eliminarOpinionAdmin } from "@/server/services/opinion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const opinion = await aprobarOpinionAdmin(Number(id));

  await registrarAuditoria({
    entidad: "Opinion",
    entidadId: opinion.id,
    accion: "actualizar",
    valoresNuevos: { aprobada: true },
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(opinion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  await eliminarOpinionAdmin(Number(id));

  await registrarAuditoria({
    entidad: "Opinion",
    entidadId: Number(id),
    accion: "eliminar",
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json({ ok: true });
}

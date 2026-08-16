import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { estadoAdminSchema, promocionAdminSchema } from "@/validators/admin";
import { activarPromocion, actualizarPromocion, eliminarPromocion, eliminarPromocionPermanente } from "@/server/services/promocion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = promocionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = await actualizarPromocion(Number(id), parsed.data);

  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: promocion.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(promocion);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = parsed.data.activo ? await activarPromocion(Number(id)) : await eliminarPromocion(Number(id));

  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(promocion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  try {
    await eliminarPromocionPermanente(Number(id));

    await registrarAuditoria({
      entidad: "Promocion",
      entidadId: Number(id),
      accion: "eliminar",
      userId: Number(acceso.session.user.id),
    });

    revalidarCatalogoPublico();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo eliminar la promoción." }, { status: 400 });
  }
}

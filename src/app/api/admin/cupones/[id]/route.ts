import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { cuponAdminSchema, estadoAdminSchema } from "@/validators/admin";
import { activarCuponAdmin, actualizarCuponAdmin, desactivarCuponAdmin, eliminarCuponAdmin } from "@/server/services/cupon.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = cuponAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const cupon = await actualizarCuponAdmin(Number(id), parsed.data);

    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: cupon.id,
      accion: "actualizar",
      valoresNuevos: parsed.data,
      userId: Number(acceso.session.user.id),
    });

    return NextResponse.json(cupon);
  } catch (error) {
    return respuestaErrorAdmin(error, "Ya existe un cupón con ese código.");
  }
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

  let cupon;
  try {
    cupon = parsed.data.activo ? await activarCuponAdmin(Number(id)) : await desactivarCuponAdmin(Number(id));
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo actualizar el cupón.");
  }

  await registrarAuditoria({
    entidad: "Cupon",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json(cupon);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  try {
    await eliminarCuponAdmin(Number(id));

    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: Number(id),
      accion: "eliminar",
      userId: Number(acceso.session.user.id),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo eliminar el cupón.");
  }
}

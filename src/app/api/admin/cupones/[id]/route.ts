import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cuponAdminSchema, estadoAdminSchema } from "@/validators/admin";
import { activarCuponAdmin, actualizarCuponAdmin, desactivarCuponAdmin, eliminarCuponAdmin } from "@/server/services/cupon.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = cuponAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const cupon = await actualizarCuponAdmin(Number(id), parsed.data);

    const session = await auth();
    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: cupon.id,
      accion: "actualizar",
      valoresNuevos: parsed.data,
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    return NextResponse.json(cupon);
  } catch {
    return NextResponse.json({ mensaje: "Ya existe un cupón con ese código." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const cupon = parsed.data.activo ? await activarCuponAdmin(Number(id)) : await desactivarCuponAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Cupon",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(cupon);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede eliminar permanentemente." }, { status: 403 });
  }

  try {
    await eliminarCuponAdmin(Number(id));

    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: Number(id),
      accion: "eliminar",
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo eliminar el cupón." }, { status: 400 });
  }
}

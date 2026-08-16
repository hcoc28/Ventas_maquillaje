import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin-auth";
import { bannerAdminSchema, estadoAdminSchema } from "@/validators/admin";
import { actualizarBanner, cambiarEstadoBanner, eliminarBanner } from "@/server/services/banner.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bannerAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const banner = await actualizarBanner(Number(id), parsed.data);

  await registrarAuditoria({
    entidad: "Banner",
    entidadId: banner.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/");

  return NextResponse.json(banner);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  await eliminarBanner(Number(id));

  await registrarAuditoria({
    entidad: "Banner",
    entidadId: Number(id),
    accion: "eliminar",
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/");

  return NextResponse.json({ ok: true });
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

  const banner = await cambiarEstadoBanner(Number(id), parsed.data.activo);

  await registrarAuditoria({
    entidad: "Banner",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/");

  return NextResponse.json(banner);
}

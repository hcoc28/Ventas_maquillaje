import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { estadoAdminSchema, marcaAdminSchema } from "@/validators/admin";
import { activarMarca, actualizarMarca, eliminarMarca, eliminarMarcaPermanente } from "@/server/services/marca.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = marcaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const marca = await actualizarMarca(Number(id), parsed.data);

  await registrarAuditoria({
    entidad: "Marca",
    entidadId: marca.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(marca);
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

  const marca = parsed.data.activo ? await activarMarca(Number(id)) : await eliminarMarca(Number(id));

  await registrarAuditoria({
    entidad: "Marca",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(marca);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  try {
    await eliminarMarcaPermanente(Number(id));

    await registrarAuditoria({
      entidad: "Marca",
      entidadId: Number(id),
      accion: "eliminar",
      userId: Number(acceso.session.user.id),
    });

    revalidarCatalogoPublico();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo eliminar la marca.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }
}

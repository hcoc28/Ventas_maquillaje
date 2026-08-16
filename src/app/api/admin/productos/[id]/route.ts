import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { estadoAdminSchema, productoAdminSchema } from "@/validators/admin";
import {
  activarProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
  eliminarProductoPermanenteAdmin,
} from "@/server/services/producto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const producto = await actualizarProductoAdmin(Number(id), parsed.data);

  await registrarAuditoria({
    entidad: "Producto",
    entidadId: producto.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(producto);
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

  let producto;
  try {
    producto = parsed.data.activo ? await activarProductoAdmin(Number(id)) : await eliminarProductoAdmin(Number(id));
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo actualizar el producto.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }

  await registrarAuditoria({
    entidad: "Producto",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(producto);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  try {
    await eliminarProductoPermanenteAdmin(Number(id));

    await registrarAuditoria({
      entidad: "Producto",
      entidadId: Number(id),
      accion: "eliminar",
      userId: Number(acceso.session.user.id),
    });

    revalidarCatalogoPublico();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo eliminar el producto.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }
}

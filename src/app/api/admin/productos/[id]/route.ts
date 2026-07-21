import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { productoAdminSchema } from "@/validators/admin";
import { actualizarProductoAdmin, eliminarProductoAdmin, getProductoPorIdAdmin } from "@/server/services/producto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const producto = await getProductoPorIdAdmin(Number(id));
  if (!producto) return NextResponse.json({ mensaje: "Producto no encontrado." }, { status: 404 });
  return NextResponse.json(producto);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const producto = await actualizarProductoAdmin(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Producto",
    entidadId: producto.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(producto);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarProductoAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Producto",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { estadoAdminSchema, productoAdminSchema } from "@/validators/admin";
import {
  activarProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
  eliminarProductoPermanenteAdmin,
  getProductoPorIdAdmin,
} from "@/server/services/producto.service";
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

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(producto);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const producto = parsed.data.activo ? await activarProductoAdmin(Number(id)) : await eliminarProductoAdmin(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Producto",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(producto);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await eliminarProductoPermanenteAdmin(Number(id));

    const session = await auth();
    await registrarAuditoria({
      entidad: "Producto",
      entidadId: Number(id),
      accion: "eliminar",
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    revalidatePath("/");
    revalidatePath("/catalogo");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo eliminar el producto.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }
}

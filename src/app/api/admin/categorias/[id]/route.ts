import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { categoriaAdminSchema, estadoAdminSchema } from "@/validators/admin";
import { activarCategoria, actualizarCategoria, eliminarCategoria, eliminarCategoriaPermanente } from "@/server/services/categoria.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categoriaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const categoria = await actualizarCategoria(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Categoria",
    entidadId: categoria.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json(categoria);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const categoria = parsed.data.activo ? await activarCategoria(Number(id)) : await eliminarCategoria(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Categoria",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json(categoria);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede eliminar permanentemente." }, { status: 403 });
  }

  try {
    await eliminarCategoriaPermanente(Number(id));

    await registrarAuditoria({
      entidad: "Categoria",
      entidadId: Number(id),
      accion: "eliminar",
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    revalidatePath("/");
    revalidatePath("/catalogo");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo eliminar la categoría.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }
}

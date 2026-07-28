import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { categoriaAdminSchema } from "@/validators/admin";
import { actualizarCategoria, eliminarCategoria } from "@/server/services/categoria.service";
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

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarCategoria(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Categoria",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { estadoAdminSchema, marcaAdminSchema } from "@/validators/admin";
import { activarMarca, actualizarMarca, eliminarMarca, eliminarMarcaPermanente } from "@/server/services/marca.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = marcaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const marca = await actualizarMarca(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Marca",
    entidadId: marca.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json(marca);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const marca = parsed.data.activo ? await activarMarca(Number(id)) : await eliminarMarca(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Marca",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json(marca);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await eliminarMarcaPermanente(Number(id));

    const session = await auth();
    await registrarAuditoria({
      entidad: "Marca",
      entidadId: Number(id),
      accion: "eliminar",
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    revalidatePath("/");
    revalidatePath("/catalogo");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo eliminar la marca.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }
}

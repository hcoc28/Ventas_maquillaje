import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { marcaAdminSchema } from "@/validators/admin";
import { actualizarMarca, eliminarMarca } from "@/server/services/marca.service";
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

  return NextResponse.json(marca);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarMarca(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Marca",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json({ ok: true });
}

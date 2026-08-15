import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { estadoAdminSchema, promocionAdminSchema } from "@/validators/admin";
import { activarPromocion, actualizarPromocion, eliminarPromocion, eliminarPromocionPermanente } from "@/server/services/promocion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = promocionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = await actualizarPromocion(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: promocion.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(promocion);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = parsed.data.activo ? await activarPromocion(Number(id)) : await eliminarPromocion(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(promocion);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await eliminarPromocionPermanente(Number(id));

    const session = await auth();
    await registrarAuditoria({
      entidad: "Promocion",
      entidadId: Number(id),
      accion: "eliminar",
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    revalidatePath("/");
    revalidatePath("/producto/[slug]", "page");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ mensaje: "No se pudo eliminar la promoción." }, { status: 400 });
  }
}

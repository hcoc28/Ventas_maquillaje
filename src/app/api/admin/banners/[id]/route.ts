import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { bannerAdminSchema } from "@/validators/admin";
import { actualizarBanner, eliminarBanner } from "@/server/services/banner.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bannerAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const banner = await actualizarBanner(Number(id), parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Banner",
    entidadId: banner.id,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json(banner);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await eliminarBanner(Number(id));

  const session = await auth();
  await registrarAuditoria({
    entidad: "Banner",
    entidadId: Number(id),
    accion: "eliminar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");

  return NextResponse.json({ ok: true });
}

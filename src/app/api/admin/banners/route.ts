import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { bannerAdminSchema } from "@/validators/admin";
import { crearBanner, getTodosLosBannersAdmin } from "@/server/services/banner.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function GET() {
  const banners = await getTodosLosBannersAdmin();
  return NextResponse.json(banners);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bannerAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const banner = await crearBanner(parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Banner",
    entidadId: banner.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(banner, { status: 201 });
}

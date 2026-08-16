import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { bannerAdminSchema } from "@/validators/admin";
import { crearBanner } from "@/server/services/banner.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = bannerAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let banner;
  try {
    banner = await crearBanner(parsed.data);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo crear el banner.");
  }

  await registrarAuditoria({
    entidad: "Banner",
    entidadId: banner.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/");

  return NextResponse.json(banner, { status: 201 });
}

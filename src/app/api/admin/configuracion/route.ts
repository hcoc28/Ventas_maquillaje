import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { configuracionAdminSchema } from "@/validators/admin";
import { actualizarConfiguracionAdmin } from "@/server/services/configuracion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede cambiar la configuración." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = configuracionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const configuracion = await actualizarConfiguracionAdmin(parsed.data);

  await registrarAuditoria({
    entidad: "Configuracion",
    entidadId: 1,
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/catalogo");

  return NextResponse.json(configuracion);
}

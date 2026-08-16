import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin-auth";
import { configuracionAdminSchema } from "@/validators/admin";
import { actualizarConfiguracionAdmin } from "@/server/services/configuracion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest) {
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

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
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/contacto");

  return NextResponse.json(configuracion);
}

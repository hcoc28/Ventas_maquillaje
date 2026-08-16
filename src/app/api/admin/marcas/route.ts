import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { marcaAdminSchema } from "@/validators/admin";
import { crearMarca } from "@/server/services/marca.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = marcaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const marca = await crearMarca(parsed.data);

  await registrarAuditoria({
    entidad: "Marca",
    entidadId: marca.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(marca, { status: 201 });
}

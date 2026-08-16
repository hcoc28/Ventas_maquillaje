import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { cuponAdminSchema } from "@/validators/admin";
import { crearCuponAdmin } from "@/server/services/cupon.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = cuponAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const cupon = await crearCuponAdmin(parsed.data);

    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: cupon.id,
      accion: "crear",
      valoresNuevos: parsed.data,
      userId: Number(acceso.session.user.id),
    });

    return NextResponse.json(cupon, { status: 201 });
  } catch {
    return NextResponse.json({ mensaje: "Ya existe un cupón con ese código." }, { status: 400 });
  }
}

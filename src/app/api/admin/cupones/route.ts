import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cuponAdminSchema } from "@/validators/admin";
import { crearCuponAdmin, getTodosLosCuponesAdmin } from "@/server/services/cupon.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function GET() {
  const cupones = await getTodosLosCuponesAdmin();
  return NextResponse.json(cupones);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = cuponAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const cupon = await crearCuponAdmin(parsed.data);

    const session = await auth();
    await registrarAuditoria({
      entidad: "Cupon",
      entidadId: cupon.id,
      accion: "crear",
      valoresNuevos: parsed.data,
      userId: session?.user?.id ? Number(session.user.id) : null,
    });

    return NextResponse.json(cupon, { status: 201 });
  } catch {
    return NextResponse.json({ mensaje: "Ya existe un cupón con ese código." }, { status: 400 });
  }
}

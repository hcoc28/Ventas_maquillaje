import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cambiarPasswordSchema } from "@/validators/auth";
import { cambiarPassword } from "@/server/services/usuario.service";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = cambiarPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await cambiarPassword(Number(session.user.id), parsed.data.passwordActual, parsed.data.passwordNueva);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo cambiar la contraseña." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

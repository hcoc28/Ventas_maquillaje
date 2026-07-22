import { NextRequest, NextResponse } from "next/server";
import { restablecerPasswordSchema } from "@/validators/auth";
import { restablecerPassword } from "@/server/services/usuario.service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = restablecerPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await restablecerPassword(parsed.data.token, parsed.data.password);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo restablecer la contraseña." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

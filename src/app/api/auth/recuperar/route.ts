import { NextRequest, NextResponse } from "next/server";
import { recuperarPasswordSchema } from "@/validators/auth";
import { solicitarRecuperacionPassword } from "@/server/services/usuario.service";

const MENSAJE_GENERICO = "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = recuperarPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  await solicitarRecuperacionPassword(parsed.data.email);

  // Misma respuesta exista o no la cuenta — evita que el formulario sirva para enumerar correos.
  return NextResponse.json({ mensaje: MENSAJE_GENERICO });
}

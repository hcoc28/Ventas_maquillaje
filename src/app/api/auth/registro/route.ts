import { NextRequest, NextResponse } from "next/server";
import { registroSchema } from "@/validators/auth";
import { registrarUsuario } from "@/server/services/usuario.service";
import { registrarActividad } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registroSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await registrarUsuario(parsed.data);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo crear la cuenta." }, { status: 400 });
  }

  await registrarActividad(resultado.valor!.id, "Registro de cuenta");

  return NextResponse.json({ ok: true });
}

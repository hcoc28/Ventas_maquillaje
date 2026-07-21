import { NextRequest, NextResponse } from "next/server";
import { contactoSchema } from "@/validators/contacto";
import { enviarMensaje } from "@/services/contacto.service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const { nombre, email, asunto, mensaje } = parsed.data;
  const resultado = await enviarMensaje(nombre, email, asunto, mensaje);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: "No se pudo enviar tu mensaje." }, { status: 400 });
  }

  return NextResponse.json({ mensaje: "Tu mensaje fue enviado correctamente." });
}

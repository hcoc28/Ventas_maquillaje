import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/validators/contacto";
import { suscribir } from "@/services/newsletter.service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await suscribir(parsed.data.email);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo suscribir." }, { status: 400 });
  }

  return NextResponse.json({ mensaje: "Suscripción exitosa." });
}

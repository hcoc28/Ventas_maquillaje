import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { perfilSchema } from "@/validators/auth";
import { actualizarPerfil, obtenerPerfil } from "@/services/usuario.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "No autenticado." }, { status: 401 });
  }

  const perfil = await obtenerPerfil(Number(session.user.id));
  if (!perfil) {
    return NextResponse.json({ mensaje: "Perfil no encontrado." }, { status: 404 });
  }

  return NextResponse.json(perfil);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "No autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = perfilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await actualizarPerfil(Number(session.user.id), parsed.data);
  return NextResponse.json({ ok: resultado.exitoso });
}

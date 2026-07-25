import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { crearOpinionSchema } from "@/validators/opinion";
import { crearOpinion } from "@/server/services/opinion.service";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "Debes iniciar sesión para dejar una opinión." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = crearOpinionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const resultado = await crearOpinion(
    parsed.data.productoId,
    Number(session.user.id),
    parsed.data.calificacion,
    parsed.data.comentario
  );

  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo enviar tu opinión." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

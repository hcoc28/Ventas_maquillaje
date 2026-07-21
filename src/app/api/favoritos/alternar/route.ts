import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { alternarFavorito } from "@/server/services/favorito.service";

const alternarSchema = z.object({ productoId: z.number().int().positive() });

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "Debes iniciar sesión para guardar favoritos." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = alternarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: "Datos inválidos." }, { status: 400 });
  }

  const esFavorito = await alternarFavorito(Number(session.user.id), parsed.data.productoId);
  return NextResponse.json({ esFavorito });
}

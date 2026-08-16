import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

export function respuestaErrorAdmin(error: unknown, mensajeFallback: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json({ mensaje: "Ya existe un registro con esos datos." }, { status: 400 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ mensaje: "El registro ya no existe o fue eliminado." }, { status: 404 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ mensaje: "No se puede completar la acción porque hay datos relacionados." }, { status: 400 });
    }
  }

  const mensaje = error instanceof Error ? error.message : mensajeFallback;
  return NextResponse.json({ mensaje }, { status: 400 });
}

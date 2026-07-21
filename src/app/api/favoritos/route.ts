import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getIdsFavoritos } from "@/services/favorito.service";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ mensaje: "No autenticado." }, { status: 401 });
  }

  const ids = await getIdsFavoritos(Number(session.user.id));
  return NextResponse.json({ ids });
}

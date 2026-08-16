import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type RolAdmin = "Administrador" | "Empleado";

export async function requerirAdmin(rolesPermitidos: RolAdmin[] = ["Administrador", "Empleado"]) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ mensaje: "No autenticado." }, { status: 401 }) };
  }
  if (!rolesPermitidos.includes(session.user.role as RolAdmin)) {
    return { error: NextResponse.json({ mensaje: "No autorizado." }, { status: 403 }) };
  }
  return { session };
}

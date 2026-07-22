import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { usuarioAdminSchema } from "@/validators/admin";
import { actualizarRolYEstado } from "@/server/services/usuario.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = usuarioAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const session = await auth();

  // Cambiar el rol de un usuario (incluido otorgar el rol de Administrador) es una acción de
  // más privilegio que el resto del panel — el middleware solo exige "Administrador o Empleado"
  // para entrar a /admin, así que sin este chequeo cualquier Empleado podría ascender a otra
  // cuenta (o una nueva registrada por él mismo) a Administrador.
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede modificar roles de usuario." }, { status: 403 });
  }

  if (session?.user?.id && Number(session.user.id) === Number(id)) {
    return NextResponse.json({ mensaje: "No puedes modificar tu propia cuenta desde aquí." }, { status: 400 });
  }

  const usuario = await actualizarRolYEstado(Number(id), parsed.data);

  await registrarAuditoria({
    entidad: "Usuario",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(usuario);
}

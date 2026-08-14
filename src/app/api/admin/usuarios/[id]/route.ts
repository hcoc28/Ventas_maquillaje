import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { estadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoUsuario } from "@/server/services/usuario.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const session = await auth();

  // El rol se asigna solo al crear la cuenta y nunca se puede reasignar después — evita que
  // cualquier cuenta (incluida una registrada por sí misma) termine escalando privilegios.
  // Activar/desactivar cuentas sigue restringido a Administrador.
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede modificar usuarios." }, { status: 403 });
  }

  if (session?.user?.id && Number(session.user.id) === Number(id)) {
    return NextResponse.json({ mensaje: "No puedes modificar tu propia cuenta desde aquí." }, { status: 400 });
  }

  const usuario = await actualizarEstadoUsuario(Number(id), parsed.data.activo);

  await registrarAuditoria({
    entidad: "Usuario",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(usuario);
}

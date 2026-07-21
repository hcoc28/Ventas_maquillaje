import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { usuarioAdminSchema } from "@/validators/admin";
import { actualizarRolYEstado } from "@/services/usuario.service";
import { registrarAuditoria } from "@/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = usuarioAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const session = await auth();
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

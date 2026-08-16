import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { estadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoUsuario } from "@/server/services/usuario.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin(["Administrador"]);
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = estadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  if (Number(acceso.session.user.id) === Number(id)) {
    return NextResponse.json({ mensaje: "No puedes modificar tu propia cuenta desde aquí." }, { status: 400 });
  }

  const usuario = await actualizarEstadoUsuario(Number(id), parsed.data.activo);

  await registrarAuditoria({
    entidad: "Usuario",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json(usuario);
}

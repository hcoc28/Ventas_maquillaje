import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { pedidoEstadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoPedido } from "@/server/services/pedido.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = pedidoEstadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: "Estado inválido." }, { status: 400 });
  }

  let pedido;
  try {
    pedido = await actualizarEstadoPedido(Number(id), parsed.data.estado);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo actualizar el pedido.");
  }

  await registrarAuditoria({
    entidad: "Pedido",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  return NextResponse.json(pedido);
}

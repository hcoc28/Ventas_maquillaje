import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pedidoEstadoAdminSchema } from "@/validators/admin";
import { actualizarEstadoPedido } from "@/server/services/pedido.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = pedidoEstadoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: "Estado inválido." }, { status: 400 });
  }

  const pedido = await actualizarEstadoPedido(Number(id), parsed.data.estado);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Pedido",
    entidadId: Number(id),
    accion: "actualizar",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(pedido);
}

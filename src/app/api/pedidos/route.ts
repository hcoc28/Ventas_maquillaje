import { NextRequest, NextResponse } from "next/server";
import { crearPedidoSchema } from "@/validators/pedido";
import { crearPedido } from "@/services/pedido.service";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = crearPedidoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;

  const resultado = await crearPedido(parsed.data, userId);
  if (!resultado.exitoso) {
    return NextResponse.json({ mensaje: resultado.errores?.[0] ?? "No se pudo crear el pedido." }, { status: 400 });
  }

  return NextResponse.json({
    numeroPedido: resultado.valor!.numeroPedido,
    enlaceWhatsApp: resultado.valor!.enlaceWhatsApp,
  });
}

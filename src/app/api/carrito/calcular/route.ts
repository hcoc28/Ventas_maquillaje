import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calcularCarrito } from "@/server/services/carrito.service";
import { carritoItemInputSchema } from "@/validators/pedido";

const bodySchema = z.object({
  items: z.array(carritoItemInputSchema),
  codigoCupon: z.string().trim().max(30).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ mensaje: "Datos de carrito inválidos." }, { status: 400 });
  }

  const carrito = await calcularCarrito(parsed.data.items, parsed.data.codigoCupon || undefined);
  return NextResponse.json(carrito);
}

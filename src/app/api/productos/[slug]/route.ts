import { NextRequest, NextResponse } from "next/server";
import { getDetalleProducto } from "@/server/services/producto.service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const producto = await getDetalleProducto(slug);

  if (!producto) {
    return NextResponse.json({ mensaje: "Producto no encontrado." }, { status: 404 });
  }

  return NextResponse.json(producto);
}

import { NextRequest, NextResponse } from "next/server";
import { buscarProductos } from "@/server/services/producto.service";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
  if (!q) return NextResponse.json({ items: [] });

  const resultado = await buscarProductos({ busqueda: q, pagina: 1, tamanoPagina: 6, orden: "relevancia" });
  return NextResponse.json({
    items: resultado.items.map((p) => ({
      slug: p.slug,
      nombre: p.nombre,
      imagenUrl: p.imagenPrincipalUrl,
      precio: p.precioFinal,
    })),
  });
}

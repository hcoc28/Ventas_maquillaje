import { NextRequest, NextResponse } from "next/server";
import { buscarProductos } from "@/services/producto.service";
import type { FiltroProducto, OrdenCatalogo } from "@/types/catalogo";

const ORDENES_VALIDOS: OrdenCatalogo[] = [
  "relevancia",
  "precio-asc",
  "precio-desc",
  "nombre",
  "mas-vendidos",
  "recientes",
  "descuento",
];

function numeroValido(valor: string | null): number | undefined {
  if (!valor) return undefined;
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const pagina = numeroValido(params.get("pagina"));

  const filtro: FiltroProducto = {
    busqueda: params.get("q")?.slice(0, 100) ?? undefined,
    categorias: params.getAll("categoria").filter(Boolean).slice(0, 20),
    marcas: params.getAll("marca").filter(Boolean).slice(0, 20),
    precioMin: numeroValido(params.get("precioMin")),
    precioMax: numeroValido(params.get("precioMax")),
    soloConDescuento: params.get("oferta") === "true",
    soloConStock: params.get("stock") === "true",
    orden: (ORDENES_VALIDOS as string[]).includes(params.get("orden") ?? "")
      ? (params.get("orden") as OrdenCatalogo)
      : "relevancia",
    pagina: pagina && pagina > 0 ? Math.floor(pagina) : 1,
    tamanoPagina: 12,
  };

  const resultado = await buscarProductos(filtro);
  return NextResponse.json(resultado);
}

import * as productoRepo from "@/repositories/producto.repository";
import { precioFinal } from "@/services/producto.service";
import type { Carrito, CarritoItem, CarritoItemInput } from "@/types/carrito";

const CANTIDAD_MAXIMA = 20;

export async function calcularCarrito(items: CarritoItemInput[]): Promise<Carrito> {
  if (items.length === 0) {
    return { items: [], subtotal: 0, total: 0, cantidadTotalItems: 0 };
  }

  const ids = [...new Set(items.map((i) => i.productoId))];
  const productos = await productoRepo.getProductosPorIds(ids);
  const productosPorId = new Map(productos.map((p) => [p.id, p]));

  const resultado: CarritoItem[] = [];

  for (const item of items) {
    const producto = productosPorId.get(item.productoId);
    if (!producto || !producto.activo) continue;

    const stockDisponible = producto.inventory?.stock ?? 0;
    const cantidadSolicitada = Math.max(item.cantidad, 1);
    const cantidadFinal = Math.min(cantidadSolicitada, stockDisponible, CANTIDAD_MAXIMA);

    if (cantidadFinal <= 0) continue;

    const imagen = [...producto.images].sort((a, b) => {
      if (a.esPrincipal !== b.esPrincipal) return a.esPrincipal ? -1 : 1;
      return a.orden - b.orden;
    })[0];

    resultado.push({
      productoId: producto.id,
      nombre: producto.nombre,
      slug: producto.slug,
      imagenUrl: imagen?.url ?? "",
      precioUnitario: precioFinal(producto),
      cantidad: cantidadFinal,
      stockDisponible,
      cantidadAjustada: cantidadFinal !== cantidadSolicitada,
      subtotal: 0,
    });
  }

  resultado.forEach((item) => {
    item.subtotal = Math.round(item.precioUnitario * item.cantidad * 100) / 100;
  });

  const subtotal = Math.round(resultado.reduce((acc, i) => acc + i.subtotal, 0) * 100) / 100;

  return {
    items: resultado,
    subtotal,
    total: subtotal,
    cantidadTotalItems: resultado.reduce((acc, i) => acc + i.cantidad, 0),
  };
}

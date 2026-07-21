import * as favoritoRepo from "@/server/repositories/favorito.repository";
import * as productoRepo from "@/server/repositories/producto.repository";
import * as opinionRepo from "@/server/repositories/opinion.repository";
import type { ProductoResumen } from "@/types/catalogo";

export async function getFavoritos(userId: number): Promise<ProductoResumen[]> {
  const productos = await favoritoRepo.getProductosFavoritos(userId);
  const idsMasVendidos = await productoRepo.getIdsMasVendidos(10);
  const estadisticas = await opinionRepo.getEstadisticasPorProductos(productos.map((p) => p.id));

  return productos.map((p) => {
    const stats = estadisticas.get(p.id) ?? { promedio: 0, total: 0 };
    const vigente = p.promotion?.activo && p.promotion.fechaInicio <= new Date() && p.promotion.fechaFin >= new Date();
    const precio = Number(p.precio);
    const precioFinalCalc = vigente
      ? Math.round(precio * (1 - Number(p.promotion!.porcentajeDescuento) / 100) * 100) / 100
      : precio;

    return {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      descripcionCorta: p.descripcionCorta,
      imagenPrincipalUrl: p.images.find((i) => i.esPrincipal)?.url ?? p.images[0]?.url ?? "",
      precio,
      precioFinal: precioFinalCalc,
      porcentajeDescuento: vigente ? Number(p.promotion!.porcentajeDescuento) : null,
      categoriaNombre: p.category.nombre,
      categoriaSlug: p.category.slug,
      marcaNombre: p.brand.nombre,
      marcaSlug: p.brand.slug,
      hayStock: (p.inventory?.stock ?? 0) > 0,
      esNuevo: p.esNuevo,
      esEdicionLimitada: p.esEdicionLimitada,
      esOferta: !!vigente,
      esMasVendido: idsMasVendidos.has(p.id),
      calificacionPromedio: stats.promedio,
      totalOpiniones: stats.total,
    };
  });
}

export async function alternarFavorito(userId: number, productId: number): Promise<boolean> {
  const existe = await favoritoRepo.existeFavorito(userId, productId);
  if (existe) {
    await favoritoRepo.quitarFavorito(userId, productId);
    return false;
  }
  await favoritoRepo.agregarFavorito(userId, productId);
  return true;
}

export async function getIdsFavoritos(userId: number): Promise<number[]> {
  return favoritoRepo.getIdsFavoritos(userId);
}

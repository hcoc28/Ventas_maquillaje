import * as productoRepo from "@/server/repositories/producto.repository";
import * as opinionRepo from "@/server/repositories/opinion.repository";
import type { ProductoConRelaciones } from "@/server/repositories/producto.repository";
import type { FiltroProducto, PagedResult, ProductoDetalle, ProductoResumen } from "@/types/catalogo";
import type { ProductoAdminInput } from "@/validators/admin";

function promocionVigente(producto: ProductoConRelaciones): boolean {
  if (!producto.promotion || !producto.promotion.activo) return false;
  const ahora = Date.now();
  return producto.promotion.fechaInicio.getTime() <= ahora && producto.promotion.fechaFin.getTime() >= ahora;
}

function precioFinal(producto: ProductoConRelaciones): number {
  const precio = Number(producto.precio);
  if (!promocionVigente(producto)) return precio;
  const descuento = Number(producto.promotion!.porcentajeDescuento);
  return Math.round(precio * (1 - descuento / 100) * 100) / 100;
}

function imagenPrincipal(producto: ProductoConRelaciones): string {
  const ordenadas = [...producto.images].sort((a, b) => {
    if (a.esPrincipal !== b.esPrincipal) return a.esPrincipal ? -1 : 1;
    return a.orden - b.orden;
  });
  return ordenadas[0]?.url ?? "";
}

function mapearResumen(
  producto: ProductoConRelaciones,
  idsMasVendidos: Set<number>,
  estadisticas: Map<number, { promedio: number; total: number }>
): ProductoResumen {
  const stats = estadisticas.get(producto.id) ?? { promedio: 0, total: 0 };
  const vigente = promocionVigente(producto);

  return {
    id: producto.id,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcionCorta: producto.descripcionCorta,
    imagenPrincipalUrl: imagenPrincipal(producto),
    precio: Number(producto.precio),
    precioFinal: precioFinal(producto),
    porcentajeDescuento: vigente ? Number(producto.promotion!.porcentajeDescuento) : null,
    categoriaNombre: producto.category.nombre,
    categoriaSlug: producto.category.slug,
    marcaNombre: producto.brand.nombre,
    marcaSlug: producto.brand.slug,
    hayStock: (producto.inventory?.stock ?? 0) > 0,
    esNuevo: producto.esNuevo,
    esEdicionLimitada: producto.esEdicionLimitada,
    esOferta: vigente,
    esMasVendido: idsMasVendidos.has(producto.id),
    calificacionPromedio: stats.promedio,
    totalOpiniones: stats.total,
  };
}

async function mapearLista(productos: ProductoConRelaciones[]): Promise<ProductoResumen[]> {
  const idsMasVendidos = await productoRepo.getIdsMasVendidos(10);
  const estadisticas = await opinionRepo.getEstadisticasPorProductos(productos.map((p) => p.id));
  return productos.map((p) => mapearResumen(p, idsMasVendidos, estadisticas));
}

export async function buscarProductos(filtro: FiltroProducto): Promise<PagedResult<ProductoResumen>> {
  const { items, total, pagina, tamanoPagina } = await productoRepo.buscarProductos(filtro);
  const idsMasVendidos = await productoRepo.getIdsMasVendidos(10);
  const estadisticas = await opinionRepo.getEstadisticasPorProductos(items.map((p) => p.id));

  return {
    items: items.map((p) => mapearResumen(p, idsMasVendidos, estadisticas)),
    pagina,
    tamanoPagina,
    totalRegistros: total,
    totalPaginas: tamanoPagina === 0 ? 0 : Math.ceil(total / tamanoPagina),
  };
}

export async function getDetalleProducto(slug: string): Promise<ProductoDetalle | null> {
  const producto = await productoRepo.getProductoBySlug(slug);
  if (!producto) return null;

  const relacionados = await productoRepo.getRelacionados(producto.id, producto.categoryId, 4);
  const idsMasVendidos = await productoRepo.getIdsMasVendidos(10);
  const idsParaStats = [...relacionados.map((r) => r.id), producto.id];
  const estadisticas = await opinionRepo.getEstadisticasPorProductos(idsParaStats);
  const opinionesAprobadas = await opinionRepo.getOpinionesAprobadasPorProducto(producto.id);

  const stats = estadisticas.get(producto.id) ?? { promedio: 0, total: 0 };
  const resumen = mapearResumen(producto, idsMasVendidos, estadisticas);

  return {
    ...resumen,
    descripcionLarga: producto.descripcionLarga,
    ingredientes: producto.ingredientes,
    modoUso: producto.modoUso,
    beneficios: producto.beneficios,
    stock: producto.inventory?.stock ?? 0,
    calificacionPromedio: stats.promedio,
    totalOpiniones: stats.total,
    imagenes: producto.images
      .slice()
      .sort((a, b) => a.orden - b.orden)
      .map((img) => ({ url: img.url, textoAlt: img.textoAlt, esPrincipal: img.esPrincipal })),
    opiniones: opinionesAprobadas.map((o) => ({
      nombreCliente: `${o.user.nombre} ${o.user.apellido.charAt(0)}.`,
      calificacion: o.calificacion,
      comentario: o.comentario,
      fechaCreacion: o.createdAt.toISOString(),
    })),
    relacionados: await mapearLista(relacionados),
  };
}

export async function getDestacados(cantidad = 8) {
  return mapearLista(await productoRepo.getDestacados(cantidad));
}

export async function getNuevos(cantidad = 8) {
  return mapearLista(await productoRepo.getNuevos(cantidad));
}

export async function getMasVendidos(cantidad = 8) {
  return mapearLista(await productoRepo.getMasVendidos(cantidad));
}

export async function getEnPromocion(cantidad = 4) {
  return mapearLista(await productoRepo.getEnPromocion(cantidad));
}

export async function getSlugsActivos() {
  return productoRepo.getSlugsActivos();
}

export async function getSlugsYFechasActivos() {
  return productoRepo.getSlugsYFechasActivos();
}

export async function getTodosLosProductosAdmin(filtro: {
  pagina: number;
  tamanoPagina: number;
  busqueda?: string;
  soloActivos?: boolean;
}): Promise<PagedResult<ProductoConRelaciones>> {
  const { pagina, tamanoPagina } = filtro;
  const { items, total } = await productoRepo.getTodosLosProductosAdmin(filtro);

  return {
    items,
    pagina,
    tamanoPagina,
    totalRegistros: total,
    totalPaginas: Math.max(Math.ceil(total / tamanoPagina), 1),
  };
}

export async function getProductoPorIdAdmin(id: number) {
  return productoRepo.getProductoById(id);
}

export async function crearProductoAdmin(data: ProductoAdminInput) {
  return productoRepo.crearProductoAdmin(data);
}

export async function actualizarProductoAdmin(id: number, data: ProductoAdminInput) {
  return productoRepo.actualizarProductoAdmin(id, data);
}

export async function eliminarProductoAdmin(id: number) {
  return productoRepo.eliminarProductoAdmin(id);
}

export { precioFinal, promocionVigente };

import { prisma } from "@/lib/prisma";
import type { FiltroProducto } from "@/types/catalogo";
import type { ProductoAdminInput } from "@/validators/admin";
import { Prisma } from "@/generated/prisma/client";

const includeCompleto = {
  category: true,
  brand: true,
  promotion: true,
  inventory: true,
  images: { orderBy: { orden: "asc" as const } },
};

/**
 * SQL Server compara `contains` con la collation por defecto de la columna, que normalmente
 * es sensible a acentos (ej. "serum" no encuentra "Sérum"). Para una búsqueda accent-insensitive
 * resolvemos primero los IDs vía SQL crudo con COLLATE y filtramos por esos IDs en la consulta
 * principal de Prisma (que sigue manejando categoría/marca/precio/orden/paginación normalmente).
 */
async function buscarIdsPorTermino(termino: string): Promise<number[]> {
  const filas = await prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
    SELECT DISTINCT p.id
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE p.activo = 1
      AND (p.brand_id IS NULL OR b.activo = 1)
      AND (
        p.nombre COLLATE Latin1_General_CI_AI LIKE '%' + ${termino} + '%'
        OR p.descripcion_corta COLLATE Latin1_General_CI_AI LIKE '%' + ${termino} + '%'
        OR b.nombre COLLATE Latin1_General_CI_AI LIKE '%' + ${termino} + '%'
      )
  `);
  return filas.map((f) => f.id);
}

const productoVisibleWhere: Prisma.ProductWhereInput = {
  activo: true,
  OR: [{ categoryId: null }, { category: { activo: true } }],
  AND: [{ OR: [{ brandId: null }, { brand: { activo: true } }] }],
};

export async function buscarProductos(filtro: FiltroProducto) {
  const ahora = new Date();
  const where: Prisma.ProductWhereInput = { ...productoVisibleWhere };

  if (filtro.busqueda?.trim()) {
    const ids = await buscarIdsPorTermino(filtro.busqueda.trim());
    if (ids.length === 0) {
      return { items: [], total: 0, pagina: Math.max(filtro.pagina ?? 1, 1), tamanoPagina: Math.min(Math.max(filtro.tamanoPagina ?? 12, 1), 60) };
    }
    where.id = { in: ids };
  }

  if (filtro.categorias?.length) {
    where.category = { activo: true, slug: { in: filtro.categorias } };
  }

  if (filtro.marcas?.length) {
    where.brand = { activo: true, slug: { in: filtro.marcas } };
  }

  if (filtro.precioMin !== undefined || filtro.precioMax !== undefined) {
    where.precio = {};
    if (filtro.precioMin !== undefined) where.precio.gte = filtro.precioMin;
    if (filtro.precioMax !== undefined) where.precio.lte = filtro.precioMax;
  }

  if (filtro.soloConStock) {
    where.inventory = { stock: { gt: 0 } };
  }

  if (filtro.soloConDescuento) {
    where.promotionId = { not: null };
    where.promotion = { activo: true, fechaInicio: { lte: ahora }, fechaFin: { gte: ahora } };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] = (() => {
    switch (filtro.orden) {
      case "precio-asc":
        return [{ precio: "asc" }];
      case "precio-desc":
        return [{ precio: "desc" }];
      case "nombre":
        return [{ nombre: "asc" }];
      case "recientes":
        return [{ createdAt: "desc" }];
      case "mas-vendidos":
        return [{ orderDetails: { _count: "desc" } }];
      case "descuento":
        return [{ promotion: { porcentajeDescuento: "desc" } }];
      default:
        return [{ esNuevo: "desc" }, { createdAt: "desc" }];
    }
  })();

  const pagina = Math.max(filtro.pagina ?? 1, 1);
  const tamanoPagina = Math.min(Math.max(filtro.tamanoPagina ?? 12, 1), 60);

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      include: includeCompleto,
      skip: (pagina - 1) * tamanoPagina,
      take: tamanoPagina,
    }),
  ]);

  return { items, total, pagina, tamanoPagina };
}

export async function getSlugsActivos(): Promise<string[]> {
  const productos = await prisma.product.findMany({
    where: productoVisibleWhere,
    select: { slug: true },
  });
  return productos.map((p) => p.slug);
}

/** Solo lo esencial para el sitemap — evita traer todas las relaciones (categoría, marca, imágenes, etc). */
export async function getSlugsYFechasActivos(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.product.findMany({
    where: productoVisibleWhere,
    select: { slug: true, updatedAt: true },
  });
}

export async function getProductoBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { ...productoVisibleWhere, slug },
    include: includeCompleto,
  });
}

export async function getProductosPorIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { ...productoVisibleWhere, id: { in: ids } },
    include: includeCompleto,
  });
}

export async function getDestacados(cantidad: number) {
  return prisma.product.findMany({
    where: productoVisibleWhere,
    include: includeCompleto,
    orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
    take: cantidad,
  });
}

export async function getNuevos(cantidad: number) {
  return prisma.product.findMany({
    where: { ...productoVisibleWhere, esNuevo: true },
    include: includeCompleto,
    orderBy: { createdAt: "desc" },
    take: cantidad,
  });
}

export async function getMasVendidos(cantidad: number) {
  return prisma.product.findMany({
    where: { ...productoVisibleWhere, orderDetails: { some: {} } },
    include: includeCompleto,
    orderBy: { orderDetails: { _count: "desc" } },
    take: cantidad,
  });
}

export async function getEnPromocion(cantidad: number) {
  const ahora = new Date();
  return prisma.product.findMany({
    where: {
      ...productoVisibleWhere,
      promotionId: { not: null },
      promotion: { activo: true, fechaInicio: { lte: ahora }, fechaFin: { gte: ahora } },
    },
    include: includeCompleto,
    orderBy: { promotion: { porcentajeDescuento: "desc" } },
    take: cantidad,
  });
}

export async function getRelacionados(productoId: number, categoryId: number | null, cantidad: number) {
  return prisma.product.findMany({
    where: { ...productoVisibleWhere, id: { not: productoId }, ...(categoryId ? { categoryId } : {}) },
    include: includeCompleto,
    orderBy: { createdAt: "desc" },
    take: cantidad,
  });
}

export async function getIdsMasVendidos(cantidad: number): Promise<Set<number>> {
  const productos = await prisma.product.findMany({
    where: { ...productoVisibleWhere, orderDetails: { some: {} } },
    orderBy: { orderDetails: { _count: "desc" } },
    take: cantidad,
    select: { id: true },
  });
  return new Set(productos.map((p) => p.id));
}

export async function getProductoById(id: number) {
  return prisma.product.findUnique({ where: { id }, include: includeCompleto });
}

export type ProductoConRelaciones = Prisma.ProductGetPayload<{ include: typeof includeCompleto }>;

export interface FiltroProductosAdmin {
  pagina: number;
  tamanoPagina: number;
  busqueda?: string;
  soloActivos?: boolean;
}

export async function getTodosLosProductosAdmin(filtro: FiltroProductosAdmin) {
  const { pagina, tamanoPagina, busqueda, soloActivos } = filtro;

  const where: Prisma.ProductWhereInput = {
    ...(soloActivos ? { activo: true } : {}),
    ...(busqueda
      ? {
          OR: [
            { nombre: { contains: busqueda } },
            { brand: { nombre: { contains: busqueda } } },
            { category: { nombre: { contains: busqueda } } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: includeCompleto,
      orderBy: { updatedAt: "desc" },
      skip: (pagina - 1) * tamanoPagina,
      take: tamanoPagina,
    }),
  ]);

  return { items, total };
}

function datosProducto(data: ProductoAdminInput) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcionCorta: data.descripcionCorta,
    descripcionLarga: data.descripcionLarga,
    ingredientes: data.ingredientes || null,
    modoUso: data.modoUso || null,
    beneficios: data.beneficios || null,
    precio: data.precio,
    esNuevo: data.esNuevo,
    esEdicionLimitada: data.esEdicionLimitada,
    activo: data.activo,
    categoryId: data.categoryId || null,
    brandId: data.brandId || null,
    promotionId: data.promotionId || null,
  };
}

export async function crearProductoAdmin(data: ProductoAdminInput) {
  return prisma.$transaction(async (tx) => {
    const producto = await tx.product.create({
      data: {
        ...datosProducto(data),
        images: {
          create: data.imagenes.map((img, i) => ({
            url: img.url,
            textoAlt: img.textoAlt,
            esPrincipal: img.esPrincipal,
            orden: i,
          })),
        },
        inventory: { create: { stock: data.stock, stockMinimo: data.stockMinimo } },
      },
    });
    return producto;
  });
}

export async function actualizarProductoAdmin(id: number, data: ProductoAdminInput) {
  return prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: datosProducto(data) });
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productImage.createMany({
      data: data.imagenes.map((img, i) => ({
        productId: id,
        url: img.url,
        textoAlt: img.textoAlt,
        esPrincipal: img.esPrincipal,
        orden: i,
      })),
    });
    await tx.inventory.upsert({
      where: { productId: id },
      update: { stock: data.stock, stockMinimo: data.stockMinimo },
      create: { productId: id, stock: data.stock, stockMinimo: data.stockMinimo },
    });
    return tx.product.findUniqueOrThrow({ where: { id }, include: includeCompleto });
  });
}

export async function eliminarProductoAdmin(id: number) {
  return prisma.product.update({ where: { id }, data: { activo: false, deletedAt: new Date() } });
}

export async function activarProductoAdmin(id: number) {
  return prisma.product.update({ where: { id }, data: { activo: true, deletedAt: null } });
}

export async function eliminarProductoPermanente(id: number) {
  return prisma.$transaction(async (tx) => {
    const detalles = await tx.orderDetail.count({ where: { productId: id } });
    if (detalles > 0) {
      throw new Error("No se puede eliminar permanentemente un producto con pedidos registrados. Desactívalo para ocultarlo del catálogo.");
    }

    await tx.cartItem.deleteMany({ where: { productId: id } });
    await tx.favorite.deleteMany({ where: { productId: id } });
    await tx.review.deleteMany({ where: { productId: id } });
    return tx.product.delete({ where: { id } });
  });
}

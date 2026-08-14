import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface ProductoBajoStock {
  productId: number;
  stock: number;
  stockMinimo: number;
  nombre: string;
  slug: string;
}

interface VentaPorDia {
  fecha: Date;
  total: number;
}

interface VentaPorCategoria {
  categoria: string;
  total: number;
}

interface VentaPorMetodoPago {
  metodoPago: string;
  total: number;
}

interface ProductoTop {
  productId: number;
  nombre: string;
  slug: string;
  unidadesVendidas: number;
  ingresos: number;
}

export async function getVentasPorDia(fechaInicio: Date): Promise<VentaPorDia[]> {
  return prisma.$queryRaw<VentaPorDia[]>(Prisma.sql`
    SELECT CAST(created_at AS DATE) AS fecha, SUM(total) AS total
    FROM orders
    WHERE estado != 'Cancelado' AND created_at >= ${fechaInicio}
    GROUP BY CAST(created_at AS DATE)
    ORDER BY fecha ASC
  `);
}

export async function getVentasPorCategoria(fechaInicio: Date): Promise<VentaPorCategoria[]> {
  return prisma.$queryRaw<VentaPorCategoria[]>(Prisma.sql`
    SELECT c.nombre AS categoria, SUM(od.precio_unitario * od.cantidad) AS total
    FROM order_details od
    INNER JOIN products p ON p.id = od.product_id
    INNER JOIN categories c ON c.id = p.category_id
    INNER JOIN orders o ON o.id = od.order_id
    WHERE o.estado != 'Cancelado' AND o.created_at >= ${fechaInicio}
    GROUP BY c.nombre
    ORDER BY total DESC
  `);
}

export async function getVentasPorMetodoPago(fechaInicio: Date): Promise<VentaPorMetodoPago[]> {
  return prisma.$queryRaw<VentaPorMetodoPago[]>(Prisma.sql`
    SELECT metodo_pago AS metodoPago, SUM(total) AS total
    FROM orders
    WHERE estado != 'Cancelado' AND created_at >= ${fechaInicio}
    GROUP BY metodo_pago
    ORDER BY total DESC
  `);
}

export async function getTopProductos(fechaInicio: Date, limite: number): Promise<ProductoTop[]> {
  return prisma.$queryRaw<ProductoTop[]>(Prisma.sql`
    SELECT TOP (${limite}) p.id AS productId, p.nombre, p.slug,
      SUM(od.cantidad) AS unidadesVendidas,
      SUM(od.precio_unitario * od.cantidad) AS ingresos
    FROM order_details od
    INNER JOIN products p ON p.id = od.product_id
    INNER JOIN orders o ON o.id = od.order_id
    WHERE o.estado != 'Cancelado' AND o.created_at >= ${fechaInicio}
    GROUP BY p.id, p.nombre, p.slug
    ORDER BY ingresos DESC
  `);
}

export async function getReportesVentas(fechaInicio: Date) {
  const [ventasPorDia, ventasPorCategoria, ventasPorMetodoPago, topProductos] = await Promise.all([
    getVentasPorDia(fechaInicio),
    getVentasPorCategoria(fechaInicio),
    getVentasPorMetodoPago(fechaInicio),
    getTopProductos(fechaInicio, 5),
  ]);

  return { ventasPorDia, ventasPorCategoria, ventasPorMetodoPago, topProductos };
}

export async function getEstadisticasDashboard() {
  const [
    totalProductos,
    totalUsuarios,
    totalPedidos,
    pedidosPendientes,
    ingresos,
    pedidosRecientes,
    productosBajoStock,
    cuponesUsados,
    ultimosMensajesContacto,
  ] = await Promise.all([
    prisma.product.count({ where: { activo: true } }),
    prisma.user.count({ where: { activo: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { estado: "Pendiente" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { estado: { not: "Cancelado" } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nombre: true, apellido: true } } },
    }),
    prisma.$queryRaw<ProductoBajoStock[]>(Prisma.sql`
      SELECT TOP 8 i.product_id AS productId, i.stock, i.stock_minimo AS stockMinimo, p.nombre, p.slug
      FROM inventory i
      INNER JOIN products p ON p.id = i.product_id
      WHERE i.stock <= i.stock_minimo AND p.activo = 1
      ORDER BY i.stock ASC
    `),
    prisma.coupon.findMany({
      where: { vecesUsado: { gt: 0 } },
      orderBy: { vecesUsado: "desc" },
      take: 5,
      select: { id: true, codigo: true, vecesUsado: true, usoMaximo: true },
    }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, nombre: true, asunto: true, leido: true, createdAt: true },
    }),
  ]);

  return {
    totalProductos,
    totalUsuarios,
    totalPedidos,
    pedidosPendientes,
    ingresosTotales: Number(ingresos._sum.total ?? 0),
    pedidosRecientes,
    productosBajoStock,
    cuponesUsados,
    ultimosMensajesContacto,
  };
}

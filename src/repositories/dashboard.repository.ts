import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface ProductoBajoStock {
  productId: number;
  stock: number;
  stockMinimo: number;
  nombre: string;
  slug: string;
}

export async function getEstadisticasDashboard() {
  const [totalProductos, totalUsuarios, totalPedidos, ingresos, pedidosRecientes, productosBajoStock] =
    await Promise.all([
      prisma.product.count({ where: { activo: true } }),
      prisma.user.count({ where: { activo: true } }),
      prisma.order.count(),
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
    ]);

  return {
    totalProductos,
    totalUsuarios,
    totalPedidos,
    ingresosTotales: Number(ingresos._sum.total ?? 0),
    pedidosRecientes,
    productosBajoStock,
  };
}

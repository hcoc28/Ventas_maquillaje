import { prisma } from "@/lib/prisma";

export async function getOpinionesAprobadasPorProducto(productId: number) {
  return prisma.review.findMany({
    where: { productId, aprobada: true },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEstadisticasPorProductos(
  productIds: number[]
): Promise<Map<number, { promedio: number; total: number }>> {
  if (productIds.length === 0) return new Map();

  const agrupado = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, aprobada: true },
    _avg: { calificacion: true },
    _count: { _all: true },
  });

  const mapa = new Map<number, { promedio: number; total: number }>();
  for (const grupo of agrupado) {
    mapa.set(grupo.productId, { promedio: grupo._avg.calificacion ?? 0, total: grupo._count._all });
  }
  return mapa;
}

export async function crearOpinion(productId: number, userId: number, calificacion: number, comentario: string) {
  return prisma.review.create({
    data: { productId, userId, calificacion, comentario, aprobada: false },
  });
}

export async function getTodasLasOpinionesAdmin() {
  return prisma.review.findMany({
    include: {
      product: { select: { nombre: true, slug: true } },
      user: { select: { nombre: true, apellido: true } },
    },
    orderBy: [{ aprobada: "asc" }, { createdAt: "desc" }],
  });
}

export async function aprobarOpinion(id: number) {
  return prisma.review.update({ where: { id }, data: { aprobada: true } });
}

export async function eliminarOpinion(id: number) {
  return prisma.review.delete({ where: { id } });
}

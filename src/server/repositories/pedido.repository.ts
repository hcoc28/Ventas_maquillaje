import { prisma } from "@/lib/prisma";

export async function generarNumeroPedido(): Promise<string> {
  const anio = new Date().getFullYear();
  const inicioAnio = new Date(anio, 0, 1);
  const finAnio = new Date(anio + 1, 0, 1);
  const total = await prisma.order.count({
    where: { createdAt: { gte: inicioAnio, lt: finAnio } },
  });
  return `ORD-${anio}-${1001 + total}`;
}

export async function getPedidosPorUsuario(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { details: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPedidoPorNumero(numeroPedido: string) {
  return prisma.order.findUnique({ where: { numeroPedido } });
}

export interface FiltroPedidosAdmin {
  pagina: number;
  tamanoPagina: number;
  estado?: string;
}

export async function getTodosLosPedidos(filtro: FiltroPedidosAdmin) {
  const { pagina, tamanoPagina, estado } = filtro;
  const where = estado ? { estado } : undefined;

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { details: true, user: { select: { nombre: true, apellido: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * tamanoPagina,
      take: tamanoPagina,
    }),
  ]);

  return { items, total };
}

export async function actualizarEstadoPedido(id: number, estado: string) {
  return prisma.order.update({ where: { id }, data: { estado } });
}

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function generarNumeroPedido(): Promise<string> {
  const anio = new Date().getFullYear();
  const inicioAnio = new Date(anio, 0, 1);
  const finAnio = new Date(anio + 1, 0, 1);
  const total = await prisma.order.count({
    where: { createdAt: { gte: inicioAnio, lt: finAnio } },
  });
  return `ORD-${anio}-${1001 + total}`;
}

export async function crearPedido(data: Prisma.OrderCreateInput) {
  return prisma.order.create({ data, include: { details: true } });
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

export async function getTodosLosPedidos() {
  return prisma.order.findMany({
    include: { details: true, user: { select: { nombre: true, apellido: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function actualizarEstadoPedido(id: number, estado: string) {
  return prisma.order.update({ where: { id }, data: { estado } });
}

export async function decrementarStock(productId: number, cantidad: number) {
  await prisma.inventory.updateMany({
    where: { productId },
    data: { stock: { decrement: cantidad } },
  });
  await prisma.inventory.updateMany({
    where: { productId, stock: { lt: 0 } },
    data: { stock: 0 },
  });
}

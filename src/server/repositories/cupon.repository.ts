import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export async function getCuponPorCodigo(codigo: string) {
  return prisma.coupon.findUnique({ where: { codigo } });
}

export async function getCuponPorId(id: number) {
  return prisma.coupon.findUnique({ where: { id } });
}

export async function getTodosLosCupones() {
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function crearCupon(data: Prisma.CouponCreateInput) {
  return prisma.coupon.create({ data });
}

export async function actualizarCupon(id: number, data: Prisma.CouponUpdateInput) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function desactivarCupon(id: number) {
  return prisma.coupon.update({ where: { id }, data: { activo: false } });
}

import { prisma } from "@/lib/prisma";
import type { PromocionAdminInput } from "@/validators/admin";

export async function getPromocionesActivas() {
  const ahora = new Date();
  return prisma.promotion.findMany({
    where: { activo: true, fechaInicio: { lte: ahora }, fechaFin: { gte: ahora } },
  });
}

export async function getTodasLasPromociones(soloActivas?: boolean) {
  return prisma.promotion.findMany({
    where: soloActivas ? { activo: true } : undefined,
    orderBy: { fechaInicio: "desc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getPromocionPorId(id: number) {
  return prisma.promotion.findUnique({ where: { id } });
}

function datosPromocion(data: PromocionAdminInput) {
  return {
    nombre: data.nombre,
    descripcion: data.descripcion || null,
    porcentajeDescuento: data.porcentajeDescuento,
    fechaInicio: new Date(data.fechaInicio),
    fechaFin: new Date(data.fechaFin),
    activo: data.activo,
  };
}

export async function crearPromocion(data: PromocionAdminInput) {
  return prisma.promotion.create({ data: datosPromocion(data) });
}

export async function actualizarPromocion(id: number, data: PromocionAdminInput) {
  return prisma.promotion.update({ where: { id }, data: datosPromocion(data) });
}

export async function eliminarPromocion(id: number) {
  await prisma.product.updateMany({ where: { promotionId: id }, data: { promotionId: null } });
  return prisma.promotion.update({ where: { id }, data: { activo: false, deletedAt: new Date() } });
}

export async function activarPromocion(id: number) {
  return prisma.promotion.update({ where: { id }, data: { activo: true, deletedAt: null } });
}

export async function eliminarPromocionPermanente(id: number) {
  return prisma.$transaction(async (tx) => {
    await tx.product.updateMany({ where: { promotionId: id }, data: { promotionId: null } });
    return tx.promotion.delete({ where: { id } });
  });
}

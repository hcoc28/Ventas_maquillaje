import * as promocionRepo from "@/server/repositories/promocion.repository";
import type { PromocionAdminInput } from "@/validators/admin";

export async function getTodasLasPromocionesAdmin(soloActivas?: boolean) {
  const promociones = await promocionRepo.getTodasLasPromociones(soloActivas);
  // Decimal de Prisma no se puede pasar de un Server Component a la tabla "use client".
  return promociones.map((p) => ({ ...p, porcentajeDescuento: Number(p.porcentajeDescuento) }));
}

export async function getPromocionPorId(id: number) {
  return promocionRepo.getPromocionPorId(id);
}

export async function crearPromocion(data: PromocionAdminInput) {
  return promocionRepo.crearPromocion(data);
}

export async function actualizarPromocion(id: number, data: PromocionAdminInput) {
  return promocionRepo.actualizarPromocion(id, data);
}

export async function eliminarPromocion(id: number) {
  return promocionRepo.eliminarPromocion(id);
}

export async function activarPromocion(id: number) {
  return promocionRepo.activarPromocion(id);
}

export async function eliminarPromocionPermanente(id: number) {
  return promocionRepo.eliminarPromocionPermanente(id);
}

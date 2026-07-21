import * as promocionRepo from "@/repositories/promocion.repository";
import type { PromocionAdminInput } from "@/validators/admin";

export async function getTodasLasPromocionesAdmin() {
  return promocionRepo.getTodasLasPromociones();
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

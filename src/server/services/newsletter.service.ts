import * as newsletterRepo from "@/server/repositories/newsletter.repository";
import type { Resultado } from "@/types/carrito";

export async function suscribir(email: string): Promise<Resultado<boolean>> {
  await newsletterRepo.suscribir(email.trim().toLowerCase());
  return { exitoso: true, valor: true };
}

export async function getTodosLosSuscriptoresAdmin() {
  return newsletterRepo.getTodosLosSuscriptoresAdmin();
}

export async function actualizarEstadoSuscriptorAdmin(id: number, activo: boolean) {
  return newsletterRepo.actualizarEstadoSuscriptor(id, activo);
}

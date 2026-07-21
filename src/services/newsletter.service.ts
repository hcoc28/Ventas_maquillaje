import * as newsletterRepo from "@/repositories/newsletter.repository";
import type { Resultado } from "@/types/carrito";

export async function suscribir(email: string): Promise<Resultado<boolean>> {
  await newsletterRepo.suscribir(email.trim().toLowerCase());
  return { exitoso: true, valor: true };
}

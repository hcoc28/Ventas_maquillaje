import * as contactoRepo from "@/server/repositories/contacto.repository";
import type { Resultado } from "@/types/carrito";

export async function enviarMensaje(
  nombre: string,
  email: string,
  asunto: string,
  mensaje: string
): Promise<Resultado<boolean>> {
  await contactoRepo.guardarMensajeContacto({
    nombre: nombre.trim(),
    email: email.trim(),
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
  });
  return { exitoso: true, valor: true };
}

export async function getTodosLosMensajesAdmin() {
  return contactoRepo.getTodosLosMensajesAdmin();
}

export async function marcarMensajeLeidoAdmin(id: number) {
  return contactoRepo.marcarLeido(id);
}

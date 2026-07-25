import * as opinionRepo from "@/server/repositories/opinion.repository";
import * as productoRepo from "@/server/repositories/producto.repository";
import type { Resultado } from "@/types/carrito";

export async function crearOpinion(
  productoId: number,
  userId: number,
  calificacion: number,
  comentario: string
): Promise<Resultado<boolean>> {
  if (calificacion < 1 || calificacion > 5) {
    return { exitoso: false, errores: ["La calificación debe estar entre 1 y 5."] };
  }
  if (!comentario.trim()) {
    return { exitoso: false, errores: ["El comentario no puede estar vacío."] };
  }

  const producto = await productoRepo.getProductoById(productoId);
  if (!producto) {
    return { exitoso: false, errores: ["El producto no existe."] };
  }

  await opinionRepo.crearOpinion(productoId, userId, calificacion, comentario.trim());
  return { exitoso: true, valor: true };
}

export async function listarOpinionesAdmin() {
  return opinionRepo.getTodasLasOpinionesAdmin();
}

export async function aprobarOpinionAdmin(id: number) {
  return opinionRepo.aprobarOpinion(id);
}

export async function eliminarOpinionAdmin(id: number) {
  return opinionRepo.eliminarOpinion(id);
}

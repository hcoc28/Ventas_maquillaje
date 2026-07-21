import * as opinionRepo from "@/repositories/opinion.repository";
import * as productoRepo from "@/repositories/producto.repository";
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

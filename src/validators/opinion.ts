import { z } from "zod";

export const crearOpinionSchema = z.object({
  productoId: z.number().int().positive(),
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().min(3, "El comentario es muy corto.").max(1000),
});

export type CrearOpinionInput = z.infer<typeof crearOpinionSchema>;

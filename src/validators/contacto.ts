import { z } from "zod";

export const contactoSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(150),
  email: z.string().email("Ingresa un correo electrónico válido."),
  asunto: z.string().trim().min(3, "El asunto es obligatorio.").max(200),
  mensaje: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres.").max(2000),
});

export type ContactoInput = z.infer<typeof contactoSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido."),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const opinionSchema = z.object({
  productoId: z.number().int().positive(),
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().min(5, "El comentario es obligatorio.").max(1000),
});

export type OpinionInput = z.infer<typeof opinionSchema>;

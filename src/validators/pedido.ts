import { z } from "zod";

export const carritoItemInputSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().min(1).max(20),
});

export const crearPedidoSchema = z.object({
  nombreContacto: z.string().trim().min(3, "El nombre es obligatorio.").max(150),
  telefonoContacto: z.string().trim().min(8, "Ingresa un teléfono válido.").max(30),
  direccionEntrega: z.string().trim().min(5, "La dirección es obligatoria.").max(400),
  observaciones: z.string().trim().max(1000).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  items: z.array(carritoItemInputSchema).min(1, "El carrito está vacío."),
});

export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;

/** Usado en el formulario de checkout: los items provienen del carrito, no de un campo del formulario. */
export const datosContactoSchema = crearPedidoSchema.omit({ items: true });
export type DatosContactoInput = z.infer<typeof datosContactoSchema>;

export const itemRequestSchema = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().min(1).max(20).default(1),
});

export const eliminarItemSchema = z.object({
  productoId: z.number().int().positive(),
});

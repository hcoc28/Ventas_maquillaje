import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(100),
    apellido: z.string().trim().min(2, "El apellido es obligatorio.").max(100),
    email: z.string().email("Ingresa un correo electrónico válido."),
    telefono: z.string().trim().min(8, "Ingresa un teléfono válido.").max(30),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula.")
      .regex(/[0-9]/, "Debe incluir al menos un número.")
      .regex(/[^A-Za-z0-9]/, "Debe incluir al menos un símbolo."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegistroInput = z.infer<typeof registroSchema>;

export const perfilSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  apellido: z.string().trim().min(2).max(100),
  telefono: z.string().trim().min(8).max(30),
  direccion: z.string().trim().max(300).optional().or(z.literal("")),
});

export type PerfilInput = z.infer<typeof perfilSchema>;

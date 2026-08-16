import { z } from "zod";

export const categoriaAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
  imagenUrl: z.string().trim().url("Ingresa una URL válida.").max(500).optional().or(z.literal("")),
  icono: z.string().trim().max(60).optional().or(z.literal("")),
  orden: z.number().int().min(0),
  activo: z.boolean(),
});

export type CategoriaAdminInput = z.infer<typeof categoriaAdminSchema>;

export const marcaAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  descripcion: z.string().trim().max(500).optional().or(z.literal("")),
  logoUrl: z.string().trim().url("Ingresa una URL válida.").max(500).optional().or(z.literal("")),
  activo: z.boolean(),
});

export type MarcaAdminInput = z.infer<typeof marcaAdminSchema>;

export const promocionAdminSchema = z
  .object({
    nombre: z.string().trim().min(2).max(120),
    descripcion: z.string().trim().max(500).optional().or(z.literal("")),
    porcentajeDescuento: z.number().min(1).max(90),
    fechaInicio: z.string().min(1, "Selecciona una fecha de inicio."),
    fechaFin: z.string().min(1, "Selecciona una fecha de fin."),
    activo: z.boolean(),
  })
  .refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["fechaFin"],
  });

export type PromocionAdminInput = z.infer<typeof promocionAdminSchema>;

export const cuponAdminSchema = z
  .object({
    codigo: z
      .string()
      .trim()
      .min(3, "Mínimo 3 caracteres.")
      .max(30)
      .regex(/^[A-Za-z0-9-]+$/, "Solo letras, números y guiones."),
    porcentajeDescuento: z.number().min(1).max(90),
    fechaInicio: z.string().min(1, "Selecciona una fecha de inicio."),
    fechaFin: z.string().min(1, "Selecciona una fecha de fin."),
    usoMaximo: z.number().int().positive().nullable().optional(),
    activo: z.boolean(),
  })
  .refine((data) => new Date(data.fechaFin) > new Date(data.fechaInicio), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio.",
    path: ["fechaFin"],
  });

export type CuponAdminInput = z.infer<typeof cuponAdminSchema>;

export const bannerAdminSchema = z.object({
  titulo: z.string().trim().min(2).max(150),
  subtitulo: z.string().trim().max(300).optional().or(z.literal("")),
  imagenUrl: z.string().trim().url("Ingresa una URL válida.").max(500),
  textoBotonPrimario: z.string().trim().max(60).optional().or(z.literal("")),
  urlBotonPrimario: z.string().trim().max(300).optional().or(z.literal("")),
  orden: z.number().int().min(0),
  activo: z.boolean(),
});

export type BannerAdminInput = z.infer<typeof bannerAdminSchema>;

export const productoImagenAdminSchema = z.object({
  url: z.string().trim().url("Ingresa una URL válida.").max(500),
  textoAlt: z.string().trim().min(1, "Ingresa un texto alternativo.").max(200),
  esPrincipal: z.boolean(),
});

export const productoAdminSchema = z.object({
  nombre: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  descripcionCorta: z.string().trim().min(2).max(300),
  descripcionLarga: z.string().trim().min(2),
  ingredientes: z.string().trim().optional().or(z.literal("")),
  modoUso: z.string().trim().optional().or(z.literal("")),
  beneficios: z.string().trim().optional().or(z.literal("")),
  precio: z.number().positive().max(999999),
  esNuevo: z.boolean(),
  esEdicionLimitada: z.boolean(),
  activo: z.boolean(),
  categoryId: z.number().int().positive().nullable().optional(),
  brandId: z.number().int().positive().nullable().optional(),
  promotionId: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0),
  stockMinimo: z.number().int().min(0),
  imagenes: z.array(productoImagenAdminSchema).min(1, "Agrega al menos una imagen."),
});

export type ProductoAdminInput = z.infer<typeof productoAdminSchema>;

export const ESTADOS_PEDIDO = ["Pendiente", "Confirmado", "Enviado", "Entregado", "Cancelado"] as const;

export const pedidoEstadoAdminSchema = z.object({
  estado: z.enum(ESTADOS_PEDIDO),
});

export const estadoAdminSchema = z.object({
  activo: z.boolean(),
});

export type EstadoAdminInput = z.infer<typeof estadoAdminSchema>;

export const estadoLecturaContactoSchema = z.object({
  leido: z.boolean(),
});

export const configuracionAdminSchema = z.object({
  mostrarFiltroMarcas: z.boolean(),
  nombreEmpresa: z.string().trim().min(2).max(120),
  descripcionEmpresa: z.string().trim().min(10).max(500),
  whatsappNumero: z.string().trim().min(8).max(30).regex(/^[0-9+\s()-]+$/, "Ingresa un número válido."),
  emailNotificaciones: z.string().trim().email("Ingresa un correo válido.").max(200).optional().or(z.literal("")),
  direccionEmpresa: z.string().trim().max(300).optional().or(z.literal("")),
});

export type ConfiguracionAdminInput = z.infer<typeof configuracionAdminSchema>;

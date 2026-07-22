import { describe, expect, it } from "vitest";
import { cuponAdminSchema, productoAdminSchema } from "./admin";

describe("cuponAdminSchema", () => {
  const base = {
    codigo: "BIENVENIDA10",
    porcentajeDescuento: 10,
    fechaInicio: "2026-01-01T00:00",
    fechaFin: "2026-12-31T23:59",
    activo: true,
  };

  it("acepta un cupón válido", () => {
    expect(cuponAdminSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza cuando la fecha de fin es anterior a la de inicio", () => {
    const resultado = cuponAdminSchema.safeParse({ ...base, fechaInicio: "2026-12-31T00:00", fechaFin: "2026-01-01T00:00" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza porcentaje de descuento mayor a 90", () => {
    expect(cuponAdminSchema.safeParse({ ...base, porcentajeDescuento: 95 }).success).toBe(false);
  });

  it("rechaza porcentaje de descuento de 0 o negativo", () => {
    expect(cuponAdminSchema.safeParse({ ...base, porcentajeDescuento: 0 }).success).toBe(false);
  });

  it("rechaza códigos con espacios o símbolos no permitidos", () => {
    expect(cuponAdminSchema.safeParse({ ...base, codigo: "BIENVENIDA 10" }).success).toBe(false);
    expect(cuponAdminSchema.safeParse({ ...base, codigo: "10%OFF" }).success).toBe(false);
  });

  it("acepta usoMaximo nulo (sin límite)", () => {
    expect(cuponAdminSchema.safeParse({ ...base, usoMaximo: null }).success).toBe(true);
  });

  it("rechaza usoMaximo negativo", () => {
    expect(cuponAdminSchema.safeParse({ ...base, usoMaximo: -5 }).success).toBe(false);
  });
});

describe("productoAdminSchema", () => {
  const base = {
    nombre: "Labial Velvet Rouge",
    slug: "labial-velvet-rouge",
    descripcionCorta: "Labial mate de larga duración.",
    descripcionLarga: "Un labial mate de alta pigmentación con acabado aterciopelado.",
    precio: 125.5,
    esNuevo: false,
    esEdicionLimitada: false,
    activo: true,
    categoryId: 1,
    brandId: 1,
    stock: 10,
    stockMinimo: 5,
    imagenes: [{ url: "https://example.com/imagen.jpg", textoAlt: "Labial", esPrincipal: true }],
  };

  it("acepta un producto válido", () => {
    expect(productoAdminSchema.safeParse(base).success).toBe(true);
  });

  it("rechaza slug con mayúsculas o espacios", () => {
    expect(productoAdminSchema.safeParse({ ...base, slug: "Labial Velvet Rouge" }).success).toBe(false);
  });

  it("rechaza precio negativo o cero", () => {
    expect(productoAdminSchema.safeParse({ ...base, precio: 0 }).success).toBe(false);
    expect(productoAdminSchema.safeParse({ ...base, precio: -10 }).success).toBe(false);
  });

  it("rechaza cuando no hay ninguna imagen", () => {
    expect(productoAdminSchema.safeParse({ ...base, imagenes: [] }).success).toBe(false);
  });

  it("rechaza imagen con URL inválida", () => {
    const resultado = productoAdminSchema.safeParse({
      ...base,
      imagenes: [{ url: "no-es-una-url", textoAlt: "Labial", esPrincipal: true }],
    });
    expect(resultado.success).toBe(false);
  });
});

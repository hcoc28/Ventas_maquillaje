import { describe, expect, it } from "vitest";
import { carritoItemInputSchema, crearPedidoSchema } from "./pedido";

describe("carritoItemInputSchema", () => {
  it("acepta un item válido", () => {
    const resultado = carritoItemInputSchema.safeParse({ productoId: 1, cantidad: 2 });
    expect(resultado.success).toBe(true);
  });

  it("rechaza cantidad mayor al máximo permitido (20)", () => {
    const resultado = carritoItemInputSchema.safeParse({ productoId: 1, cantidad: 21 });
    expect(resultado.success).toBe(false);
  });

  it("rechaza cantidad de 0 o negativa", () => {
    expect(carritoItemInputSchema.safeParse({ productoId: 1, cantidad: 0 }).success).toBe(false);
    expect(carritoItemInputSchema.safeParse({ productoId: 1, cantidad: -1 }).success).toBe(false);
  });

  it("rechaza productoId no entero o negativo", () => {
    expect(carritoItemInputSchema.safeParse({ productoId: 1.5, cantidad: 1 }).success).toBe(false);
    expect(carritoItemInputSchema.safeParse({ productoId: -1, cantidad: 1 }).success).toBe(false);
  });
});

describe("crearPedidoSchema", () => {
  const base = {
    nombreContacto: "María González",
    telefonoContacto: "50255511122",
    direccionEntrega: "Zona 10, Ciudad de Guatemala",
    metodoPago: "Efectivo contra entrega",
    items: [{ productoId: 1, cantidad: 2 }],
  };

  it("acepta un pedido válido sin correo ni cupón", () => {
    expect(crearPedidoSchema.safeParse(base).success).toBe(true);
  });

  it("acepta un pedido con código de cupón", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, codigoCupon: "BIENVENIDA10" });
    expect(resultado.success).toBe(true);
  });

  it("rechaza si el carrito está vacío", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, items: [] });
    expect(resultado.success).toBe(false);
  });

  it("rechaza nombre de contacto muy corto", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, nombreContacto: "Al" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza correo con formato inválido cuando se proporciona", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, email: "no-es-correo" });
    expect(resultado.success).toBe(false);
  });

  it("acepta 'Transferencia' como método de pago", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, metodoPago: "Transferencia" });
    expect(resultado.success).toBe(true);
  });

  it("rechaza un método de pago no permitido", () => {
    const resultado = crearPedidoSchema.safeParse({ ...base, metodoPago: "Tarjeta de crédito" });
    expect(resultado.success).toBe(false);
  });
});

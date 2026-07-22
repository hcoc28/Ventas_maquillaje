import { describe, expect, it } from "vitest";
import {
  cambiarPasswordSchema,
  loginSchema,
  perfilSchema,
  recuperarPasswordSchema,
  registroSchema,
  restablecerPasswordSchema,
} from "./auth";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    const resultado = loginSchema.safeParse({ email: "cliente@example.com", password: "cualquiera" });
    expect(resultado.success).toBe(true);
  });

  it("rechaza un correo inválido", () => {
    const resultado = loginSchema.safeParse({ email: "no-es-un-correo", password: "123" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza contraseña vacía", () => {
    const resultado = loginSchema.safeParse({ email: "cliente@example.com", password: "" });
    expect(resultado.success).toBe(false);
  });
});

describe("registroSchema", () => {
  const base = {
    nombre: "María",
    apellido: "González",
    email: "maria@example.com",
    telefono: "50255511122",
  };

  it("acepta una contraseña que cumple todos los requisitos", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "Segura1!", confirmPassword: "Segura1!" });
    expect(resultado.success).toBe(true);
  });

  it("rechaza contraseña sin mayúscula", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "segura1!", confirmPassword: "segura1!" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza contraseña sin número", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "Segurísima!", confirmPassword: "Segurísima!" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza contraseña sin símbolo", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "Segura123", confirmPassword: "Segura123" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza contraseña de menos de 8 caracteres", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "Se1!", confirmPassword: "Se1!" });
    expect(resultado.success).toBe(false);
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    const resultado = registroSchema.safeParse({ ...base, password: "Segura1!", confirmPassword: "Otra1!" });
    expect(resultado.success).toBe(false);
  });
});

describe("perfilSchema", () => {
  it("acepta dirección vacía (opcional)", () => {
    const resultado = perfilSchema.safeParse({ nombre: "Ana", apellido: "Martínez", telefono: "50255522233", direccion: "" });
    expect(resultado.success).toBe(true);
  });

  it("rechaza nombre de un solo carácter", () => {
    const resultado = perfilSchema.safeParse({ nombre: "A", apellido: "Martínez", telefono: "50255522233" });
    expect(resultado.success).toBe(false);
  });
});

describe("recuperarPasswordSchema", () => {
  it("rechaza un correo con formato inválido", () => {
    const resultado = recuperarPasswordSchema.safeParse({ email: "no-valido" });
    expect(resultado.success).toBe(false);
  });
});

describe("restablecerPasswordSchema", () => {
  it("exige que las contraseñas coincidan", () => {
    const resultado = restablecerPasswordSchema.safeParse({
      token: "abc123",
      password: "NuevaSegura1!",
      confirmPassword: "Distinta1!",
    });
    expect(resultado.success).toBe(false);
  });

  it("acepta cuando todo es válido", () => {
    const resultado = restablecerPasswordSchema.safeParse({
      token: "abc123",
      password: "NuevaSegura1!",
      confirmPassword: "NuevaSegura1!",
    });
    expect(resultado.success).toBe(true);
  });
});

describe("cambiarPasswordSchema", () => {
  it("exige contraseña actual no vacía", () => {
    const resultado = cambiarPasswordSchema.safeParse({
      passwordActual: "",
      passwordNueva: "NuevaSegura1!",
      confirmPassword: "NuevaSegura1!",
    });
    expect(resultado.success).toBe(false);
  });

  it("rechaza si la nueva contraseña y la confirmación no coinciden", () => {
    const resultado = cambiarPasswordSchema.safeParse({
      passwordActual: "ViejaPass1!",
      passwordNueva: "NuevaSegura1!",
      confirmPassword: "OtraCosa1!",
    });
    expect(resultado.success).toBe(false);
  });
});

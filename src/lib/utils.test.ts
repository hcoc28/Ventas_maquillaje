import { describe, expect, it } from "vitest";
import { cn, formatearMoneda, slugify } from "./utils";

describe("formatearMoneda", () => {
  it("formatea con el símbolo Q y dos decimales", () => {
    expect(formatearMoneda(150)).toBe("Q150.00");
    expect(formatearMoneda(99.9)).toBe("Q99.90");
  });

  it("usa separador de miles", () => {
    expect(formatearMoneda(1234.5)).toBe("Q1,234.50");
  });

  it("redondea correctamente valores con más de 2 decimales", () => {
    expect(formatearMoneda(10.005)).toMatch(/^Q10\.0(0|1)$/);
  });
});

describe("slugify", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Labial Velvet Rouge")).toBe("labial-velvet-rouge");
  });

  it("quita acentos", () => {
    expect(slugify("Sérum Facial Édition")).toBe("serum-facial-edition");
  });

  it("quita caracteres especiales", () => {
    expect(slugify("Gloss #1 (Edición Limitada!)")).toBe("gloss-1-edicion-limitada");
  });

  it("no deja guiones al inicio o al final", () => {
    expect(slugify("  -Producto-  ")).toBe("producto");
  });
});

describe("cn", () => {
  it("combina clases y resuelve conflictos de tailwind (la última gana)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});

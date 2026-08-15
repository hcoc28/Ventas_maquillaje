import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/producto.repository", () => ({
  buscarProductos: vi.fn(),
  getIdsMasVendidos: vi.fn(),
}));

vi.mock("@/server/repositories/opinion.repository", () => ({
  getEstadisticasPorProductos: vi.fn(),
  getOpinionesAprobadasPorProducto: vi.fn(),
}));

import * as productoRepo from "@/server/repositories/producto.repository";
import * as opinionRepo from "@/server/repositories/opinion.repository";
import type { ProductoConRelaciones } from "@/server/repositories/producto.repository";
import { buscarProductos, precioFinal, promocionVigente } from "./producto.service";

function productoMock(overrides: Partial<ProductoConRelaciones> = {}): ProductoConRelaciones {
  return {
    id: 1,
    nombre: "Labial Rojo",
    slug: "labial-rojo",
    descripcionCorta: "Un labial rojo intenso",
    descripcionLarga: "",
    ingredientes: "",
    modoUso: "",
    beneficios: "",
    precio: 100 as never,
    esNuevo: false,
    esEdicionLimitada: false,
    activo: true,
    categoryId: 1,
    brandId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    category: { id: 1, nombre: "Labiales", slug: "labiales", activo: true } as never,
    brand: { id: 1, nombre: "Marca X", slug: "marca-x", activo: true } as never,
    promotion: null,
    inventory: { id: 1, productId: 1, stock: 10, stockMinimo: 2 } as never,
    images: [{ id: 1, productId: 1, url: "img1.jpg", textoAlt: "", esPrincipal: true, orden: 0 }] as never,
    ...overrides,
  } as ProductoConRelaciones;
}

function promocionMock(overrides: Record<string, unknown> = {}) {
  return {
    activo: true,
    porcentajeDescuento: 20 as never,
    fechaInicio: new Date(Date.now() - 86_400_000),
    fechaFin: new Date(Date.now() + 86_400_000),
    ...overrides,
  };
}

describe("promocionVigente", () => {
  it("es falso cuando el producto no tiene promocion", () => {
    expect(promocionVigente(productoMock({ promotion: null }))).toBe(false);
  });

  it("es falso cuando la promocion existe pero esta inactiva", () => {
    expect(promocionVigente(productoMock({ promotion: promocionMock({ activo: false }) as never }))).toBe(false);
  });

  it("es falso cuando la promocion ya vencio o aun no empieza", () => {
    const vencida = promocionMock({ fechaInicio: new Date(Date.now() - 2 * 86_400_000), fechaFin: new Date(Date.now() - 86_400_000) });
    expect(promocionVigente(productoMock({ promotion: vencida as never }))).toBe(false);

    const futura = promocionMock({ fechaInicio: new Date(Date.now() + 86_400_000), fechaFin: new Date(Date.now() + 2 * 86_400_000) });
    expect(promocionVigente(productoMock({ promotion: futura as never }))).toBe(false);
  });

  it("es verdadero cuando la promocion esta activa y dentro del rango de fechas", () => {
    expect(promocionVigente(productoMock({ promotion: promocionMock() as never }))).toBe(true);
  });
});

describe("precioFinal", () => {
  it("devuelve el precio normal cuando no hay promocion vigente", () => {
    expect(precioFinal(productoMock({ precio: 100 as never, promotion: null }))).toBe(100);
  });

  it("aplica el descuento y redondea a 2 decimales cuando la promocion esta vigente", () => {
    const producto = productoMock({ precio: 99.99 as never, promotion: promocionMock({ porcentajeDescuento: 15 }) as never });
    expect(precioFinal(producto)).toBe(84.99);
  });

  it("no aplica descuento si la promocion vigente pero desactivada", () => {
    const producto = productoMock({ precio: 100 as never, promotion: promocionMock({ activo: false }) as never });
    expect(precioFinal(producto)).toBe(100);
  });
});

describe("buscarProductos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marca hayStock en false cuando el inventario esta en cero y calcula totalPaginas", async () => {
    const sinStock = productoMock({ id: 2, inventory: { id: 2, productId: 2, stock: 0, stockMinimo: 1 } as never });
    vi.mocked(productoRepo.buscarProductos).mockResolvedValue({ items: [sinStock], total: 21, pagina: 1, tamanoPagina: 20 });
    vi.mocked(productoRepo.getIdsMasVendidos).mockResolvedValue(new Set());
    vi.mocked(opinionRepo.getEstadisticasPorProductos).mockResolvedValue(new Map());

    const resultado = await buscarProductos({ pagina: 1, tamanoPagina: 20 } as never);

    expect(resultado.items[0].hayStock).toBe(false);
    expect(resultado.totalPaginas).toBe(2);
  });

  it("marca esMasVendido segun el set de ids mas vendidos y adjunta las estadisticas de opiniones", async () => {
    const producto = productoMock({ id: 5 });
    vi.mocked(productoRepo.buscarProductos).mockResolvedValue({ items: [producto], total: 1, pagina: 1, tamanoPagina: 20 });
    vi.mocked(productoRepo.getIdsMasVendidos).mockResolvedValue(new Set([5]));
    vi.mocked(opinionRepo.getEstadisticasPorProductos).mockResolvedValue(new Map([[5, { promedio: 4.5, total: 8 }]]));

    const resultado = await buscarProductos({ pagina: 1, tamanoPagina: 20 } as never);

    expect(resultado.items[0].esMasVendido).toBe(true);
    expect(resultado.items[0].calificacionPromedio).toBe(4.5);
    expect(resultado.items[0].totalOpiniones).toBe(8);
  });
});

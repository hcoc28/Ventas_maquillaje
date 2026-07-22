import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/repositories/producto.repository", () => ({
  getProductosPorIds: vi.fn(),
}));

vi.mock("@/server/repositories/cupon.repository", () => ({
  getCuponPorCodigo: vi.fn(),
}));

import * as productoRepo from "@/server/repositories/producto.repository";
import * as cuponRepo from "@/server/repositories/cupon.repository";
import { calcularCarrito } from "./carrito.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function productoMock(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    nombre: "Producto de prueba",
    slug: "producto-de-prueba",
    precio: 100,
    activo: true,
    promotion: null,
    inventory: { stock: 10, stockMinimo: 5 },
    images: [{ url: "https://example.com/a.jpg", textoAlt: "a", esPrincipal: true, orden: 0 }],
    ...overrides,
  };
}

function cuponMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    codigo: "DESCUENTO10",
    porcentajeDescuento: 10,
    fechaInicio: new Date(Date.now() - 86_400_000),
    fechaFin: new Date(Date.now() + 86_400_000),
    usoMaximo: null,
    vecesUsado: 0,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("calcularCarrito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna carrito vacío si no hay items", async () => {
    const carrito = await calcularCarrito([]);
    expect(carrito.items).toHaveLength(0);
    expect(carrito.total).toBe(0);
  });

  it("calcula subtotal y total sin cupón", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([productoMock({ precio: 50 })] as any);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 3 }]);

    expect(carrito.subtotal).toBe(150);
    expect(carrito.descuento).toBe(0);
    expect(carrito.total).toBe(150);
  });

  it("limita la cantidad al stock disponible y marca el item como ajustado", async () => {
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([
      productoMock({ inventory: { stock: 2, stockMinimo: 1 } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 5 }]);

    expect(carrito.items[0].cantidad).toBe(2);
    expect(carrito.items[0].cantidadAjustada).toBe(true);
  });

  it("excluye del carrito los productos inactivos", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([productoMock({ activo: false })] as any);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 1 }]);

    expect(carrito.items).toHaveLength(0);
  });

  it("excluye productos con stock agotado", async () => {
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([
      productoMock({ inventory: { stock: 0, stockMinimo: 5 } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 1 }]);

    expect(carrito.items).toHaveLength(0);
  });

  it("aplica el descuento de un cupón válido sobre el subtotal", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([productoMock({ precio: 100 })] as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(cuponMock() as any);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 1 }], "DESCUENTO10");

    expect(carrito.descuento).toBe(10);
    expect(carrito.total).toBe(90);
    expect(carrito.codigoCupon).toBe("DESCUENTO10");
  });

  it("no aplica descuento y reporta error si el cupón no existe", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([productoMock({ precio: 100 })] as any);
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(null);

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 1 }], "NOEXISTE");

    expect(carrito.descuento).toBe(0);
    expect(carrito.total).toBe(100);
    expect(carrito.cuponError).toBeDefined();
  });

  it("no aplica descuento si el cupón ya expiró", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(productoRepo.getProductosPorIds).mockResolvedValue([productoMock({ precio: 100 })] as any);
    vi.mocked(cuponRepo.getCuponPorCodigo).mockResolvedValue(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cuponMock({ fechaFin: new Date(Date.now() - 86_400_000) }) as any
    );

    const carrito = await calcularCarrito([{ productoId: 1, cantidad: 1 }], "DESCUENTO10");

    expect(carrito.descuento).toBe(0);
    expect(carrito.cuponError).toBeDefined();
  });
});

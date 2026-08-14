import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const mockTx = {
  order: { create: vi.fn() },
  inventory: { updateMany: vi.fn() },
  coupon: { findUnique: vi.fn(), updateMany: vi.fn() },
};

const transactionMock = vi.fn(async (callback: (tx: typeof mockTx) => unknown) => callback(mockTx));

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: (callback: (tx: typeof mockTx) => unknown) => transactionMock(callback) },
}));

vi.mock("@/server/repositories/pedido.repository", () => ({
  generarNumeroPedido: vi.fn(),
  getPedidosPorUsuario: vi.fn(),
  getTodosLosPedidos: vi.fn(),
  actualizarEstadoPedido: vi.fn(),
}));

vi.mock("@/server/repositories/usuario.repository", () => ({
  crearUsuario: vi.fn(),
  getUsuarioPorId: vi.fn(),
}));

vi.mock("@/server/services/carrito.service", () => ({
  calcularCarrito: vi.fn(),
}));

vi.mock("@/server/services/whatsapp.service", () => ({
  construirEnlaceWhatsApp: vi.fn(() => "https://wa.me/mock"),
  construirMensajeWhatsApp: vi.fn(() => "mensaje mock"),
}));

vi.mock("@/server/services/log.service", () => ({
  registrarActividad: vi.fn(),
}));

vi.mock("@/server/services/email.service", () => ({
  enviarEmail: vi.fn(),
  plantillaBase: vi.fn((html: string) => html),
}));

vi.mock("@/config/site", () => ({
  siteConfig: { nombreCompleto: "Amour Bloom", url: "https://amourbloom.com", emailNotificaciones: "tienda@amourbloom.com" },
}));

import * as pedidoRepo from "@/server/repositories/pedido.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { calcularCarrito } from "@/server/services/carrito.service";
import { enviarEmail } from "@/server/services/email.service";
import { crearPedido } from "./pedido.service";

function carritoMock(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ productoId: 1, nombre: "Labial Rojo", slug: "labial-rojo", imagenUrl: "", precioUnitario: 100, cantidad: 2, stockDisponible: 5, cantidadAjustada: false, subtotal: 200 }],
    subtotal: 200,
    descuento: 0,
    total: 200,
    cantidadTotalItems: 2,
    ...overrides,
  };
}

function inputMock(overrides: Record<string, unknown> = {}) {
  return {
    nombreContacto: "María González",
    telefonoContacto: "50255511122",
    metodoPago: "Efectivo contra entrega",
    items: [{ productoId: 1, cantidad: 2 }],
    ...overrides,
  };
}

function ordenCreadaMock(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    numeroPedido: "ORD-2026-1001",
    createdAt: new Date(),
    estado: "Pendiente",
    subtotal: 200,
    descuento: 0,
    cuponCodigo: null,
    total: 200,
    nombreContacto: "María González",
    telefonoContacto: "50255511122",
    metodoPago: "Efectivo contra entrega",
    observaciones: null,
    details: [],
    ...overrides,
  };
}

function errorColisionNumeroPedido() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`numero_pedido`)", {
    code: "P2002",
    clientVersion: "7.8.0",
    meta: { target: ["numero_pedido"] },
  });
}

describe("crearPedido — concurrencia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(async (callback) => callback(mockTx));
    vi.mocked(usuarioRepo.crearUsuario).mockResolvedValue({ id: 42 } as never);
    vi.mocked(pedidoRepo.generarNumeroPedido).mockResolvedValue("ORD-2026-1001");
    mockTx.inventory.updateMany.mockResolvedValue({ count: 1 });
    mockTx.coupon.updateMany.mockResolvedValue({ count: 1 });
    mockTx.coupon.findUnique.mockResolvedValue(null);
  });

  it("crea el pedido exitosamente en el camino feliz", async () => {
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock() as never);
    mockTx.order.create.mockResolvedValue(ordenCreadaMock());

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(true);
    expect(resultado.valor?.numeroPedido).toBe("ORD-2026-1001");
  });

  it("aborta el pedido y no vende de más si el stock ya no alcanza (descuento atómico)", async () => {
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock() as never);
    mockTx.order.create.mockResolvedValue(ordenCreadaMock());
    mockTx.inventory.updateMany.mockResolvedValue({ count: 0 }); // ya no alcanza el stock

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(false);
    if (!resultado.exitoso) {
      expect(resultado.errores?.[0]).toMatch(/stock/i);
    }
  });

  it("aborta el pedido si el cupón agota su límite justo antes de aplicarlo", async () => {
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock({ cuponId: 7, codigoCupon: "BIENVENIDA10" }) as never);
    mockTx.order.create.mockResolvedValue(ordenCreadaMock());
    mockTx.coupon.findUnique.mockResolvedValue({ usoMaximo: 5 });
    mockTx.coupon.updateMany.mockResolvedValue({ count: 0 }); // ya llegó al límite

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(false);
    if (!resultado.exitoso) {
      expect(resultado.errores?.[0]).toMatch(/cupón/i);
    }
    // El descuento de stock ya se había aplicado dentro de la misma transacción, pero como
    // el cupón falla, toda la transacción debe considerarse abortada (no debe registrar actividad).
    const logService = await import("@/server/services/log.service");
    expect(logService.registrarActividad).not.toHaveBeenCalled();
  });

  it("reintenta con un número de pedido nuevo si hay colisión (numero_pedido duplicado)", async () => {
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock() as never);
    vi.mocked(pedidoRepo.generarNumeroPedido)
      .mockResolvedValueOnce("ORD-2026-1001")
      .mockResolvedValueOnce("ORD-2026-1002");
    mockTx.order.create.mockRejectedValueOnce(errorColisionNumeroPedido()).mockResolvedValueOnce(ordenCreadaMock({ numeroPedido: "ORD-2026-1002" }));

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(true);
    expect(resultado.valor?.numeroPedido).toBe("ORD-2026-1002");
    expect(pedidoRepo.generarNumeroPedido).toHaveBeenCalledTimes(2);
  });

  it("no reintenta indefinidamente: falla con un mensaje claro si la colisión persiste", async () => {
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock() as never);
    mockTx.order.create.mockRejectedValue(errorColisionNumeroPedido());

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(false);
    expect(pedidoRepo.generarNumeroPedido).toHaveBeenCalledTimes(5);
  });
});

describe("crearPedido — notificaciones por correo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation(async (callback) => callback(mockTx));
    vi.mocked(usuarioRepo.crearUsuario).mockResolvedValue({ id: 42 } as never);
    vi.mocked(pedidoRepo.generarNumeroPedido).mockResolvedValue("ORD-2026-1001");
    mockTx.inventory.updateMany.mockResolvedValue({ count: 1 });
    mockTx.coupon.updateMany.mockResolvedValue({ count: 1 });
    mockTx.coupon.findUnique.mockResolvedValue(null);
    vi.mocked(calcularCarrito).mockResolvedValue(carritoMock() as never);
    mockTx.order.create.mockResolvedValue(ordenCreadaMock());
  });

  it("envía la notificación interna a la tienda pero no confirmación al cliente si es invitado", async () => {
    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(true);
    expect(enviarEmail).toHaveBeenCalledTimes(1);
    expect(vi.mocked(enviarEmail).mock.calls[0][0]).toMatchObject({ to: "tienda@amourbloom.com" });
    expect(usuarioRepo.getUsuarioPorId).not.toHaveBeenCalled();
  });

  it("envía la notificación interna Y la confirmación al cliente si tiene cuenta con correo", async () => {
    vi.mocked(usuarioRepo.getUsuarioPorId).mockResolvedValue({ email: "cliente@example.com" } as never);

    const resultado = await crearPedido(inputMock() as never, 42);

    expect(resultado.exitoso).toBe(true);
    expect(enviarEmail).toHaveBeenCalledTimes(2);
    const destinatarios = vi.mocked(enviarEmail).mock.calls.map((call) => call[0].to);
    expect(destinatarios).toContain("tienda@amourbloom.com");
    expect(destinatarios).toContain("cliente@example.com");
  });

  it("no falla el pedido si el envío de correo lanza un error", async () => {
    vi.mocked(enviarEmail).mockRejectedValue(new Error("Resend no disponible"));

    const resultado = await crearPedido(inputMock() as never, null);

    expect(resultado.exitoso).toBe(true);
  });
});

import { describe, expect, it, vi } from "vitest";

vi.mock("@/config/site", () => ({
  siteConfig: {
    nombreCompleto: "Amour Bloom",
    whatsappNumero: "+502 5551-1122",
    whatsappSaludo: "Hola, deseo realizar el siguiente pedido.",
  },
}));

import { construirEnlaceNotificacionEstado, construirEnlaceWhatsApp, construirMensajeWhatsApp } from "./whatsapp.service";
import type { PedidoResumen } from "@/types/carrito";

function pedidoMock(overrides: Partial<PedidoResumen> = {}): PedidoResumen {
  return {
    id: 1,
    numeroPedido: "ORD-2026-1001",
    fechaPedido: new Date().toISOString(),
    estado: "Pendiente",
    subtotal: 200,
    descuento: 0,
    cuponCodigo: null,
    total: 200,
    nombreContacto: "María González",
    telefonoContacto: "50255511122",
    metodoPago: "Efectivo contra entrega",
    observaciones: null,
    detalles: [{ nombreProducto: "Labial Rojo", cantidad: 2, precioUnitario: 100, subtotal: 200 }],
    ...overrides,
  };
}

describe("construirMensajeWhatsApp", () => {
  it("incluye el saludo, el numero de pedido y el detalle de productos", () => {
    const mensaje = construirMensajeWhatsApp(pedidoMock());
    expect(mensaje).toContain("Hola, deseo realizar el siguiente pedido.");
    expect(mensaje).toContain("*Pedido:* ORD-2026-1001");
    expect(mensaje).toContain("Labial Rojo x2");
    expect(mensaje).toContain("*Total:* Q200.00");
  });

  it("omite la linea de descuento cuando no hay descuento", () => {
    const mensaje = construirMensajeWhatsApp(pedidoMock({ descuento: 0 }));
    expect(mensaje).not.toContain("*Descuento");
  });

  it("incluye el codigo de cupon en la linea de descuento cuando aplica", () => {
    const mensaje = construirMensajeWhatsApp(pedidoMock({ descuento: 20, cuponCodigo: "BIENVENIDA10", total: 180 }));
    expect(mensaje).toContain("*Descuento (BIENVENIDA10):* -Q20.00");
  });

  it("omite las observaciones cuando no existen y las incluye cuando si", () => {
    expect(construirMensajeWhatsApp(pedidoMock({ observaciones: null }))).not.toContain("*Observaciones:*");
    expect(construirMensajeWhatsApp(pedidoMock({ observaciones: "Entregar por la tarde" }))).toContain(
      "*Observaciones:* Entregar por la tarde"
    );
  });
});

describe("construirEnlaceWhatsApp", () => {
  it("limpia el numero configurado a solo digitos y codifica el mensaje", () => {
    const enlace = construirEnlaceWhatsApp("Hola *mundo*");
    expect(enlace).toBe(`https://wa.me/50255511122?text=${encodeURIComponent("Hola *mundo*")}`);
  });
});

describe("construirEnlaceNotificacionEstado", () => {
  const base = { nombreContacto: "María González", telefonoContacto: "55511122", numeroPedido: "ORD-2026-1001" };

  it("antepone el codigo de pais 502 cuando el numero tiene 8 digitos", () => {
    const enlace = construirEnlaceNotificacionEstado({ ...base, estado: "Confirmado" });
    expect(enlace.startsWith("https://wa.me/50255511122?")).toBe(true);
  });

  it("no antepone el codigo de pais cuando el numero ya lo incluye", () => {
    const enlace = construirEnlaceNotificacionEstado({ ...base, telefonoContacto: "50255511122", estado: "Confirmado" });
    expect(enlace.startsWith("https://wa.me/50255511122?")).toBe(true);
  });

  it("usa un mensaje distinto segun el estado, incluyendo el cierre especial de Cancelado", () => {
    const confirmado = decodeURIComponent(construirEnlaceNotificacionEstado({ ...base, estado: "Confirmado" }));
    expect(confirmado).toContain("confirmamos tu pedido y ya lo estamos preparando");
    expect(confirmado).toContain("Gracias por tu compra.");

    const cancelado = decodeURIComponent(construirEnlaceNotificacionEstado({ ...base, estado: "Cancelado" }));
    expect(cancelado).toContain("tu pedido fue cancelado");
    expect(cancelado).toContain("Cualquier duda, contáctanos.");
  });

  it("usa un mensaje generico para un estado desconocido", () => {
    const enlace = decodeURIComponent(construirEnlaceNotificacionEstado({ ...base, estado: "EnRevision" }));
    expect(enlace).toContain('tu pedido cambió de estado a "EnRevision"');
  });
});

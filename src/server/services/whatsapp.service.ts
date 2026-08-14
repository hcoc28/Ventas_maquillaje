import { siteConfig } from "@/config/site";
import type { PedidoResumen } from "@/types/carrito";
import { formatearMoneda } from "@/lib/utils";

export function construirMensajeWhatsApp(pedido: PedidoResumen): string {
  const lineas: string[] = [];
  lineas.push(siteConfig.whatsappSaludo);
  lineas.push("");
  lineas.push(`*Pedido:* ${pedido.numeroPedido}`);
  lineas.push("*Productos:*");
  for (const detalle of pedido.detalles) {
    lineas.push(`• ${detalle.nombreProducto} x${detalle.cantidad} — ${formatearMoneda(detalle.subtotal)}`);
  }
  lineas.push("");
  lineas.push(`*Subtotal:* ${formatearMoneda(pedido.subtotal)}`);
  if (pedido.descuento > 0) {
    lineas.push(`*Descuento${pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ""}:* -${formatearMoneda(pedido.descuento)}`);
  }
  lineas.push(`*Total:* ${formatearMoneda(pedido.total)}`);
  lineas.push("");
  lineas.push(`*Nombre:* ${pedido.nombreContacto}`);
  lineas.push(`*Teléfono:* ${pedido.telefonoContacto}`);
  lineas.push(`*Método de pago:* ${pedido.metodoPago}`);
  if (pedido.observaciones) {
    lineas.push(`*Observaciones:* ${pedido.observaciones}`);
  }
  lineas.push("");
  lineas.push("Muchas gracias.");

  return lineas.join("\n");
}

export function construirEnlaceWhatsApp(mensaje: string): string {
  const telefono = siteConfig.whatsappNumero.replace(/\D/g, "");
  return `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
}

const MENSAJES_ESTADO: Record<string, string> = {
  Confirmado: "confirmamos tu pedido y ya lo estamos preparando",
  Enviado: "tu pedido ya está en camino",
  Entregado: "tu pedido fue entregado",
  Cancelado: "tu pedido fue cancelado",
};

const CIERRES_ESTADO: Record<string, string> = {
  Cancelado: "Cualquier duda, contáctanos.",
};

const CIERRE_POR_DEFECTO = "Gracias por tu compra.";

/** Enlace para que el admin notifique manualmente al CLIENTE (no al negocio) sobre un cambio de estado. */
export function construirEnlaceNotificacionEstado(pedido: {
  nombreContacto: string;
  telefonoContacto: string;
  numeroPedido: string;
  estado: string;
}): string {
  let digitos = pedido.telefonoContacto.replace(/\D/g, "");
  // Números guatemaltecos suelen ingresarse sin el código de país (8 dígitos).
  if (digitos.length === 8) digitos = `502${digitos}`;

  const detalleEstado = MENSAJES_ESTADO[pedido.estado] ?? `tu pedido cambió de estado a "${pedido.estado}"`;
  const cierre = CIERRES_ESTADO[pedido.estado] ?? CIERRE_POR_DEFECTO;
  const mensaje = [
    `Hola ${pedido.nombreContacto}, te escribimos de ${siteConfig.nombreCompleto}.`,
    `Pedido *${pedido.numeroPedido}*: ${detalleEstado}.`,
    cierre,
  ].join("\n");

  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}

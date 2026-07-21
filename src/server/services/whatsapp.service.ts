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
  lineas.push(`*Total:* ${formatearMoneda(pedido.total)}`);
  lineas.push("");
  lineas.push(`*Nombre:* ${pedido.nombreContacto}`);
  lineas.push(`*Teléfono:* ${pedido.telefonoContacto}`);
  lineas.push(`*Dirección:* ${pedido.direccionEntrega}`);
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

import { siteConfig } from "@/config/site";
import { getPedidoPorNumero } from "@/server/repositories/pedido.repository";

const GRAPH_API_VERSION = "v21.0";

const TRADUCCION_ESTADO: Record<string, string> = {
  Pendiente: "Pendiente de confirmación",
  Confirmado: "Confirmado",
  Enviado: "Enviado",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function contieneAlguna(texto: string, palabras: string[]): boolean {
  return palabras.some((p) => texto.includes(p));
}

async function respuestaEstadoPedido(mensajeOriginal: string, telefonoRemitente: string): Promise<string | null> {
  const match = mensajeOriginal.match(/ORD-\d{4}-\d+/i);
  if (!match) return null;

  const numeroPedido = match[0].toUpperCase();
  const pedido = await getPedidoPorNumero(numeroPedido);

  if (!pedido) {
    return `No encontramos ningún pedido con el número ${numeroPedido}. Verifica el número o escríbenos y un asesor te ayudará.`;
  }

  // Solo revelamos detalles si el teléfono que escribe coincide con el registrado en el pedido,
  // para no exponer información de otra persona a quien solo conozca el número de pedido.
  const coincideTelefono = soloDigitos(pedido.telefonoContacto).endsWith(soloDigitos(telefonoRemitente).slice(-8));
  if (!coincideTelefono) {
    return `Encontramos el pedido ${numeroPedido}, pero no coincide con el número desde el que nos escribes. Por seguridad, un asesor te va a contactar para verificar tu identidad.`;
  }

  const estado = TRADUCCION_ESTADO[pedido.estado] ?? pedido.estado;
  return `Tu pedido *${numeroPedido}* está: *${estado}*.\nTotal: Q${Number(pedido.total).toFixed(2)}.\n¿Necesitas algo más?`;
}

/**
 * Motor de reglas simple por palabra clave. Devuelve el texto de respuesta que se le
 * enviará al remitente. `telefonoRemitente` es el número de WhatsApp de quien escribió
 * (formato E.164 sin '+', tal como lo entrega la API de Meta).
 */
export async function interpretarMensaje(mensaje: string, telefonoRemitente: string): Promise<string> {
  const texto = normalizar(mensaje.trim());

  const respuestaPedido = await respuestaEstadoPedido(mensaje, telefonoRemitente);
  if (respuestaPedido) return respuestaPedido;

  if (contieneAlguna(texto, ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches"])) {
    return `¡Hola! Bienvenido/a a ${siteConfig.nombreCompleto} ✨. Puedes escribirnos "catálogo" para ver nuestros productos, "envío" para info de entregas, o el número de tu pedido (ej. ORD-2026-1001) para consultar su estado.`;
  }

  if (contieneAlguna(texto, ["horario", "horarios", "atencion"])) {
    return "Nuestro horario de atención es de lunes a sábado, de 9:00 a.m. a 6:00 p.m.";
  }

  if (contieneAlguna(texto, ["envio", "envios", "entrega", "domicilio"])) {
    return "Coordinamos cada pedido directamente por este medio: al confirmar tu compra en el sitio, te contactamos para acordar la entrega a domicilio.";
  }

  if (contieneAlguna(texto, ["catalogo", "producto", "productos", "precio", "precios"])) {
    return `Puedes ver todo nuestro catálogo aquí: ${siteConfig.url}/catalogo`;
  }

  if (contieneAlguna(texto, ["pedido", "orden", "estado"])) {
    return "Para consultar el estado de tu pedido, envíanos el número (ej. ORD-2026-1001).";
  }

  return "Gracias por escribirnos. Un asesor de Amour Bloom te atenderá en breve. Mientras tanto, puedes escribir \"catálogo\", \"envío\" u \"horario\" para respuestas inmediatas.";
}

/**
 * Envía un mensaje de texto vía la API oficial de WhatsApp Business (Meta Cloud API).
 * Requiere WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID configurados.
 */
export async function enviarMensajeWhatsApp(numeroDestino: string, texto: string): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error("Faltan WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN en las variables de entorno.");
  }

  const respuesta = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: numeroDestino,
      type: "text",
      text: { body: texto },
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Error al enviar mensaje de WhatsApp (${respuesta.status}): ${detalle}`);
  }
}

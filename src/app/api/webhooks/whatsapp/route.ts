import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { enviarMensajeWhatsApp, interpretarMensaje } from "@/server/services/whatsapp-bot.service";

/**
 * Paso de verificación que exige Meta al registrar el webhook: hace un GET con
 * hub.verify_token y espera que devolvamos hub.challenge tal cual si el token coincide.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && challenge && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Verifica la firma X-Hub-Signature-256 que Meta agrega a cada envío, calculada con el
 * App Secret. Sin WHATSAPP_APP_SECRET configurado no se valida (no recomendado en producción,
 * porque cualquiera que adivine la URL podría hacerse pasar por Meta).
 */
function firmaValida(rawBody: string, firmaHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;
  if (!firmaHeader) return false;

  const esperada = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const recibida = Buffer.from(firmaHeader);
  const calculada = Buffer.from(esperada);
  if (recibida.length !== calculada.length) return false;
  return crypto.timingSafeEqual(recibida, calculada);
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!firmaValida(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Firma inválida", { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const mensajes = payload?.entry?.[0]?.changes?.[0]?.value?.messages;

    if (Array.isArray(mensajes) && mensajes.length > 0) {
      const mensaje = mensajes[0];
      if (mensaje.type === "text" && mensaje.text?.body) {
        const respuesta = await interpretarMensaje(mensaje.text.body, mensaje.from);
        await enviarMensajeWhatsApp(mensaje.from, respuesta);
      }
    }
  } catch (error) {
    console.error("Error procesando webhook de WhatsApp:", error);
  }

  // Meta espera 200 rápido para no reintentar el mismo evento.
  return NextResponse.json({ recibido: true });
}

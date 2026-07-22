import { Resend } from "resend";
import { siteConfig } from "@/config/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "Amour Bloom <onboarding@resend.dev>";

interface EnviarEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envío base de correo vía Resend. Sin RESEND_API_KEY configurado, no falla — solo registra en
 * consola y sigue (así el checkout/registro no se rompen en desarrollo local sin la key).
 */
export async function enviarEmail({ to, subject, html }: EnviarEmailInput): Promise<void> {
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY no configurado — se omite el envío a ${to}: "${subject}"`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("[email] Error al enviar:", error);
  }
}

/** Envoltorio HTML compartido para que todos los correos se vean consistentes con la marca. */
export function plantillaBase(contenidoHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 22px; font-weight: 600; letter-spacing: 0.02em;">${siteConfig.nombreCompleto}</span>
      </div>
      ${contenidoHtml}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #888;">
        ${siteConfig.nombreCompleto} · <a href="${siteConfig.url}" style="color: #888;">${siteConfig.url.replace(/^https?:\/\//, "")}</a>
      </div>
    </div>
  `;
}

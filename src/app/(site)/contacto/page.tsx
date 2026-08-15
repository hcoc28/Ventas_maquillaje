import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { getConfiguracion } from "@/server/services/configuracion.service";
import { ContactoForm } from "./contacto-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos o visítanos. Estamos para ayudarte a encontrar tu producto ideal.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactoPage() {
  const configuracion = await getConfiguracion();
  const numeroWhatsapp = configuracion.whatsappNumero.replace(/\D/g, "");
  const email = configuracion.emailNotificaciones || "hola@amourbloom.com";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Contacto</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">Hablemos</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted">
          ¿Tienes preguntas sobre un producto o tu pedido? Escríbenos y te responderemos lo antes posible.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
              <MessageCircle size={20} />
            </span>
            <div>
              <h2 className="font-semibold">WhatsApp</h2>
              <p className="text-sm text-text-muted">Respuesta inmediata para pedidos y consultas.</p>
              <a
                href={`https://wa.me/${numeroWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-accent-strong hover:underline"
              >
                +{numeroWhatsapp}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
              <Mail size={20} />
            </span>
            <div>
              <h2 className="font-semibold">Correo electrónico</h2>
              <p className="text-sm text-text-muted">Para consultas generales y alianzas comerciales.</p>
              <a href={`mailto:${email}`} className="mt-1 inline-block text-sm font-medium text-accent-strong hover:underline">
                {email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
              <MapPin size={20} />
            </span>
            <div>
              <h2 className="font-semibold">Showroom</h2>
              <p className="text-sm text-text-muted">
                {configuracion.direccionEmpresa || "4a Avenida 12-34, Zona 10, Ciudad de Guatemala"}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Ubicación de Amour Bloom Maquillaje en el mapa"
              src="https://www.google.com/maps?q=Zona+10,+Ciudad+de+Guatemala&output=embed"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <ContactoForm />
        </div>
      </div>
    </div>
  );
}

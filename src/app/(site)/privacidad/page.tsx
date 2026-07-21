import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo recopilamos, usamos y protegemos tu información en Èclat Maquillaje.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Legal</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-text-muted">Última actualización: julio de 2026.</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">1. Información que recopilamos</h2>
          <p>
            Recopilamos la información que nos proporcionas directamente al crear una cuenta, realizar un pedido o
            contactarnos: nombre, correo electrónico, teléfono y dirección de entrega. También registramos
            información técnica básica (como la actividad en tu cuenta) para mantener la seguridad del sitio.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">2. Uso de tu información</h2>
          <p>
            Usamos tu información para procesar y coordinar tus pedidos por WhatsApp, gestionar tu cuenta, responder
            tus consultas de contacto y, si te suscribes, enviarte novedades y promociones. Nunca vendemos tu
            información a terceros.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">3. Almacenamiento y seguridad</h2>
          <p>
            Tu contraseña se almacena de forma cifrada y nunca en texto plano. Tomamos medidas razonables para
            proteger tu información contra accesos no autorizados, incluyendo controles de acceso por rol y registro
            de auditoría en nuestro panel administrativo.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">4. Tus derechos</h2>
          <p>
            Puedes solicitar la actualización o eliminación de tu cuenta y datos personales en cualquier momento
            escribiéndonos a través de nuestro <a href="/contacto" className="text-accent-strong hover:underline">formulario de contacto</a> o
            por WhatsApp al +{siteConfig.whatsappNumero}.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">5. Cambios a esta política</h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Los cambios entrarán en vigencia al publicarse en esta
            página.
          </p>
        </section>
      </div>
    </div>
  );
}

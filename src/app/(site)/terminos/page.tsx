import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso, compra y devoluciones de Amour Bloom Maquillaje.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Legal</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">Términos y Condiciones</h1>
        <p className="mt-2 text-sm text-text-muted">Última actualización: julio de 2026.</p>
      </div>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">1. Aceptación de los términos</h2>
          <p>
            Al usar este sitio y realizar una compra, aceptas los presentes términos y condiciones. Si no estás de
            acuerdo con alguno de ellos, te pedimos no utilizar nuestros servicios.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">2. Precios y disponibilidad</h2>
          <p>
            Los precios se muestran en quetzales (Q) e incluyen los impuestos aplicables. Todos los productos están
            sujetos a disponibilidad de inventario; nos reservamos el derecho de ajustar precios o retirar productos
            del catálogo sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">3. Proceso de compra</h2>
          <p>
            El pedido se confirma mediante un mensaje de WhatsApp generado desde el sitio. La compra se considera
            finalizada una vez coordinado el pago y la entrega directamente con nuestro equipo de atención.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">4. Cambios y devoluciones</h2>
          <p>
            Aceptamos cambios y devoluciones dentro de los 7 días posteriores a la entrega, siempre que el producto
            no haya sido usado y conserve su empaque original. Los costos de envío de una devolución corren por
            cuenta del cliente, salvo error atribuible a Amour Bloom Maquillaje.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">5. Cuentas de usuario</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu
            cuenta. Notifícanos de inmediato si sospechas de un uso no autorizado.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-foreground">6. Propiedad intelectual</h2>
          <p>
            Todo el contenido de este sitio (textos, imágenes, logotipos y diseño) es propiedad de Amour Bloom Maquillaje o
            de sus respectivas marcas y no puede reproducirse sin autorización previa.
          </p>
        </section>
      </div>
    </div>
  );
}

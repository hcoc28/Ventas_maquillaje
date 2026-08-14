import { getTodosLosSuscriptoresAdmin } from "@/server/services/newsletter.service";
import { NewsletterTable } from "./newsletter-table";

export default async function AdminNewsletterPage() {
  const suscriptores = await getTodosLosSuscriptoresAdmin();
  const activos = suscriptores.filter((s) => s.activo).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Newsletter</h1>
        <p className="mt-1 text-sm text-text-muted">
          {activos} suscriptor{activos === 1 ? "" : "es"} activo{activos === 1 ? "" : "s"} de {suscriptores.length} en total.
        </p>
      </div>

      <NewsletterTable suscriptores={suscriptores} />
    </div>
  );
}

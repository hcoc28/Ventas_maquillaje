import { listarOpinionesAdmin } from "@/server/services/opinion.service";
import { OpinionesTable } from "./opiniones-table";

export default async function AdminOpinionesPage() {
  const opiniones = await listarOpinionesAdmin();
  const pendientes = opiniones.filter((o) => !o.aprobada).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Opiniones</h1>
        {pendientes > 0 && (
          <p className="mt-1 text-sm text-text-muted">
            {pendientes} pendiente{pendientes === 1 ? "" : "s"} de aprobación.
          </p>
        )}
      </div>

      <OpinionesTable opiniones={opiniones} />
    </div>
  );
}

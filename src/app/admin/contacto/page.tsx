import { getTodosLosMensajesAdmin } from "@/server/services/contacto.service";
import { ContactoTable } from "./contacto-table";

export default async function AdminContactoPage() {
  const mensajes = await getTodosLosMensajesAdmin();
  const noLeidos = mensajes.filter((m) => !m.leido).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Contacto</h1>
        {noLeidos > 0 && (
          <p className="mt-1 text-sm text-text-muted">
            {noLeidos} mensaje{noLeidos === 1 ? "" : "s"} sin leer.
          </p>
        )}
      </div>

      <ContactoTable mensajes={mensajes} />
    </div>
  );
}

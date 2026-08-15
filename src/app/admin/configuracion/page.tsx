import { getConfiguracion } from "@/server/services/configuracion.service";
import { ConfiguracionForm } from "./configuracion-form";

export default async function AdminConfiguracionPage() {
  const configuracion = await getConfiguracion();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Panel</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Configuración</h1>
      </div>

      <ConfiguracionForm configuracionInicial={configuracion} />
    </div>
  );
}

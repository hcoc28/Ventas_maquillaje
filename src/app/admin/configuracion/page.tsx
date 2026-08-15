import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConfiguracion } from "@/server/services/configuracion.service";
import { ConfiguracionForm } from "./configuracion-form";

export default async function AdminConfiguracionPage() {
  const session = await auth();
  // El enlace ya está oculto para Empleado en el sidebar, pero eso no impide entrar por URL
  // directa — la API ya rechaza el PUT con 403, esto solo evita que la página se muestre vacía
  // de sentido (el switch cargado y cualquier cambio fallando en silencio con un error genérico).
  if (session?.user?.role !== "Administrador") {
    redirect("/admin");
  }

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

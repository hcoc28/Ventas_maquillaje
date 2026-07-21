import { getTodosLosUsuariosAdmin } from "@/server/services/usuario.service";
import { UsuariosTable } from "./usuarios-table";

export default async function AdminUsuariosPage() {
  const usuarios = await getTodosLosUsuariosAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Cuentas</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Usuarios</h1>
      </div>

      <UsuariosTable usuarios={usuarios} />
    </div>
  );
}

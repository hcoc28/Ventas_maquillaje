import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { obtenerPerfil } from "@/server/services/usuario.service";
import { PerfilForm } from "./perfil-form";
import { CambiarPasswordForm } from "./cambiar-password-form";

export default async function CuentaPerfilPage() {
  const session = await auth();
  const perfil = await obtenerPerfil(Number(session!.user.id));
  if (!perfil) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Configuración</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Mi perfil</h1>
      </div>

      <div className="max-w-xl rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
        <PerfilForm perfil={perfil} />
      </div>

      <div className="max-w-xl rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl">Cambiar contraseña</h2>
        <CambiarPasswordForm />
      </div>
    </div>
  );
}

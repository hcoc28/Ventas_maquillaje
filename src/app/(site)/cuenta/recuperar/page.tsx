"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import { recuperarPasswordSchema, type RecuperarPasswordInput } from "@/validators/auth";

export default function RecuperarPasswordPage() {
  const [enviado, setEnviado] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarPasswordInput>({ resolver: zodResolver(recuperarPasswordSchema) });

  async function onSubmit(data: RecuperarPasswordInput) {
    setErrorGeneral(null);
    try {
      await axios.post("/api/auth/recuperar", data);
      setEnviado(true);
    } catch {
      setErrorGeneral("No se pudo procesar tu solicitud. Intenta de nuevo.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-black px-5 pb-16 pt-32 sm:px-8">
      <NavbarOscura />
      <div className="w-full max-w-md rounded-3xl bg-surface p-10 shadow-[var(--shadow-strong)]">
        <div className="mb-8 text-center">
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-accent-strong">Recuperar acceso</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">¿Olvidaste tu contraseña?</h1>
          <p className="mt-2 text-sm text-text-muted">Escribe tu correo y te enviamos un enlace para restablecerla.</p>
        </div>

        {enviado ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.
          </div>
        ) : (
          <>
            {errorGeneral && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-1.5 text-left text-sm">
                <span className="font-semibold">Correo electrónico</span>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong"
                />
                {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-black py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                Enviar enlace
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/cuenta/iniciar-sesion" className="font-semibold text-accent-strong hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

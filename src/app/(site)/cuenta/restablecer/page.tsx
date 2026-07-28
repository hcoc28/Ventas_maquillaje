"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import { PasswordInput } from "@/components/ui/password-input";
import { restablecerPasswordSchema, type RestablecerPasswordInput } from "@/validators/auth";

export default function RestablecerPasswordPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerPasswordForm />
    </Suspense>
  );
}

function RestablecerPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RestablecerPasswordInput>({
    resolver: zodResolver(restablecerPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(data: RestablecerPasswordInput) {
    setErrorGeneral(null);
    try {
      await axios.post("/api/auth/restablecer", data);
      setListo(true);
      setTimeout(() => router.push("/cuenta/iniciar-sesion"), 2000);
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo restablecer la contraseña.");
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-black px-5 pb-16 pt-32 sm:px-8">
        <NavbarOscura />
        <div className="w-full max-w-md rounded-3xl bg-surface p-10 text-center shadow-[var(--shadow-strong)]">
          <p className="text-sm text-text-muted">
            Este enlace no es válido. Solicita uno nuevo desde{" "}
            <Link href="/cuenta/recuperar" className="font-semibold text-accent-strong hover:underline">
              recuperar contraseña
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-black px-5 pb-16 pt-32 sm:px-8">
      <NavbarOscura />
      <div className="w-full max-w-md rounded-3xl bg-surface p-10 shadow-[var(--shadow-strong)]">
        <div className="mb-8 text-center">
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-accent-strong">Nueva contraseña</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Restablecer contraseña</h1>
        </div>

        {listo ? (
          <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
            Tu contraseña se actualizó. Te llevamos a iniciar sesión...
          </div>
        ) : (
          <>
            {errorGeneral && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <input type="hidden" {...register("token")} />

              <label className="flex flex-col gap-1.5 text-left text-sm">
                <span className="font-semibold">Nueva contraseña</span>
                <PasswordInput
                  {...register("password")}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong"
                />
                {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-left text-sm">
                <span className="font-semibold">Confirmar contraseña</span>
                <PasswordInput
                  {...register("confirmPassword")}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong"
                />
                {errors.confirmPassword && <span className="text-xs text-red-600">{errors.confirmPassword.message}</span>}
              </label>
              <span className="text-xs text-text-muted">Mínimo 8 caracteres, con mayúscula, número y símbolo.</span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-full bg-black py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
              >
                Restablecer contraseña
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

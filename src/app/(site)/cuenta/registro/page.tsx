"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import { PasswordInput } from "@/components/ui/password-input";
import { registroSchema, type RegistroInput } from "@/validators/auth";

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  );
}

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("callbackUrl") || "/cuenta";
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroInput>({ resolver: zodResolver(registroSchema) });

  async function onSubmit(data: RegistroInput) {
    setErrorGeneral(null);
    try {
      await axios.post("/api/auth/registro", data);
      const resultado = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (resultado?.error) {
        setErrorGeneral("Tu cuenta se creó, pero no pudimos iniciar sesión automáticamente. Intenta iniciar sesión manualmente.");
        return;
      }
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo crear la cuenta.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-black px-5 pb-16 pt-32 sm:px-8">
      <NavbarOscura />
      <div className="w-full max-w-lg rounded-3xl bg-surface p-10 shadow-[var(--shadow-strong)]">
        <div className="mb-8 text-center">
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-accent-strong">Únete a Amour Bloom</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Crear Cuenta</h1>
          <p className="mt-2 text-sm text-text-muted">Guarda tus favoritos y consulta el historial de tus pedidos.</p>
        </div>

        {errorGeneral && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Nombre" error={errors.nombre?.message}>
              <input {...register("nombre")} autoComplete="given-name" className={inputClass} />
            </Campo>
            <Campo label="Apellido" error={errors.apellido?.message}>
              <input {...register("apellido")} autoComplete="family-name" className={inputClass} />
            </Campo>
          </div>

          <Campo label="Correo electrónico" error={errors.email?.message}>
            <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
          </Campo>

          <Campo label="Teléfono" error={errors.telefono?.message}>
            <input {...register("telefono")} type="tel" autoComplete="tel" placeholder="Ej. 5021 2345 6789" className={inputClass} />
          </Campo>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo label="Contraseña" error={errors.password?.message}>
              <PasswordInput {...register("password")} autoComplete="new-password" className={inputClass} />
            </Campo>
            <Campo label="Confirmar contraseña" error={errors.confirmPassword?.message}>
              <PasswordInput {...register("confirmPassword")} autoComplete="new-password" className={inputClass} />
            </Campo>
          </div>
          <span className="text-xs text-text-muted">Mínimo 8 caracteres, con mayúscula, número y símbolo.</span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-black py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            Crear Cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href={`/cuenta/iniciar-sesion?callbackUrl=${encodeURIComponent(returnUrl)}`} className="font-semibold text-accent-strong hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong";

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-left text-sm">
      <span className="font-semibold">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

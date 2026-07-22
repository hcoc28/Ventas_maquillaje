"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import { loginSchema, type LoginInput } from "@/validators/auth";

export default function IniciarSesionPage() {
  return (
    <Suspense fallback={null}>
      <IniciarSesionForm />
    </Suspense>
  );
}

function IniciarSesionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams.get("callbackUrl");
  const returnUrl = callbackUrlParam || "/cuenta";
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setErrorGeneral(null);
    const resultado = await signIn("credentials", { ...data, redirect: false });

    if (resultado?.error) {
      setErrorGeneral("Correo electrónico o contraseña incorrectos.");
      return;
    }

    // Si no venías redirigido desde una página específica (ej. te mandaron a /admin/algo y por
    // eso hay callbackUrl), mandamos al staff directo al panel en vez de a "Mi cuenta".
    if (callbackUrlParam) {
      router.push(callbackUrlParam);
    } else {
      const session = await getSession();
      const esStaff = session?.user?.role === "Administrador" || session?.user?.role === "Empleado";
      router.push(esStaff ? "/admin" : "/cuenta");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-black to-black px-5 pb-16 pt-32 sm:px-8">
      <NavbarOscura />
      <div className="w-full max-w-md rounded-3xl bg-surface p-10 shadow-[var(--shadow-strong)]">
        <div className="mb-8 text-center">
          <span className="mb-1 block text-xs uppercase tracking-[0.3em] text-accent-strong">Bienvenida de nuevo</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Iniciar Sesión</h1>
          <p className="mt-2 text-sm text-text-muted">Accede a tu cuenta para ver tus pedidos y favoritos.</p>
        </div>

        {errorGeneral && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Campo label="Correo electrónico" error={errors.email?.message}>
            <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
          </Campo>
          <Campo label="Contraseña" error={errors.password?.message}>
            <input {...register("password")} type="password" autoComplete="current-password" className={inputClass} />
          </Campo>

          <Link href="/cuenta/recuperar" className="-mt-2 self-end text-xs font-medium text-accent-strong hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-full bg-black py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          ¿No tienes cuenta?{" "}
          <Link href={`/cuenta/registro?callbackUrl=${encodeURIComponent(returnUrl)}`} className="font-semibold text-accent-strong hover:underline">
            Regístrate aquí
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

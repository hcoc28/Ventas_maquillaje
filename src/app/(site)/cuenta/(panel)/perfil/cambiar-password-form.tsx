"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { PasswordInput } from "@/components/ui/password-input";
import { cambiarPasswordSchema, type CambiarPasswordInput } from "@/validators/auth";

export function CambiarPasswordForm() {
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CambiarPasswordInput>({ resolver: zodResolver(cambiarPasswordSchema) });

  async function onSubmit(data: CambiarPasswordInput) {
    setErrorGeneral(null);
    try {
      await axios.put("/api/cuenta/password", data);
      mostrar("Tu contraseña se actualizó correctamente.");
      reset();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo cambiar la contraseña.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <Campo label="Contraseña actual" error={errors.passwordActual?.message}>
        <PasswordInput {...register("passwordActual")} autoComplete="current-password" className={inputClass} />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nueva contraseña" error={errors.passwordNueva?.message}>
          <PasswordInput {...register("passwordNueva")} autoComplete="new-password" className={inputClass} />
        </Campo>
        <Campo label="Confirmar contraseña" error={errors.confirmPassword?.message}>
          <PasswordInput {...register("confirmPassword")} autoComplete="new-password" className={inputClass} />
        </Campo>
      </div>
      <span className="text-xs text-text-muted">Mínimo 8 caracteres, con mayúscula, número y símbolo.</span>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        Cambiar contraseña
      </button>
    </form>
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

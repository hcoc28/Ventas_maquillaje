"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { perfilSchema, type PerfilInput } from "@/validators/auth";
import type { PerfilDto } from "@/services/usuario.service";

export function PerfilForm({ perfil }: { perfil: PerfilDto }) {
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PerfilInput>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      telefono: perfil.telefono,
      direccion: perfil.direccion ?? "",
    },
  });

  async function onSubmit(data: PerfilInput) {
    setErrorGeneral(null);
    try {
      await axios.put("/api/cuenta/perfil", data);
      mostrar("Tu perfil se actualizó correctamente.");
    } catch {
      setErrorGeneral("No se pudo actualizar tu perfil.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombre" error={errors.nombre?.message}>
          <input {...register("nombre")} className={inputClass} />
        </Campo>
        <Campo label="Apellido" error={errors.apellido?.message}>
          <input {...register("apellido")} className={inputClass} />
        </Campo>
      </div>

      <Campo label="Correo electrónico">
        <input value={perfil.email} disabled className={`${inputClass} cursor-not-allowed opacity-60`} />
      </Campo>

      <Campo label="Teléfono" error={errors.telefono?.message}>
        <input {...register("telefono")} type="tel" className={inputClass} />
      </Campo>

      <Campo label="Dirección" error={errors.direccion?.message}>
        <input {...register("direccion")} className={inputClass} />
      </Campo>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        Guardar cambios
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

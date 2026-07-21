"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { contactoSchema, type ContactoInput } from "@/validators/contacto";

export function ContactoForm() {
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactoInput>({ resolver: zodResolver(contactoSchema) });

  async function onSubmit(data: ContactoInput) {
    setErrorGeneral(null);
    try {
      await axios.post("/api/contacto", data);
      mostrar("Tu mensaje fue enviado. Te responderemos pronto.");
      reset();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo enviar tu mensaje. Intenta de nuevo.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Nombre" error={errors.nombre?.message}>
          <input {...register("nombre")} autoComplete="name" className={inputClass} />
        </Campo>
        <Campo label="Correo electrónico" error={errors.email?.message}>
          <input {...register("email")} type="email" autoComplete="email" className={inputClass} />
        </Campo>
      </div>

      <Campo label="Asunto" error={errors.asunto?.message}>
        <input {...register("asunto")} className={inputClass} />
      </Campo>

      <Campo label="Mensaje" error={errors.mensaje?.message}>
        <textarea {...register("mensaje")} rows={5} className={inputClass} />
      </Campo>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        Enviar mensaje
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
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

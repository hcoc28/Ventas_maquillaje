"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { cuponAdminSchema, type CuponAdminInput } from "@/validators/admin";

export function CuponForm({ cuponId, valoresIniciales }: { cuponId?: number; valoresIniciales?: CuponAdminInput }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const esEdicion = cuponId !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CuponAdminInput>({
    resolver: zodResolver(cuponAdminSchema),
    defaultValues: valoresIniciales ?? {
      codigo: "",
      porcentajeDescuento: 10,
      fechaInicio: "",
      fechaFin: "",
      usoMaximo: null,
      activo: true,
    },
  });

  const activo = useWatch({ control, name: "activo" });

  async function onSubmit(data: CuponAdminInput) {
    setErrorGeneral(null);
    try {
      if (esEdicion) {
        await axios.put(`/api/admin/cupones/${cuponId}`, data);
        mostrar("Cupón actualizado.");
      } else {
        await axios.post("/api/admin/cupones", data);
        mostrar("Cupón creado.");
      }
      router.push("/admin/cupones");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo guardar el cupón.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <Campo label="Código" error={errors.codigo?.message}>
        <input
          {...register("codigo")}
          onChange={(e) => setValue("codigo", e.target.value.toUpperCase())}
          placeholder="Ej. BIENVENIDA10"
          className={`${inputClass} font-mono uppercase`}
        />
      </Campo>

      <Campo label="Porcentaje de descuento" error={errors.porcentajeDescuento?.message}>
        <input type="number" step="0.01" {...register("porcentajeDescuento", { valueAsNumber: true })} className={inputClass} />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Fecha de inicio" error={errors.fechaInicio?.message}>
          <input type="datetime-local" {...register("fechaInicio")} className={inputClass} />
        </Campo>
        <Campo label="Fecha de fin" error={errors.fechaFin?.message}>
          <input type="datetime-local" {...register("fechaFin")} className={inputClass} />
        </Campo>
      </div>

      <Campo label="Uso máximo (opcional)" error={errors.usoMaximo?.message}>
        <input
          type="number"
          {...register("usoMaximo", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
          placeholder="Sin límite"
          className={inputClass}
        />
      </Campo>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" checked={activo} onChange={(e) => setValue("activo", e.target.checked)} className="h-4 w-4" />
        Cupón activo
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {esEdicion ? "Guardar cambios" : "Crear cupón"}
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

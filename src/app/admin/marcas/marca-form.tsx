"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { ImagenInput } from "@/components/admin/imagen-input";
import { marcaAdminSchema, type MarcaAdminInput } from "@/validators/admin";
import { slugify } from "@/lib/utils";

export function MarcaForm({ marcaId, valoresIniciales }: { marcaId?: number; valoresIniciales?: MarcaAdminInput }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const esEdicion = marcaId !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MarcaAdminInput>({
    resolver: zodResolver(marcaAdminSchema),
    defaultValues: valoresIniciales ?? { nombre: "", slug: "", descripcion: "", logoUrl: "", activo: true },
  });

  const logoUrl = useWatch({ control, name: "logoUrl" });
  const activo = useWatch({ control, name: "activo" });

  async function onSubmit(data: MarcaAdminInput) {
    setErrorGeneral(null);
    try {
      if (esEdicion) {
        await axios.put(`/api/admin/marcas/${marcaId}`, data);
        mostrar("Marca actualizada.");
      } else {
        await axios.post("/api/admin/marcas", data);
        mostrar("Marca creada.");
      }
      router.push("/admin/marcas");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo guardar la marca.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <Campo label="Nombre" error={errors.nombre?.message}>
        <input
          {...register("nombre")}
          onChange={(e) => {
            setValue("nombre", e.target.value);
            if (!esEdicion) setValue("slug", slugify(e.target.value));
          }}
          className={inputClass}
        />
      </Campo>

      <Campo label="Slug" error={errors.slug?.message}>
        <input {...register("slug")} className={inputClass} />
      </Campo>

      <Campo label="Descripción" error={errors.descripcion?.message}>
        <textarea {...register("descripcion")} rows={3} className={inputClass} />
      </Campo>

      <Campo label="Logo" error={errors.logoUrl?.message}>
        <ImagenInput value={logoUrl ?? ""} onChange={(url) => setValue("logoUrl", url, { shouldValidate: true })} />
      </Campo>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input type="checkbox" checked={activo} onChange={(e) => setValue("activo", e.target.checked)} className="h-4 w-4" />
        Marca activa
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {esEdicion ? "Guardar cambios" : "Crear marca"}
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

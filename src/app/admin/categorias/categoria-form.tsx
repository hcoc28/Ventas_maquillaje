"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { ImagenInput } from "@/components/admin/imagen-input";
import { categoriaAdminSchema, type CategoriaAdminInput } from "@/validators/admin";
import { slugify } from "@/lib/utils";

export function CategoriaForm({ categoriaId, valoresIniciales }: { categoriaId?: number; valoresIniciales?: CategoriaAdminInput }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const esEdicion = categoriaId !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaAdminInput>({
    resolver: zodResolver(categoriaAdminSchema),
    defaultValues: valoresIniciales ?? {
      nombre: "",
      slug: "",
      descripcion: "",
      imagenUrl: "",
      icono: "",
      orden: 0,
      activo: true,
    },
  });

  async function onSubmit(data: CategoriaAdminInput) {
    setErrorGeneral(null);
    try {
      if (esEdicion) {
        await axios.put(`/api/admin/categorias/${categoriaId}`, data);
        mostrar("Categoría actualizada.");
      } else {
        await axios.post("/api/admin/categorias", data);
        mostrar("Categoría creada.");
      }
      router.push("/admin/categorias");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo guardar la categoría.");
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Imagen" error={errors.imagenUrl?.message}>
          <ImagenInput value={watch("imagenUrl") ?? ""} onChange={(url) => setValue("imagenUrl", url, { shouldValidate: true })} />
        </Campo>
        <Campo label="Ícono (nombre lucide)" error={errors.icono?.message}>
          <input {...register("icono")} className={inputClass} />
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Orden" error={errors.orden?.message}>
          <input type="number" {...register("orden", { valueAsNumber: true })} className={inputClass} />
        </Campo>
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-semibold">
          <input type="checkbox" checked={watch("activo")} onChange={(e) => setValue("activo", e.target.checked)} className="h-4 w-4" />
          Categoría activa
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {esEdicion ? "Guardar cambios" : "Crear categoría"}
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

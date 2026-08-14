"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";
import { ImagenInput } from "@/components/admin/imagen-input";
import { bannerAdminSchema, type BannerAdminInput } from "@/validators/admin";

export function BannerForm({ bannerId, valoresIniciales }: { bannerId?: number; valoresIniciales?: BannerAdminInput }) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const esEdicion = bannerId !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BannerAdminInput>({
    resolver: zodResolver(bannerAdminSchema),
    defaultValues: valoresIniciales ?? {
      titulo: "",
      subtitulo: "",
      imagenUrl: "",
      textoBotonPrimario: "",
      urlBotonPrimario: "",
      orden: 0,
      activo: true,
    },
  });

  const imagenUrl = useWatch({ control, name: "imagenUrl" });
  const activo = useWatch({ control, name: "activo" });

  async function onSubmit(data: BannerAdminInput) {
    setErrorGeneral(null);
    try {
      if (esEdicion) {
        await axios.put(`/api/admin/banners/${bannerId}`, data);
        mostrar("Banner actualizado.");
      } else {
        await axios.post("/api/admin/banners", data);
        mostrar("Banner creado.");
      }
      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo guardar el banner.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <Campo label="Título" error={errors.titulo?.message}>
        <input {...register("titulo")} className={inputClass} />
      </Campo>

      <Campo label="Subtítulo" error={errors.subtitulo?.message}>
        <input {...register("subtitulo")} className={inputClass} />
      </Campo>

      <Campo label="Imagen" error={errors.imagenUrl?.message}>
        <ImagenInput value={imagenUrl ?? ""} onChange={(url) => setValue("imagenUrl", url, { shouldValidate: true })} />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Texto del botón" error={errors.textoBotonPrimario?.message}>
          <input {...register("textoBotonPrimario")} className={inputClass} />
        </Campo>
        <Campo label="URL del botón" error={errors.urlBotonPrimario?.message}>
          <input {...register("urlBotonPrimario")} className={inputClass} />
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo label="Orden" error={errors.orden?.message}>
          <input type="number" {...register("orden", { valueAsNumber: true })} className={inputClass} />
        </Campo>
        <label className="flex items-center gap-2.5 self-end pb-2.5 text-sm font-semibold">
          <input type="checkbox" checked={activo} onChange={(e) => setValue("activo", e.target.checked)} className="h-4 w-4" />
          Banner activo
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {esEdicion ? "Guardar cambios" : "Crear banner"}
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

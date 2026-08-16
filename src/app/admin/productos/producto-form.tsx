"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Plus, Star, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { ImagenInput } from "@/components/admin/imagen-input";
import { productoAdminSchema, type ProductoAdminInput } from "@/validators/admin";
import { slugify } from "@/lib/utils";

interface OpcionesProducto {
  categorias: { id: number; nombre: string }[];
  marcas: { id: number; nombre: string }[];
  promociones: { id: number; nombre: string }[];
}

export function ProductoForm({
  productoId,
  valoresIniciales,
  opciones,
}: {
  productoId?: number;
  valoresIniciales?: ProductoAdminInput;
  opciones: OpcionesProducto;
}) {
  const router = useRouter();
  const { mostrar } = useToast();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const esEdicion = productoId !== undefined;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductoAdminInput>({
    resolver: zodResolver(productoAdminSchema),
    defaultValues: valoresIniciales ?? {
      nombre: "",
      slug: "",
      descripcionCorta: "",
      descripcionLarga: "",
      ingredientes: "",
      modoUso: "",
      beneficios: "",
      precio: 0,
      esNuevo: false,
      esEdicionLimitada: false,
      activo: true,
      categoryId: null,
      brandId: null,
      promotionId: null,
      stock: 0,
      stockMinimo: 5,
      imagenes: [{ url: "", textoAlt: "", esPrincipal: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "imagenes" });

  const categoryId = useWatch({ control, name: "categoryId" });
  const brandId = useWatch({ control, name: "brandId" });
  const promotionId = useWatch({ control, name: "promotionId" });
  const esNuevo = useWatch({ control, name: "esNuevo" });
  const esEdicionLimitada = useWatch({ control, name: "esEdicionLimitada" });
  const activo = useWatch({ control, name: "activo" });
  const imagenesWatch = useWatch({ control, name: "imagenes" });

  async function onSubmit(data: ProductoAdminInput) {
    setErrorGeneral(null);
    try {
      if (esEdicion) {
        await axios.put(`/api/admin/productos/${productoId}`, data);
        mostrar("Producto actualizado.");
      } else {
        await axios.post("/api/admin/productos", data);
        mostrar("Producto creado.");
      }
      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      setErrorGeneral(mensaje ?? "No se pudo guardar el producto.");
    }
  }

  function marcarPrincipal(index: number) {
    fields.forEach((_, i) => setValue(`imagenes.${i}.esPrincipal`, i === index));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-4" noValidate>
      {errorGeneral && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errorGeneral}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <Campo label="Descripción corta" error={errors.descripcionCorta?.message}>
        <input {...register("descripcionCorta")} className={inputClass} />
      </Campo>

      <Campo label="Descripción larga" error={errors.descripcionLarga?.message}>
        <textarea {...register("descripcionLarga")} rows={4} className={inputClass} />
      </Campo>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo label="Ingredientes" error={errors.ingredientes?.message}>
          <textarea {...register("ingredientes")} rows={2} className={inputClass} />
        </Campo>
        <Campo label="Modo de uso" error={errors.modoUso?.message}>
          <textarea {...register("modoUso")} rows={2} className={inputClass} />
        </Campo>
        <Campo label="Beneficios" error={errors.beneficios?.message}>
          <textarea {...register("beneficios")} rows={2} className={inputClass} />
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo label="Categoría" error={errors.categoryId?.message}>
          <select
            value={categoryId ?? ""}
            onChange={(e) => setValue("categoryId", e.target.value ? Number(e.target.value) : null, { shouldValidate: true })}
            className={inputClass}
          >
            <option value="">Sin categoría</option>
            {opciones.categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Marca" error={errors.brandId?.message}>
          <select
            value={brandId ?? ""}
            onChange={(e) => setValue("brandId", e.target.value ? Number(e.target.value) : null, { shouldValidate: true })}
            className={inputClass}
          >
            <option value="">Sin marca</option>
            {opciones.marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Promoción (opcional)" error={errors.promotionId?.message}>
          <select
            value={promotionId ?? ""}
            onChange={(e) => setValue("promotionId", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          >
            <option value="">Sin promoción</option>
            {opciones.promociones.map((promo) => (
              <option key={promo.id} value={promo.id}>
                {promo.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Campo label="Precio (Q)" error={errors.precio?.message}>
          <input type="number" step="0.01" {...register("precio", { valueAsNumber: true })} className={inputClass} />
        </Campo>
        <Campo label="Stock" error={errors.stock?.message}>
          <input type="number" {...register("stock", { valueAsNumber: true })} className={inputClass} />
        </Campo>
        <Campo label="Stock mínimo" error={errors.stockMinimo?.message}>
          <input type="number" {...register("stockMinimo", { valueAsNumber: true })} className={inputClass} />
        </Campo>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={esNuevo} onChange={(e) => setValue("esNuevo", e.target.checked)} className="h-4 w-4" />
          Nuevo
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input
            type="checkbox"
            checked={esEdicionLimitada}
            onChange={(e) => setValue("esEdicionLimitada", e.target.checked)}
            className="h-4 w-4"
          />
          Edición limitada
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" checked={activo} onChange={(e) => setValue("activo", e.target.checked)} className="h-4 w-4" />
          Activo
        </label>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Imágenes</span>
          <button
            type="button"
            onClick={() => append({ url: "", textoAlt: "", esPrincipal: fields.length === 0 })}
            className="flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
          >
            <Plus size={15} /> Agregar imagen
          </button>
        </div>
        {errors.imagenes?.message && <span className="text-xs text-red-600">{errors.imagenes.message}</span>}

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 items-start gap-3 rounded-xl bg-surface-muted p-3 sm:grid-cols-[1fr_1fr_auto_auto]">
            <Campo label="Imagen" error={errors.imagenes?.[index]?.url?.message}>
              <ImagenInput
                value={imagenesWatch?.[index]?.url ?? ""}
                onChange={(url) => setValue(`imagenes.${index}.url`, url, { shouldValidate: true })}
              />
            </Campo>
            <Campo label="Texto alternativo" error={errors.imagenes?.[index]?.textoAlt?.message}>
              <input {...register(`imagenes.${index}.textoAlt`)} className={inputClass} />
            </Campo>
            <button
              type="button"
              onClick={() => marcarPrincipal(index)}
              title="Marcar como principal"
              className={`mt-6 flex h-10 w-10 items-center justify-center rounded-lg border ${
                imagenesWatch?.[index]?.esPrincipal ? "border-accent-strong bg-accent-strong text-white" : "border-border"
              }`}
            >
              <Star size={16} fill={imagenesWatch?.[index]?.esPrincipal ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              className="mt-6 flex h-10 w-10 items-center justify-center rounded-lg border border-border text-red-600 disabled:opacity-40"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-fit rounded-full bg-black px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {esEdicion ? "Guardar cambios" : "Crear producto"}
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

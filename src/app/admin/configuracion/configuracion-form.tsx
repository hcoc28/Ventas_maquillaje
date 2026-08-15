"use client";

import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/toast-provider";

interface Configuracion {
  mostrarFiltroMarcas: boolean;
  nombreEmpresa: string;
  descripcionEmpresa: string;
  whatsappNumero: string;
  emailNotificaciones: string;
  direccionEmpresa: string;
}

export function ConfiguracionForm({ configuracionInicial }: { configuracionInicial: Configuracion }) {
  const { mostrar } = useToast();
  const [form, setForm] = useState(configuracionInicial);
  const [guardando, setGuardando] = useState(false);

  function actualizarCampo<K extends keyof Configuracion>(campo: K, valor: Configuracion[K]) {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar() {
    setGuardando(true);
    try {
      const { data } = await axios.put<Configuracion>("/api/admin/configuracion", form);
      setForm(data);
      mostrar("Configuración actualizada.");
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo actualizar la configuración.", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function alternarFiltro(valor: boolean) {
    const anterior = form;
    const siguiente = { ...form, mostrarFiltroMarcas: valor };
    setForm(siguiente);
    setGuardando(true);
    try {
      const { data } = await axios.put<Configuracion>("/api/admin/configuracion", siguiente);
      setForm(data);
      mostrar(valor ? "Filtro de marcas activado en el catálogo." : "Filtro de marcas desactivado en el catálogo.");
    } catch (err) {
      setForm(anterior);
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo actualizar la configuración.", "error");
    } finally {
      setGuardando(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await guardar();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm font-semibold">Filtro de marcas en el catálogo</p>
            <p className="mt-0.5 text-sm text-text-muted">
              Muestra u oculta el bloque &quot;Marcas&quot; en los filtros del catálogo público.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.mostrarFiltroMarcas}
            aria-label="Mostrar filtro de marcas en el catálogo"
            disabled={guardando}
            onClick={() => alternarFiltro(!form.mostrarFiltroMarcas)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              form.mostrarFiltroMarcas ? "bg-accent-strong" : "bg-surface-muted"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.mostrarFiltroMarcas ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div>
          <h2 className="text-base font-semibold">Información de la empresa</h2>
          <p className="mt-1 text-sm text-text-muted">Datos principales usados para contacto y configuración de la tienda.</p>
        </div>

        <Campo label="Nombre de la empresa">
          <input
            value={form.nombreEmpresa}
            onChange={(e) => actualizarCampo("nombreEmpresa", e.target.value)}
            className={inputClass}
            maxLength={120}
          />
        </Campo>

        <Campo label="Descripción">
          <textarea
            value={form.descripcionEmpresa}
            onChange={(e) => actualizarCampo("descripcionEmpresa", e.target.value)}
            className={inputClass}
            rows={3}
            maxLength={500}
          />
        </Campo>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo label="WhatsApp">
            <input
              value={form.whatsappNumero}
              onChange={(e) => actualizarCampo("whatsappNumero", e.target.value)}
              className={inputClass}
              maxLength={30}
            />
          </Campo>
          <Campo label="Correo de notificaciones">
            <input
              value={form.emailNotificaciones}
              onChange={(e) => actualizarCampo("emailNotificaciones", e.target.value)}
              type="email"
              className={inputClass}
              maxLength={200}
            />
          </Campo>
        </div>

        <Campo label="Dirección">
          <input
            value={form.direccionEmpresa}
            onChange={(e) => actualizarCampo("direccionEmpresa", e.target.value)}
            className={inputClass}
            maxLength={300}
          />
        </Campo>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-accent-strong disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </form>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</span>
      {children}
    </label>
  );
}

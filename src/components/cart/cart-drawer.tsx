"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useToast } from "@/components/ui/toast-provider";
import { formatearMoneda } from "@/lib/utils";
import { datosContactoSchema, METODOS_PAGO, type DatosContactoInput } from "@/validators/pedido";

export function CartDrawer() {
  const {
    carrito,
    drawerAbierto,
    checkoutAbierto,
    cerrarDrawer,
    abrirCheckout,
    cerrarCheckout,
    actualizar,
    eliminar,
    vaciar,
    vaciarSilencioso,
    aplicarCupon,
    quitarCupon,
  } = useCart();
  const { mostrar } = useToast();
  const [inputCupon, setInputCupon] = useState("");
  const [aplicandoCupon, setAplicandoCupon] = useState(false);

  async function onAplicarCupon() {
    if (!inputCupon.trim()) return;
    setAplicandoCupon(true);
    try {
      await aplicarCupon(inputCupon.trim());
    } finally {
      setAplicandoCupon(false);
    }
  }

  useEffect(() => {
    if (!drawerAbierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarDrawer();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerAbierto, cerrarDrawer]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatosContactoInput>({
    resolver: zodResolver(datosContactoSchema),
  });

  async function onSubmit(data: DatosContactoInput) {
    try {
      const payload = {
        ...data,
        items: carrito.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        codigoCupon: carrito.codigoCupon,
      };
      const { data: resultado } = await axios.post("/api/pedidos", payload);
      window.open(resultado.enlaceWhatsApp, "_blank", "noopener");
      mostrar(`Pedido ${resultado.numeroPedido} creado. ¡Completa el envío en WhatsApp!`);
      vaciarSilencioso();
      reset();
      cerrarDrawer();
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo crear el pedido.", "error");
    }
  }

  return (
    <AnimatePresence>
      {drawerAbierto && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={cerrarDrawer} className="fixed inset-0 z-[1400] bg-black/50" />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[1500] flex h-full w-full max-w-[440px] flex-col bg-surface shadow-[var(--shadow-strong)]"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h3 className="flex items-center gap-2.5 text-lg font-semibold">
                <ShoppingBag size={20} /> Tu Carrito
              </h3>
              <button onClick={cerrarDrawer} aria-label="Cerrar carrito" className="rounded-full p-2 hover:bg-surface-muted">
                <X size={20} />
              </button>
            </div>

            {!checkoutAbierto ? (
              <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                {carrito.items.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-text-muted">
                    <ShoppingBag size={40} className="text-brand-pink-pastel" />
                    <p>Tu carrito está vacío.</p>
                    <Link href="/catalogo" onClick={cerrarDrawer} className="rounded-full border border-foreground/20 px-5 py-2 text-sm font-semibold uppercase tracking-wider">
                      Explorar catálogo
                    </Link>
                  </div>
                ) : (
                  <>
                    <ul className="flex flex-col gap-4">
                      {carrito.items.map((item) => (
                        <li key={item.productoId} className="grid grid-cols-[64px_1fr_auto] items-start gap-3 border-b border-border pb-4">
                          <Link href={`/producto/${item.slug}`} onClick={cerrarDrawer} className="relative h-16 w-16 overflow-hidden rounded-lg bg-surface-muted">
                            <Image src={item.imagenUrl} alt={item.nombre} fill sizes="64px" className="object-cover" />
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/producto/${item.slug}`} onClick={cerrarDrawer} className="block truncate text-sm font-semibold">
                              {item.nombre}
                            </Link>
                            <span className="text-xs text-text-muted">{formatearMoneda(item.precioUnitario)}</span>
                            {item.cantidadAjustada && <span className="block text-[0.7rem] text-red-600">Cantidad ajustada por disponibilidad</span>}
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="inline-flex items-center rounded-full border border-border">
                                <button onClick={() => actualizar(item.productoId, item.cantidad - 1)} className="p-1.5" aria-label="Reducir cantidad">
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold">{item.cantidad}</span>
                                <button onClick={() => actualizar(item.productoId, item.cantidad + 1)} className="p-1.5" aria-label="Aumentar cantidad">
                                  <Plus size={12} />
                                </button>
                              </div>
                              <button onClick={() => eliminar(item.productoId)} aria-label="Eliminar" className="text-text-muted hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <span className="text-sm font-bold">{formatearMoneda(item.subtotal)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-col gap-2">
                      {carrito.codigoCupon ? (
                        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Tag size={13} /> {carrito.codigoCupon} aplicado
                          </span>
                          <button onClick={() => quitarCupon()} className="underline hover:no-underline">
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            value={inputCupon}
                            onChange={(e) => setInputCupon(e.target.value)}
                            placeholder="Código de cupón"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-accent-strong"
                          />
                          <button
                            type="button"
                            onClick={onAplicarCupon}
                            disabled={aplicandoCupon}
                            className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted disabled:opacity-60"
                          >
                            Aplicar
                          </button>
                        </div>
                      )}
                      {carrito.cuponError && <span className="text-xs text-red-600">{carrito.cuponError}</span>}

                      <div className="flex justify-between text-sm text-text-muted">
                        <span>Subtotal</span>
                        <span>{formatearMoneda(carrito.subtotal)}</span>
                      </div>
                      {carrito.descuento > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Descuento</span>
                          <span>-{formatearMoneda(carrito.descuento)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatearMoneda(carrito.total)}</span>
                      </div>
                      <button onClick={vaciar} className="mt-2 rounded-full border border-foreground/20 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-surface-muted">
                        Vaciar carrito
                      </button>
                      <button onClick={abrirCheckout} className="rounded-full bg-black py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-accent-strong">
                        Confirmar Pedido
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <button onClick={cerrarCheckout} className="mb-4 flex items-center gap-2 text-sm text-text-muted hover:text-foreground">
                  <ArrowLeft size={16} /> Volver al carrito
                </button>
                <h4 className="mb-4 text-lg font-semibold">Datos de entrega</h4>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <Campo label="Nombre completo *" error={errors.nombreContacto?.message}>
                    <input {...register("nombreContacto")} className={inputClass} />
                  </Campo>
                  <Campo label="Teléfono (WhatsApp) *" error={errors.telefonoContacto?.message}>
                    <input {...register("telefonoContacto")} type="tel" className={inputClass} />
                  </Campo>
                  <Campo label="Dirección de entrega *" error={errors.direccionEntrega?.message}>
                    <textarea {...register("direccionEntrega")} className={inputClass} rows={3} />
                  </Campo>
                  <Campo label="Método de pago *" error={errors.metodoPago?.message}>
                    <select {...register("metodoPago")} className={inputClass} defaultValue="">
                      <option value="" disabled>
                        Selecciona una opción
                      </option>
                      {METODOS_PAGO.map((metodo) => (
                        <option key={metodo} value={metodo}>
                          {metodo}
                        </option>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Correo electrónico" error={errors.email?.message}>
                    <input {...register("email")} type="email" className={inputClass} />
                  </Campo>
                  <Campo label="Observaciones" error={errors.observaciones?.message}>
                    <textarea {...register("observaciones")} className={inputClass} rows={2} />
                  </Campo>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="liquid-glass-solid mt-2 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold uppercase tracking-wider text-black disabled:opacity-60"
                  >
                    Enviar Pedido por WhatsApp
                  </button>
                </form>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-strong";

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-left">
      <span className="text-xs font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

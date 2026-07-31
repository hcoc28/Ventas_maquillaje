"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { formatearMoneda } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-context";
import { useFavoritos } from "@/components/favoritos/favoritos-context";
import type { ProductoResumen } from "@/types/catalogo";

export function ProductCard({ producto, index = 0 }: { producto: ProductoResumen; index?: number }) {
  const estrellas = Math.round(producto.calificacionPromedio);
  const { agregar } = useCart();
  const { esFavorito, alternar } = useFavoritos();
  const favorito = esFavorito(producto.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-strong)]"
    >
      <Link
        href={`/producto/${producto.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-muted"
        style={{ perspective: 900 }}
      >
        {/* Superficie: se inclina hacia atrás al pasar el mouse, como una mesa girando */}
        <div className="product-card-plate" />

        {/* Producto: sube y avanza hacia el cliente por encima de la superficie */}
        <div className="product-card-photo">
          <Image
            src={producto.imagenPrincipalUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
          />
        </div>
      </Link>

      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {producto.esNuevo && <Badge className="bg-black">Nuevo</Badge>}
        {producto.esOferta && <Badge className="bg-red-600">Oferta</Badge>}
        {producto.esMasVendido && <Badge className="bg-accent-strong">Más vendido</Badge>}
        {producto.esEdicionLimitada && (
          <Badge className="bg-gradient-to-br from-brand-gold to-accent-strong">Edición limitada</Badge>
        )}
      </div>

      <button
        type="button"
        onClick={() => alternar(producto.id)}
        aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-pressed={favorito}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 ${
          favorito ? "bg-accent-strong text-white" : "bg-white/90 text-foreground hover:bg-accent-strong hover:text-white"
        }`}
      >
        <Heart size={16} fill={favorito ? "currentColor" : "none"} />
      </button>

      <div className="pointer-events-none absolute inset-x-3 bottom-[-60px] z-10 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bottom-3">
        <button
          type="button"
          onClick={() => agregar(producto.id, 1)}
          disabled={!producto.hayStock}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-full bg-black py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          <ShoppingBag size={14} /> {producto.hayStock ? "Agregar" : "Agotado"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-accent-strong">{producto.marcaNombre}</span>
        <Link href={`/producto/${producto.slug}`} className="line-clamp-2 text-sm font-semibold text-foreground">
          {producto.nombre}
        </Link>

        <div className="my-0.5 flex items-center gap-1 text-brand-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} fill={i < estrellas ? "currentColor" : "none"} strokeWidth={1.5} />
          ))}
          <span className="ml-1 text-[0.7rem] text-text-muted">({producto.totalOpiniones})</span>
        </div>

        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-foreground">{formatearMoneda(producto.precioFinal)}</span>
          {producto.porcentajeDescuento && (
            <>
              <span className="text-sm text-text-muted line-through">{formatearMoneda(producto.precio)}</span>
              <span className="text-xs font-bold text-red-600">-{producto.porcentajeDescuento.toFixed(0)}%</span>
            </>
          )}
        </div>

        <span className={`mt-0.5 text-xs ${producto.hayStock ? "text-text-muted" : "text-red-600"}`}>
          {producto.hayStock ? "Disponible" : "Agotado temporalmente"}
        </span>
      </div>
    </motion.article>
  );
}

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-white ${className}`}>
      {children}
    </span>
  );
}

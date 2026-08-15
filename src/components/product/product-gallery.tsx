"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useModalLock } from "@/lib/use-modal-lock";
import type { ProductoImagenDto } from "@/types/catalogo";

export function ProductGallery({ imagenes, nombre }: { imagenes: ProductoImagenDto[]; nombre: string }) {
  const [activa, setActiva] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const containerRef = useModalLock<HTMLDivElement>(lightboxAbierto);

  const imagen = imagenes[activa] ?? imagenes[0];

  useEffect(() => {
    if (!lightboxAbierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxAbierto(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxAbierto]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxAbierto(true)}
        className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-surface-muted shadow-[var(--shadow-soft)]"
      >
        {imagen && (
          <Image src={imagen.url} alt={imagen.textoAlt || nombre} fill sizes="(max-width: 900px) 100vw, 45vw" className="object-cover" priority />
        )}
      </button>

      {imagenes.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiva(i)}
              aria-label={`Ver imagen ${i + 1} de ${nombre}`}
              aria-pressed={i === activa}
              className={`relative h-[76px] w-[76px] overflow-hidden rounded-xl border-2 transition-opacity ${
                i === activa ? "border-accent-strong opacity-100" : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={img.textoAlt || nombre} fill sizes="76px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxAbierto && imagen && (
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={imagen.textoAlt || nombre}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxAbierto(false)}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/92 p-6"
          >
            <button onClick={() => setLightboxAbierto(false)} aria-label="Cerrar" className="absolute right-6 top-6 text-white/85 hover:text-white">
              <X size={26} />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              src={imagen.url}
              alt={imagen.textoAlt || nombre}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

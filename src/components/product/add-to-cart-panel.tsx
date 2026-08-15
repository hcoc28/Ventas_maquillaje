"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { useFavoritos } from "@/components/favoritos/favoritos-context";

export function AddToCartPanel({ productoId, stock, hayStock }: { productoId: number; stock: number; hayStock: boolean }) {
  const [cantidad, setCantidad] = useState(1);
  const { agregar, cargando } = useCart();
  const { esFavorito, alternar } = useFavoritos();
  const favorito = esFavorito(productoId);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="flex h-11 w-11 items-center justify-center hover:bg-surface-muted"
            aria-label="Reducir cantidad"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{cantidad}</span>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.min(stock || 1, c + 1))}
            className="flex h-11 w-11 items-center justify-center hover:bg-surface-muted"
            aria-label="Aumentar cantidad"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className={`text-xs ${hayStock ? "text-text-muted" : "text-red-600"}`}>{hayStock ? `${stock} disponibles` : "Agotado temporalmente"}</span>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={!hayStock || cargando}
          onClick={() => agregar(productoId, cantidad)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-accent-strong disabled:opacity-50"
        >
          <ShoppingBag size={16} /> {cargando ? "Agregando..." : "Agregar al carrito"}
        </button>
        <button
          type="button"
          onClick={() => alternar(productoId)}
          aria-label={favorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={favorito}
          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
            favorito ? "border-accent-strong bg-accent-strong text-white" : "border-border hover:bg-surface-muted"
          }`}
        >
          <Heart size={18} fill={favorito ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}

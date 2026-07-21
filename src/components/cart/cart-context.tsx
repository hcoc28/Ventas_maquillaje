"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { Carrito, CarritoItemInput } from "@/types/carrito";
import { useToast } from "@/components/ui/toast-provider";

const STORAGE_KEY = "eclatCartItems";

interface CartContextValue {
  carrito: Carrito;
  cargando: boolean;
  drawerAbierto: boolean;
  checkoutAbierto: boolean;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
  abrirCheckout: () => void;
  cerrarCheckout: () => void;
  agregar: (productoId: number, cantidad?: number) => Promise<void>;
  actualizar: (productoId: number, cantidad: number) => Promise<void>;
  eliminar: (productoId: number) => Promise<void>;
  vaciar: () => Promise<void>;
  vaciarSilencioso: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

function leerItemsLocales(): CarritoItemInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardarItemsLocales(items: CarritoItemInput[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* localStorage no disponible */
  }
}

const carritoVacio: Carrito = { items: [], subtotal: 0, total: 0, cantidadTotalItems: 0 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarritoItemInput[]>([]);
  const [carrito, setCarrito] = useState<Carrito>(carritoVacio);
  const [cargando, setCargando] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);
  const { mostrar } = useToast();

  useEffect(() => {
    // localStorage no existe durante el render de servidor; se hidrata una sola vez al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(leerItemsLocales());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidratado(true);
  }, []);

  const recalcular = useCallback(async (nuevosItems: CarritoItemInput[]) => {
    setCargando(true);
    try {
      const { data } = await axios.post<Carrito>("/api/carrito/calcular", { items: nuevosItems });
      setCarrito(data);

      const idsValidos = new Set(data.items.map((i) => i.productoId));
      const limpios = nuevosItems.filter((i) => idsValidos.has(i.productoId));
      if (limpios.length !== nuevosItems.length) {
        setItems(limpios);
        guardarItemsLocales(limpios);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    recalcular(items);
  }, [hidratado]);

  const actualizarItems = useCallback(
    async (nuevos: CarritoItemInput[]) => {
      setItems(nuevos);
      guardarItemsLocales(nuevos);
      await recalcular(nuevos);
    },
    [recalcular]
  );

  const agregar = useCallback(
    async (productoId: number, cantidad = 1) => {
      const existente = items.find((i) => i.productoId === productoId);
      const nuevos = existente
        ? items.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + cantidad } : i))
        : [...items, { productoId, cantidad }];
      await actualizarItems(nuevos);
      mostrar("Producto agregado al carrito.");
      setDrawerAbierto(true);
    },
    [items, actualizarItems, mostrar]
  );

  const actualizar = useCallback(
    async (productoId: number, cantidad: number) => {
      if (cantidad <= 0) {
        await actualizarItems(items.filter((i) => i.productoId !== productoId));
        return;
      }
      await actualizarItems(items.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i)));
    },
    [items, actualizarItems]
  );

  const eliminar = useCallback(
    async (productoId: number) => {
      await actualizarItems(items.filter((i) => i.productoId !== productoId));
    },
    [items, actualizarItems]
  );

  const vaciar = useCallback(async () => {
    await actualizarItems([]);
  }, [actualizarItems]);

  const vaciarSilencioso = useCallback(() => {
    setItems([]);
    guardarItemsLocales([]);
    setCarrito(carritoVacio);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      carrito,
      cargando,
      drawerAbierto,
      checkoutAbierto,
      abrirDrawer: () => setDrawerAbierto(true),
      cerrarDrawer: () => {
        setDrawerAbierto(false);
        setCheckoutAbierto(false);
      },
      abrirCheckout: () => setCheckoutAbierto(true),
      cerrarCheckout: () => setCheckoutAbierto(false),
      agregar,
      actualizar,
      eliminar,
      vaciar,
      vaciarSilencioso,
    }),
    [carrito, cargando, drawerAbierto, checkoutAbierto, agregar, actualizar, eliminar, vaciar, vaciarSilencioso]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

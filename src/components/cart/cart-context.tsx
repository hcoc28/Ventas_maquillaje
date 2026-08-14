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
  aplicarCupon: (codigo: string) => Promise<void>;
  quitarCupon: () => Promise<void>;
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

const carritoVacio: Carrito = { items: [], subtotal: 0, descuento: 0, total: 0, cantidadTotalItems: 0 };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarritoItemInput[]>([]);
  const [carrito, setCarrito] = useState<Carrito>(carritoVacio);
  const [codigoCupon, setCodigoCupon] = useState<string>("");
  const [cargando, setCargando] = useState(false);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);
  const { mostrar } = useToast();

  useEffect(() => {
    // localStorage no existe durante el render de servidor; se hidrata una sola vez al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(leerItemsLocales());
    setHidratado(true);
  }, []);

  const recalcular = useCallback(async (nuevosItems: CarritoItemInput[], cupon?: string) => {
    setCargando(true);
    try {
      const { data } = await axios.post<Carrito>("/api/carrito/calcular", {
        items: nuevosItems,
        codigoCupon: cupon,
      });
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
    // Solo debe recalcular una vez al hidratar; items/recalcular se omiten a propósito para no
    // repetir la llamada en cada cambio (agregar/actualizar/eliminar ya llaman a recalcular directo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recalcular(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidratado]);

  const actualizarItems = useCallback(
    async (nuevos: CarritoItemInput[]) => {
      setItems(nuevos);
      guardarItemsLocales(nuevos);
      await recalcular(nuevos, codigoCupon || undefined);
    },
    [recalcular, codigoCupon]
  );

  const aplicarCupon = useCallback(
    async (codigo: string) => {
      setCodigoCupon(codigo);
      await recalcular(items, codigo);
    },
    [recalcular, items]
  );

  const quitarCupon = useCallback(async () => {
    setCodigoCupon("");
    await recalcular(items, undefined);
  }, [recalcular, items]);

  const agregar = useCallback(
    async (productoId: number, cantidad = 1) => {
      const existente = items.find((i) => i.productoId === productoId);
      const nuevos = existente
        ? items.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + cantidad } : i))
        : [...items, { productoId, cantidad }];
      await actualizarItems(nuevos);
      mostrar("Producto agregado al carrito.");
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
    setCodigoCupon("");
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
      aplicarCupon,
      quitarCupon,
    }),
    [carrito, cargando, drawerAbierto, checkoutAbierto, agregar, actualizar, eliminar, vaciar, vaciarSilencioso, aplicarCupon, quitarCupon]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

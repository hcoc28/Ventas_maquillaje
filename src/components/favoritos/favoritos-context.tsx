"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/toast-provider";

interface FavoritosContextValue {
  ids: Set<number>;
  esFavorito: (productoId: number) => boolean;
  alternar: (productoId: number) => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextValue | null>(null);

export function useFavoritos(): FavoritosContextValue {
  const ctx = useContext(FavoritosContext);
  if (!ctx) throw new Error("useFavoritos debe usarse dentro de FavoritosProvider");
  return ctx;
}

export function FavoritosProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { mostrar } = useToast();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status !== "authenticated") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIds(new Set());
      return;
    }
    axios
      .get<{ ids: number[] }>("/api/favoritos")
      .then(({ data }) => setIds(new Set(data.ids)))
      .catch(() => setIds(new Set()));
  }, [status]);

  const esFavorito = useCallback((productoId: number) => ids.has(productoId), [ids]);

  const alternar = useCallback(
    async (productoId: number) => {
      if (status !== "authenticated") {
        mostrar("Inicia sesión para guardar tus productos favoritos.", "error");
        return;
      }
      try {
        const { data } = await axios.post<{ esFavorito: boolean }>("/api/favoritos/alternar", { productoId });
        setIds((prev) => {
          const nuevos = new Set(prev);
          if (data.esFavorito) nuevos.add(productoId);
          else nuevos.delete(productoId);
          return nuevos;
        });
        mostrar(data.esFavorito ? "Agregado a tus favoritos." : "Eliminado de tus favoritos.");
      } catch {
        mostrar("No se pudo actualizar tus favoritos.", "error");
      }
    },
    [status, mostrar]
  );

  const value = useMemo<FavoritosContextValue>(() => ({ ids, esFavorito, alternar }), [ids, esFavorito, alternar]);

  return <FavoritosContext.Provider value={value}>{children}</FavoritosContext.Provider>;
}

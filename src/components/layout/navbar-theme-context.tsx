"use client";

import { createContext, useContext, useEffect, useState } from "react";

type NavbarTema = "claro" | "oscuro";

const NavbarThemeContext = createContext<{ tema: NavbarTema; setTema: (t: NavbarTema) => void } | null>(null);

export function NavbarThemeProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<NavbarTema>("claro");
  return <NavbarThemeContext.Provider value={{ tema, setTema }}>{children}</NavbarThemeContext.Provider>;
}

export function useNavbarTema() {
  const ctx = useContext(NavbarThemeContext);
  if (!ctx) throw new Error("useNavbarTema debe usarse dentro de NavbarThemeProvider");
  return ctx;
}

/** Componente invisible que una página puede montar para anunciar que la navbar debe iniciar en modo "oscuro" (texto blanco sobre fondo oscuro, ej. Hero a pantalla completa). */
export function NavbarOscura() {
  const { setTema } = useNavbarTema();
  useEffect(() => {
    setTema("oscuro");
    return () => setTema("claro");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

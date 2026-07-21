"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className={className} aria-hidden />;
  }

  const esOscuro = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      className={className}
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {esOscuro ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

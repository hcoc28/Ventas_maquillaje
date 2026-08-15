"use client";

import { useEffect, useRef } from "react";

const SELECTOR_FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bloquea el scroll del body y atrapa el foco con Tab/Shift+Tab dentro del contenedor mientras
 * `abierto` es true — sin esto, Tab se escapa detrás del overlay y el fondo sigue siendo
 * scrolleable con la rueda del mouse pese al modal/panel encima.
 */
export function useModalLock<T extends HTMLElement = HTMLElement>(abierto: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!abierto) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !containerRef.current) return;
      const focosables = containerRef.current.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLE);
      if (focosables.length === 0) return;

      const primero = focosables[0];
      const ultimo = focosables[focosables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  return containerRef;
}

"use client";

import { useState } from "react";
import type { OpinionDto } from "@/types/catalogo";

interface Props {
  descripcionLarga: string;
  beneficios: string | null;
  ingredientes: string | null;
  modoUso: string | null;
  opiniones: OpinionDto[];
}

const TABS = ["Descripción", "Ingredientes", "Modo de uso", "Opiniones"] as const;

export function ProductTabs({ descripcionLarga, beneficios, ingredientes, modoUso, opiniones }: Props) {
  const [activa, setActiva] = useState<(typeof TABS)[number]>("Descripción");

  return (
    <div>
      <div className="mb-5 flex gap-6 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiva(tab)}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
              activa === tab ? "border-accent-strong text-foreground" : "border-transparent text-text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activa === "Descripción" && (
        <div className="leading-relaxed text-text-muted">
          <p>{descripcionLarga}</p>
          {beneficios && (
            <p className="mt-3">
              <strong className="text-foreground">Beneficios:</strong> {beneficios}
            </p>
          )}
        </div>
      )}

      {activa === "Ingredientes" && <p className="leading-relaxed text-text-muted">{ingredientes ?? "Información no disponible."}</p>}

      {activa === "Modo de uso" && <p className="leading-relaxed text-text-muted">{modoUso ?? "Información no disponible."}</p>}

      {activa === "Opiniones" && (
        <div>
          {opiniones.length === 0 ? (
            <p className="text-text-muted">Este producto aún no tiene opiniones.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {opiniones.map((op, i) => (
                <li key={i} className="border-b border-border pb-4 last:border-none">
                  <div className="mb-1 flex gap-0.5 text-brand-gold">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j}>{j < op.calificacion ? "★" : "☆"}</span>
                    ))}
                  </div>
                  <strong className="text-sm">{op.nombreCliente}</strong>
                  <p className="mt-1 text-sm text-text-muted">{op.comentario}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

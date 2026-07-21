"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Pregunta {
  pregunta: string;
  respuesta: string;
}

export function FaqAccordion({ preguntas }: { preguntas: Pregunta[] }) {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
      {preguntas.map((item, index) => {
        const expandido = abierta === index;
        return (
          <div key={item.pregunta}>
            <h3>
              <button
                type="button"
                aria-expanded={expandido}
                aria-controls={`faq-panel-${index}`}
                id={`faq-header-${index}`}
                onClick={() => setAbierta(expandido ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-semibold sm:text-base"
              >
                {item.pregunta}
                <ChevronDown size={18} className={`shrink-0 transition-transform ${expandido ? "rotate-180" : ""}`} />
              </button>
            </h3>
            <div
              id={`faq-panel-${index}`}
              role="region"
              aria-labelledby={`faq-header-${index}`}
              hidden={!expandido}
              className="px-6 pb-5 text-sm text-text-muted"
            >
              {item.respuesta}
            </div>
          </div>
        );
      })}
    </div>
  );
}

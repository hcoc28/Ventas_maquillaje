"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useSession } from "next-auth/react";
import type { OpinionDto } from "@/types/catalogo";
import { useToast } from "@/components/ui/toast-provider";

interface Props {
  productoId: number;
  descripcionLarga: string;
  beneficios: string | null;
  ingredientes: string | null;
  modoUso: string | null;
  opiniones: OpinionDto[];
}

const TABS = ["Descripción", "Ingredientes", "Modo de uso", "Opiniones"] as const;

function ReviewForm({ productoId }: { productoId: number }) {
  const { status } = useSession();
  const { mostrar } = useToast();
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  if (status !== "authenticated") {
    return (
      <p className="mb-6 text-sm text-text-muted">
        <Link href="/cuenta/iniciar-sesion" className="font-semibold text-accent-strong hover:underline">
          Inicia sesión
        </Link>{" "}
        para dejar tu opinión sobre este producto.
      </p>
    );
  }

  if (enviada) {
    return (
      <p className="mb-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
        ¡Gracias por tu opinión! Se publicará luego de ser revisada.
      </p>
    );
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (calificacion < 1) {
      mostrar("Selecciona una calificación.", "error");
      return;
    }
    if (!comentario.trim()) {
      mostrar("Escribe un comentario.", "error");
      return;
    }
    setEnviando(true);
    try {
      await axios.post("/api/productos/opiniones", { productoId, calificacion, comentario: comentario.trim() });
      setEnviada(true);
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo enviar tu opinión.", "error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mb-8 rounded-xl border border-border p-4">
      <p className="mb-2 text-sm font-semibold">Deja tu opinión</p>
      <div className="mb-3 flex gap-1 text-2xl text-brand-gold">
        {Array.from({ length: 5 }).map((_, i) => {
          const valor = i + 1;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => setCalificacion(valor)}
              onMouseEnter={() => setHover(valor)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${valor} estrellas`}
            >
              {valor <= (hover || calificacion) ? "★" : "☆"}
            </button>
          );
        })}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Cuéntanos qué te pareció el producto..."
        className="mb-3 w-full rounded-lg border border-border bg-transparent p-3 text-sm outline-none focus:border-accent-strong"
      />
      <button
        type="submit"
        disabled={enviando}
        className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar opinión"}
      </button>
    </form>
  );
}

export function ProductTabs({ productoId, descripcionLarga, beneficios, ingredientes, modoUso, opiniones }: Props) {
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
          <ReviewForm productoId={productoId} />

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

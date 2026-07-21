"use client";

import { useState } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

export function NewsletterForm({ variant = "footer" }: { variant?: "footer" | "section" }) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { mostrar } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEnviando(true);
    try {
      await axios.post("/api/newsletter", { email });
      mostrar("¡Gracias por suscribirte! Revisa tu correo pronto.");
      setEmail("");
    } catch (err) {
      const mensaje = axios.isAxiosError(err) ? err.response?.data?.mensaje : null;
      mostrar(mensaje ?? "No se pudo completar la suscripción.", "error");
    } finally {
      setEnviando(false);
    }
  }

  if (variant === "section") {
    return (
      <form onSubmit={onSubmit} className="mx-auto flex max-w-md gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          className="flex-1 rounded-full border-none px-5 py-3.5 text-sm text-black outline-none focus:ring-2 focus:ring-white/70"
        />
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-black px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          Suscribirme
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu correo electrónico"
        className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={enviando}
        aria-label="Suscribirme"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-60"
      >
        <Send size={16} />
      </button>
    </form>
  );
}

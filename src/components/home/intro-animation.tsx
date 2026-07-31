"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "amourbloom-intro-visto";
const DURACION_MS = 7200;
const FADE_MS = 900;
const COLORES_PARTICULAS = ["#e4cd97", "#c6a15b", "#d9a9a9", "#f3d9d9", "#c9a3d8"];

interface Particula {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
  fase: number;
}

export function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const yaVisto = sessionStorage.getItem(STORAGE_KEY);
    const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (yaVisto || prefiereMenosMovimiento) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const timer = setTimeout(() => setSaliendo(true), DURACION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) skipRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (!saliendo) return;
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, FADE_MS);
    return () => clearTimeout(timer);
  }, [saliendo]);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ancho = (canvas.width = window.innerWidth);
    let alto = (canvas.height = window.innerHeight);

    function onResize() {
      ancho = canvas.width = window.innerWidth;
      alto = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", onResize);

    const particulas: Particula[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * ancho,
      y: Math.random() * alto,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.4 - 0.1,
      color: COLORES_PARTICULAS[Math.floor(Math.random() * COLORES_PARTICULAS.length)],
      fase: Math.random() * Math.PI * 2,
    }));

    let raf: number;
    function dibujar(t: number) {
      ctx!.clearRect(0, 0, ancho, alto);
      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) p.y = alto + 10;
        if (p.x < -10) p.x = ancho + 10;
        if (p.x > ancho + 10) p.x = -10;
        const parpadeo = 0.4 + 0.6 * Math.abs(Math.sin(t / 700 + p.fase));
        ctx!.globalAlpha = parpadeo;
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(dibujar);
    }
    raf = requestAnimationFrame(dibujar);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-[900ms] ease-out ${
        saliendo ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(198,161,91,0.35),rgba(0,0,0,0.92)_65%)]"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0" />

      <div aria-hidden="true" className="relative flex flex-col items-center gap-3 text-center">
        <span className="intro-logo-text font-[family-name:var(--font-display)] text-5xl text-[#f3e6c8] sm:text-6xl">
          Amour Bloom
        </span>
        <span className="intro-logo-sub text-xs uppercase tracking-[0.5em] text-[#e4cd97]/80">
          Brilla con suavidad
        </span>
      </div>

      <button
        ref={skipRef}
        type="button"
        onClick={() => setSaliendo(true)}
        className="absolute bottom-6 right-6 rounded-full border border-white/25 px-4 py-2 text-xs uppercase tracking-wider text-white/70 transition-colors hover:border-white/60 hover:text-white"
      >
        Saltar intro
      </button>
    </div>
  );
}

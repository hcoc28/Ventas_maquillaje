"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import type { BannerDto } from "@/types/catalogo";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

function splitCaracteres(texto: string) {
  return texto.split(" ").map((palabra, i) => (
    <span key={i} className="inline-block whitespace-nowrap">
      {[...palabra].map((char, j) => (
        <span key={j} className="hero-char inline-block will-change-transform">
          {char}
        </span>
      ))}
      {i < texto.split(" ").length - 1 ? " " : ""}
    </span>
  ));
}

export function Hero({ banners }: { banners: BannerDto[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<{ x: gsap.QuickToFunc; y: gsap.QuickToFunc } | null>(null);

  function animarSlide(swiper: SwiperType) {
    const slideEl = swiper.slides[swiper.activeIndex];
    if (!slideEl) return;

    const eyebrowChars = slideEl.querySelectorAll(".hero-eyebrow .hero-char");
    const titleChars = slideEl.querySelectorAll(".hero-title .hero-char");
    const bloques = slideEl.querySelectorAll("[data-hero-anim]");

    const tl = gsap.timeline();
    tl.set([...eyebrowChars, ...titleChars], { opacity: 0, y: 26, filter: "blur(8px)" }).set(bloques, {
      opacity: 0,
      y: 24,
    });
    tl.to(eyebrowChars, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.02 }, 0.1);
    tl.to(titleChars, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out", stagger: 0.028 }, 0.35);
    tl.to(bloques, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 }, "-=0.3");
  }

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!wrapRef.current || !heroRef.current) return;
    if (!quickRef.current) {
      quickRef.current = {
        x: gsap.quickTo(wrapRef.current, "rotationY", { duration: 0.6, ease: "power3.out" }),
        y: gsap.quickTo(wrapRef.current, "rotationX", { duration: 0.6, ease: "power3.out" }),
      };
    }
    const rect = heroRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    quickRef.current.x(px * 6);
    quickRef.current.y(py * -6);
  }

  function onMouseLeave() {
    quickRef.current?.x(0);
    quickRef.current?.y(0);
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black"
      style={{ perspective: "1400px" }}
    >
      <NavbarOscura />
      <div
        className="pointer-events-none absolute -inset-[10%] z-[2] opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Swiper
        modules={[EffectFade, Autoplay, Pagination, Navigation]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        rewind
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        speed={1100}
        pagination={{ el: ".hero-pagination", clickable: true }}
        navigation={{ nextEl: ".hero-next", prevEl: ".hero-prev" }}
        onInit={animarSlide}
        onSlideChangeTransitionStart={animarSlide}
        className="h-full w-full"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className="relative flex h-full w-full items-center">
              <div
                className="hero-bg absolute inset-0 bg-cover bg-center transition-[transform,filter] duration-[7000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ backgroundImage: `url(${banner.imagenUrl})` }}
              />
              <div
                className="absolute inset-0 z-[1]"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 90% at 50% 40%, rgba(18,16,18,0) 0%, rgba(18,16,18,0.55) 100%), linear-gradient(180deg, rgba(18,16,18,0.4) 0%, rgba(18,16,18,0.35) 45%, rgba(18,16,18,0.88) 100%)",
                }}
              />
              <div ref={wrapRef} className="relative z-[3] w-full" style={{ transformStyle: "preserve-3d" }}>
                <div className="mx-auto max-w-7xl px-5 text-white sm:px-8" style={{ transform: "translateZ(0)" }}>
                  <span className="hero-eyebrow mb-4 block text-xs uppercase tracking-[0.3em] text-brand-gold-light">
                    {splitCaracteres("Èclat Maquillaje")}
                  </span>
                  <h1 className="hero-title mb-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-[1.08] tracking-tight sm:mb-8 sm:text-6xl md:text-7xl lg:text-8xl">
                    {splitCaracteres(banner.titulo)}
                  </h1>
                  {banner.subtitulo && (
                    <p data-hero-anim className="mb-8 max-w-lg text-base font-light text-white/85 sm:mb-10 sm:text-lg">
                      {banner.subtitulo}
                    </p>
                  )}
                  <div data-hero-anim className="flex flex-wrap gap-4">
                    {banner.textoBotonPrimario && banner.urlBotonPrimario && (
                      <Link
                        href={banner.urlBotonPrimario}
                        className="liquid-glass-solid rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-black transition-transform hover:-translate-y-0.5 sm:px-10 sm:py-4"
                      >
                        {banner.textoBotonPrimario}
                      </Link>
                    )}
                    <Link
                      href="/catalogo"
                      className="liquid-glass rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform hover:-translate-y-0.5 sm:px-10 sm:py-4"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="hero-pagination absolute bottom-8 right-8 z-[4] flex gap-2" />
        <button className="hero-prev absolute left-8 top-1/2 z-[4] -translate-y-1/2 rounded-full border border-white/35 bg-white/5 p-3.5 text-white backdrop-blur-md transition hover:bg-white/15 max-md:hidden">
          <ChevronLeft size={20} />
        </button>
        <button className="hero-next absolute right-8 top-1/2 z-[4] -translate-y-1/2 rounded-full border border-white/35 bg-white/5 p-3.5 text-white backdrop-blur-md transition hover:bg-white/15 max-md:hidden">
          <ChevronRight size={20} />
        </button>
      </Swiper>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 z-[4] flex -translate-x-1/2 flex-col items-center gap-2 text-white"
      >
        <span className="text-xs uppercase tracking-widest">Descubre más</span>
        <div className="relative h-10 w-px overflow-hidden bg-white/40">
          <span className="scroll-cue absolute inset-0 bg-white" />
        </div>
      </motion.div>
    </section>
  );
}

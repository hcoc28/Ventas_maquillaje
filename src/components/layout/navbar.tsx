"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { Heart, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useNavbarTema } from "@/components/layout/navbar-theme-context";
import { useCart } from "@/components/cart/cart-context";
import { cn } from "@/lib/utils";
import type { CategoriaDto } from "@/types/catalogo";

interface NavbarProps {
  categorias: CategoriaDto[];
}

const linksBase = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
];

export function Navbar({ categorias }: NavbarProps) {
  const { tema } = useNavbarTema();
  const { carrito, abrirDrawer } = useCart();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState(false);
  const [termino, setTermino] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuAbierto(false);
  }, [pathname]);

  const esOscuroForzado = tema === "oscuro" && !scrolled;

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    if (!termino.trim()) return;
    router.push(`/catalogo?q=${encodeURIComponent(termino.trim())}`);
    setBusquedaAbierta(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-500",
        scrolled ? "bg-surface/90 backdrop-blur-xl shadow-[var(--shadow-soft)] py-3" : "py-5"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className={cn(
            "font-[family-name:var(--font-display)] text-2xl tracking-wide transition-colors",
            esOscuroForzado ? "text-white" : "text-foreground"
          )}
        >
          Èclat
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {linksBase.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-wider transition-colors hover:text-accent-strong",
                esOscuroForzado ? "text-white/85" : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
          {categorias.slice(0, 6).map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogo?categoria=${cat.slug}`}
              className={cn(
                "text-sm font-medium uppercase tracking-wider transition-colors hover:text-accent-strong",
                esOscuroForzado ? "text-white/85" : "text-foreground/80"
              )}
            >
              {cat.nombre}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setBusquedaAbierta((v) => !v)}
            aria-label="Buscar"
            className={cn(iconBtnClass, esOscuroForzado && "text-white hover:bg-white/15")}
          >
            <Search size={18} />
          </button>
          <Link href="/cuenta/favoritos" aria-label="Favoritos" className={cn(iconBtnClass, esOscuroForzado && "text-white hover:bg-white/15")}>
            <Heart size={18} />
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => (status === "authenticated" ? setCuentaAbierta((v) => !v) : router.push("/cuenta/iniciar-sesion"))}
              aria-label="Mi cuenta"
              className={cn(iconBtnClass, esOscuroForzado && "text-white hover:bg-white/15")}
            >
              <User size={18} />
            </button>
            <AnimatePresence>
              {cuentaAbierta && status === "authenticated" && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCuentaAbierta(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-[var(--shadow-strong)]"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{session?.user?.name}</p>
                      <p className="truncate text-xs text-text-muted">{session?.user?.email}</p>
                    </div>
                    <Link href="/cuenta" onClick={() => setCuentaAbierta(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted">
                      <User size={15} /> Mi cuenta
                    </Link>
                    <Link href="/cuenta/pedidos" onClick={() => setCuentaAbierta(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted">
                      <Package size={15} /> Mis pedidos
                    </Link>
                    <Link href="/cuenta/favoritos" onClick={() => setCuentaAbierta(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-surface-muted">
                      <Heart size={15} /> Favoritos
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setCuentaAbierta(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center gap-2.5 border-t border-border px-4 py-2.5 text-left text-sm text-red-600 hover:bg-surface-muted"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={abrirDrawer}
            aria-label="Carrito"
            className={cn(iconBtnClass, "relative", esOscuroForzado && "text-white hover:bg-white/15")}
          >
            <ShoppingBag size={18} />
            {carrito.cantidadTotalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-strong px-1 text-[10px] font-bold text-white">
                {carrito.cantidadTotalItems}
              </span>
            )}
          </button>
          <ThemeToggle className={cn(iconBtnClass, esOscuroForzado && "text-white hover:bg-white/15")} />
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className={cn(iconBtnClass, "lg:hidden", esOscuroForzado && "text-white hover:bg-white/15")}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {busquedaAbierta && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-surface"
          >
            <form onSubmit={handleBuscar} className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  autoFocus
                  value={termino}
                  onChange={(e) => setTermino(e.target.value)}
                  type="text"
                  placeholder="Buscar labiales, bases, skincare..."
                  className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-accent-strong"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileMenu
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        links={[...linksBase, ...categorias.slice(0, 8).map((c) => ({ href: `/catalogo?categoria=${c.slug}`, label: c.nombre }))]}
      />
    </header>
  );
}

const iconBtnClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted";

function MobileMenu({
  abierto,
  onCerrar,
  links,
}: {
  abierto: boolean;
  onCerrar: () => void;
  links: { href: string; label: string }[];
}) {
  useEffect(() => {
    if (!abierto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCerrar();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-[min(340px,85vw)] flex-col justify-center gap-1 border-l border-white/10 bg-black/85 px-10 py-16 backdrop-blur-2xl"
          >
            <button onClick={onCerrar} aria-label="Cerrar menú" className="absolute right-6 top-6 text-white/80 hover:text-white">
              <X size={22} />
            </button>
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.05, duration: 0.35, ease: "easeOut" }}
              >
                <Link href={link.href} className="block py-2.5 text-lg font-light uppercase tracking-wider text-white/90 hover:text-white">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

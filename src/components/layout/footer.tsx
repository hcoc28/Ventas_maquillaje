import Link from "next/link";
import { NewsletterForm } from "@/components/layout/newsletter-form";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-black px-5 pb-8 pt-16 text-ivory sm:px-8" style={{ color: "var(--color-ivory)" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 font-[family-name:var(--font-display)] text-2xl text-white">Amour Bloom</div>
            <p className="mb-4 max-w-xs text-sm text-white/65">
              Brilla con suavidad, florece con estilo. Tienda en línea con productos 100% originales.
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://www.instagram.com/amourbloom_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-accent"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs uppercase tracking-widest text-brand-gold-light">Tienda</div>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link href="/catalogo" className="hover:text-white">Catálogo completo</Link></li>
              <li><Link href="/catalogo?oferta=true" className="hover:text-white">Ofertas</Link></li>
              <li><Link href="/cuenta/favoritos" className="hover:text-white">Mis favoritos</Link></li>
              <li><Link href="/nosotros" className="hover:text-white">Nosotros</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs uppercase tracking-widest text-brand-gold-light">Ayuda</div>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li><Link href="/preguntas-frecuentes" className="hover:text-white">Preguntas frecuentes</Link></li>
              <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
              <li><Link href="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs uppercase tracking-widest text-brand-gold-light">Newsletter</div>
            <p className="mb-3 text-sm text-white/65">Recibe primero nuestras novedades y ofertas exclusivas.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-xs text-white/50 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Amour Bloom. Todos los derechos reservados.</span>
          <div className="flex gap-5">
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link>
            <Link href="/terminos" className="hover:text-white">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

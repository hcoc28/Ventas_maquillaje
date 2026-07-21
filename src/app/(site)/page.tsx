import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gem, HeartHandshake, ShieldCheck, Truck } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { CategoryCard } from "@/components/home/category-card";
import { ProductCard } from "@/components/product/product-card";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Reveal } from "@/components/ui/reveal";
import { getBannersActivos } from "@/server/services/banner.service";
import { getCategoriasActivas } from "@/server/services/categoria.service";
import { getMarcasActivas } from "@/server/services/marca.service";
import * as productoService from "@/server/services/producto.service";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 300;

export default async function HomePage() {
  const [banners, categorias, marcas, destacados, nuevos, masVendidos, enPromocion] = await Promise.all([
    getBannersActivos(),
    getCategoriasActivas(),
    getMarcasActivas(),
    productoService.getDestacados(8),
    productoService.getNuevos(8),
    productoService.getMasVendidos(8),
    productoService.getEnPromocion(4),
  ]);

  const promoDestacada = enPromocion[0];
  const maxDescuento = enPromocion.reduce((max, p) => Math.max(max, p.porcentajeDescuento ?? 0), 0);

  return (
    <>
      <Hero banners={banners} />

      <section className="bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-accent-strong">Explora por categoría</span>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Nuestras Colecciones</h2>
            <p className="text-sm text-text-muted">Encuentra exactamente lo que buscas entre nuestras categorías cuidadosamente curadas.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categorias.map((categoria, i) => (
              <Reveal key={categoria.id} delay={Math.min(i, 6) * 0.05}>
                <CategoryCard categoria={categoria} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-accent-strong">Seleccionados para ti</span>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Productos Destacados</h2>
            <p className="text-sm text-text-muted">Lo mejor de nuestra colección, elegido por su calidad y popularidad.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {destacados.map((producto, i) => (
              <ProductCard key={producto.id} producto={producto} index={i} />
            ))}
          </div>
        </div>
      </section>

      {promoDestacada && (
        <section className="px-5 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal direction="zoom">
              <div className="relative flex min-h-[340px] items-center overflow-hidden rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${promoDestacada.imagenPrincipalUrl})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/25 to-transparent" />
                <div className="relative z-10 max-w-md p-10 text-white sm:p-16">
                  <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-brand-gold-light">Por tiempo limitado</span>
                  <h3 className="mb-3 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">
                    Hasta -{maxDescuento.toFixed(0)}% de descuento
                  </h3>
                  <p className="mb-6 text-white/80">Aprovecha nuestras promociones exclusivas en productos seleccionados antes de que se agoten.</p>
                  <Link
                    href="/catalogo?oferta=true"
                    className="inline-block rounded-full bg-gradient-to-br from-brand-gold to-accent-strong px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5"
                  >
                    Ver ofertas
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className="mt-24 bg-black px-5 py-24 text-white sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-xl text-center">
            <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-brand-gold-light">Recién llegados</span>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">Novedades</h2>
            <p className="text-sm text-white/65">Las últimas incorporaciones a nuestra colección de alta cosmética.</p>
          </Reveal>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {nuevos.map((producto, i) => (
              <ProductCard key={producto.id} producto={producto} index={i} />
            ))}
          </div>
        </div>
      </section>

      {masVendidos.length > 0 && (
        <section className="bg-background px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto mb-12 max-w-xl text-center">
              <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-accent-strong">Favoritos de la comunidad</span>
              <h2 className="mb-2 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Más Vendidos</h2>
              <p className="text-sm text-text-muted">Los productos que más aman nuestras clientas.</p>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {masVendidos.map((producto, i) => (
                <ProductCard key={producto.id} producto={producto} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-background px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-10 max-w-xl text-center">
            <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-accent-strong">Marcas de lujo</span>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl">Marcas que Amamos</h2>
          </Reveal>
          <Reveal className="mb-16 flex flex-wrap items-center justify-around gap-8">
            {marcas.map((marca) => (
              <Link key={marca.id} href={`/catalogo?marca=${marca.slug}`} title={marca.nombre} className="grayscale opacity-60 transition hover:grayscale-0 hover:opacity-100">
                {marca.logoUrl && <Image src={marca.logoUrl} alt={marca.nombre} width={48} height={48} className="rounded-full" />}
              </Link>
            ))}
          </Reveal>

          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {[
              { icon: Truck, titulo: "Entrega Rápida", texto: "Coordinamos tu pedido directamente por WhatsApp." },
              { icon: Gem, titulo: "Calidad Premium", texto: "Solo trabajamos con marcas de alta cosmética." },
              { icon: ShieldCheck, titulo: "Compra Segura", texto: "Atención personalizada en cada pedido." },
              { icon: HeartHandshake, titulo: "Hecho con Amor", texto: "Seleccionamos cada producto pensando en ti." },
            ].map((item, i) => (
              <Reveal key={item.titulo} delay={i * 0.1}>
                <item.icon className="mx-auto mb-2 text-accent-strong" size={28} />
                <h4 className="mb-1 text-sm font-semibold">{item.titulo}</h4>
                <p className="text-xs text-text-muted">{item.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal direction="zoom">
            <div className="rounded-3xl bg-gradient-to-br from-brand-pink-makeup to-brand-gold p-10 text-center text-white sm:p-16">
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">Únete al Club Èclat</h3>
              <p className="mb-8 text-white/85">Sé la primera en enterarte de nuevos lanzamientos y promociones exclusivas.</p>
              <NewsletterForm variant="section" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

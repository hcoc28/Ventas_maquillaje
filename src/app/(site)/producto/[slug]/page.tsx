import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductTabs } from "@/components/product/product-tabs";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { ProductCard } from "@/components/product/product-card";
import { getDetalleProducto, getSlugsActivos } from "@/services/producto.service";
import { formatearMoneda } from "@/lib/utils";
import { jsonLdHtml } from "@/lib/json-ld";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

interface ProductoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getSlugsActivos();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getDetalleProducto(slug);
  if (!producto) return { title: "Producto no encontrado" };

  const imagen = producto.imagenes[0]?.url;

  return {
    title: producto.nombre,
    description: producto.descripcionCorta,
    alternates: { canonical: `/producto/${slug}` },
    openGraph: {
      title: producto.nombre,
      description: producto.descripcionCorta,
      url: `${siteConfig.url}/producto/${slug}`,
      images: imagen ? [imagen] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: producto.nombre,
      description: producto.descripcionCorta,
      images: imagen ? [imagen] : [],
    },
  };
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { slug } = await params;
  const producto = await getDetalleProducto(slug);

  if (!producto) {
    notFound();
  }

  const estrellas = Math.round(producto.calificacionPromedio);

  const productoJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: producto.nombre,
    description: producto.descripcionCorta,
    image: producto.imagenes.map((img) => img.url),
    brand: { "@type": "Brand", name: producto.marcaNombre },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/producto/${slug}`,
      priceCurrency: "GTQ",
      price: producto.precioFinal,
      availability: producto.hayStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    ...(producto.totalOpiniones > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: producto.calificacionPromedio,
        reviewCount: producto.totalOpiniones,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: producto.categoriaNombre,
        item: `${siteConfig.url}/catalogo?categoria=${producto.categoriaSlug}`,
      },
      { "@type": "ListItem", position: 3, name: producto.nombre, item: `${siteConfig.url}/producto/${slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(productoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }} />
      <nav className="mb-6 text-xs text-text-muted">
        <Link href="/" className="hover:text-foreground">Inicio</Link> /{" "}
        <Link href={`/catalogo?categoria=${producto.categoriaSlug}`} className="hover:text-foreground">{producto.categoriaNombre}</Link> /{" "}
        <span>{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductGallery imagenes={producto.imagenes} nombre={producto.nombre} />

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-strong">{producto.marcaNombre}</span>
          <h1 className="mb-2 mt-1 font-[family-name:var(--font-display)] text-3xl sm:text-4xl">{producto.nombre}</h1>

          <div className="mb-4 flex items-center gap-1 text-brand-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < estrellas ? "★" : "☆"}</span>
            ))}
            <span className="ml-1 text-sm text-text-muted">({producto.totalOpiniones} opiniones)</span>
          </div>

          <div className="mb-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatearMoneda(producto.precioFinal)}</span>
            {producto.porcentajeDescuento && (
              <>
                <span className="text-lg text-text-muted line-through">{formatearMoneda(producto.precio)}</span>
                <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">-{producto.porcentajeDescuento.toFixed(0)}%</span>
              </>
            )}
          </div>

          <p className="mb-8 text-text-muted">{producto.descripcionCorta}</p>

          <AddToCartPanel productoId={producto.id} stock={producto.stock} hayStock={producto.hayStock} />

          <div className="mt-10">
            <ProductTabs
              descripcionLarga={producto.descripcionLarga}
              beneficios={producto.beneficios}
              ingredientes={producto.ingredientes}
              modoUso={producto.modoUso}
              opiniones={producto.opiniones}
            />
          </div>
        </div>
      </div>

      {producto.relacionados.length > 0 && (
        <section className="mt-20">
          <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-accent-strong">También te puede interesar</span>
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-2xl">Productos relacionados</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {producto.relacionados.map((r, i) => (
              <ProductCard key={r.id} producto={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

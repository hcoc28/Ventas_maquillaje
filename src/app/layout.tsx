import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { siteConfig } from "@/config/site";
import { jsonLdHtml } from "@/lib/json-ld";
import "./globals.css";

const organizacionJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.nombreCompleto,
  url: siteConfig.url,
  description: siteConfig.descripcion,
};

const sitioWebJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.nombreCompleto,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/catalogo?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.nombreCompleto} · Brilla con suavidad, florece con estilo`,
    template: `%s · ${siteConfig.nombreCompleto}`,
  },
  description: siteConfig.descripcion,
  metadataBase: new URL(siteConfig.url),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "es_GT",
    siteName: siteConfig.nombreCompleto,
    title: `${siteConfig.nombreCompleto} · Brilla con suavidad, florece con estilo`,
    description: siteConfig.descripcion,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.nombreCompleto} · Brilla con suavidad, florece con estilo`,
    description: siteConfig.descripcion,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${playfairDisplay.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#contenido-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-black focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Saltar al contenido principal
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(organizacionJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(sitioWebJsonLd) }} />
        <GoogleAnalytics />
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

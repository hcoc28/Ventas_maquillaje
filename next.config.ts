import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// 'unsafe-eval' solo hace falta en desarrollo (React lo usa para reconstruir stack traces del
// servidor en el navegador) — ni React ni Next.js lo necesitan en producción por defecto.
const esDesarrollo = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://images.unsplash.com https://res.cloudinary.com https://www.google-analytics.com data: blob:",
  "font-src 'self' data:",
  // GA4 a veces manda los beacons a un endpoint regional (ej. region1.google-analytics.com) en
  // vez del dominio principal, y el DSN de Sentry ahora suele incluir la región (ej.
  // oXXXX.ingest.us.sentry.io) — sin estos patrones, ambos quedarían bloqueados en silencio.
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["pouch-swimwear-freedom.ngrok-free.dev"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Sin SENTRY_AUTH_TOKEN no se suben source maps (los stack traces en producción se ven
  // minificados) — funciona igual para capturar errores, solo menos legibles hasta que se
  // configure ese token.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
  telemetry: false,
});

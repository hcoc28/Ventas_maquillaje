import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { rateLimit } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

const RUTAS_PUBLICAS_CUENTA = ["/cuenta/iniciar-sesion", "/cuenta/registro"];

const RUTAS_LIMITADAS: { ruta: string; limite: number; ventanaMs: number }[] = [
  { ruta: "/api/auth/callback/credentials", limite: 8, ventanaMs: 60_000 },
  { ruta: "/api/auth/registro", limite: 5, ventanaMs: 60_000 },
  { ruta: "/api/newsletter", limite: 5, ventanaMs: 60_000 },
  { ruta: "/api/contacto", limite: 5, ventanaMs: 60_000 },
  { ruta: "/api/pedidos", limite: 10, ventanaMs: 60_000 },
  { ruta: "/api/favoritos/alternar", limite: 30, ventanaMs: 60_000 },
];

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const esApi = pathname.startsWith("/api/");
  const esRutaCuenta = pathname.startsWith("/cuenta") && !RUTAS_PUBLICAS_CUENTA.some((r) => pathname.startsWith(r));
  const esRutaAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  const rutaLimitada = RUTAS_LIMITADAS.find((r) => pathname === r.ruta);
  if (rutaLimitada) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
    const permitido = rateLimit(`${rutaLimitada.ruta}:${ip}`, rutaLimitada.limite, rutaLimitada.ventanaMs);
    if (!permitido) {
      return NextResponse.json({ mensaje: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." }, { status: 429 });
    }
  }

  if ((esRutaCuenta || esRutaAdmin) && !request.auth) {
    if (esApi) return NextResponse.json({ mensaje: "No autenticado." }, { status: 401 });
    const url = new URL("/cuenta/iniciar-sesion", request.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (esRutaAdmin && request.auth?.user.role !== "Administrador" && request.auth?.user.role !== "Empleado") {
    if (esApi) return NextResponse.json({ mensaje: "No autorizado." }, { status: 403 });
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/cuenta/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/auth/callback/credentials",
    "/api/auth/registro",
    "/api/newsletter",
    "/api/contacto",
    "/api/pedidos",
    "/api/favoritos/alternar",
  ],
};

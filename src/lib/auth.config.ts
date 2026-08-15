import type { NextAuthConfig } from "next-auth";
import { getUsuarioPorId } from "@/server/repositories/usuario.repository";

export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/cuenta/iniciar-sesion",
    error: "/cuenta/iniciar-sesion",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        return token;
      }

      // Sin esto, desactivar una cuenta o cambiarle el rol no tiene efecto hasta que el JWT
      // expire (hasta 30 días) — se revalida contra la base de datos en cada request a una ruta
      // protegida (proxy.ts solo cubre /cuenta, /admin y un puñado de rutas de API, así que esto
      // no golpea la base de datos en cada vista pública del catálogo).
      if (token.id) {
        const usuario = await getUsuarioPorId(Number(token.id));
        if (!usuario || !usuario.activo) {
          token.id = undefined;
          token.role = undefined;
          return token;
        }
        token.role = usuario.role.nombre;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "";
      }
      return session;
    },
  },
};

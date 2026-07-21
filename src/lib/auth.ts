import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUsuarioPorEmail } from "@/server/repositories/usuario.repository";
import { registrarActividad } from "@/server/services/log.service";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const usuario = await getUsuarioPorEmail(email);
        if (!usuario || !usuario.activo) return null;

        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!passwordValida) return null;

        await registrarActividad(usuario.id, "Inicio de sesión");

        return {
          id: String(usuario.id),
          name: `${usuario.nombre} ${usuario.apellido}`,
          email: usuario.email,
          role: usuario.role.nombre,
        };
      },
    }),
  ],
});

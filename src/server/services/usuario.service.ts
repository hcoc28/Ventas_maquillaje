import crypto from "crypto";
import bcrypt from "bcryptjs";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { enviarEmail, plantillaBase } from "@/server/services/email.service";
import { siteConfig } from "@/config/site";
import type { Resultado } from "@/types/carrito";

const VIGENCIA_TOKEN_MS = 60 * 60 * 1000; // 1 hora

export interface PerfilDto {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string | null;
  email: string;
  fechaRegistro: string;
  rol: string;
}

export async function registrarUsuario(data: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
}): Promise<Resultado<{ id: number }>> {
  const existente = await usuarioRepo.getUsuarioPorEmail(data.email);
  if (existente) {
    // Mensaje deliberadamente genérico: no confirmamos si el correo ya está registrado,
    // para no permitir que alguien enumere cuentas existentes probando el formulario.
    return { exitoso: false, errores: ["No pudimos crear la cuenta con estos datos. Si ya tienes una cuenta, intenta iniciar sesión."] };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const usuario = await usuarioRepo.crearUsuario({
    nombre: data.nombre,
    apellido: data.apellido,
    email: data.email,
    passwordHash,
    telefono: data.telefono,
    roleNombre: "Cliente",
  });

  await enviarEmail({
    to: data.email,
    subject: `¡Bienvenida a ${siteConfig.nombreCompleto}!`,
    html: plantillaBase(`
      <h1 style="font-size: 18px; margin-bottom: 12px;">¡Hola, ${data.nombre}! 🌸</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        Gracias por crear tu cuenta en ${siteConfig.nombreCompleto}. Ya puedes explorar el catálogo,
        guardar tus favoritos y hacer seguimiento de tus pedidos desde tu cuenta.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${siteConfig.url}/catalogo" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          Explorar catálogo
        </a>
      </div>
    `),
  });

  return { exitoso: true, valor: { id: usuario.id } };
}

export async function obtenerPerfil(userId: number): Promise<PerfilDto | null> {
  const usuario = await usuarioRepo.getUsuarioPorId(userId);
  if (!usuario) return null;

  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono ?? "",
    direccion: usuario.direccion,
    email: usuario.email,
    fechaRegistro: usuario.createdAt.toISOString(),
    rol: usuario.role.nombre,
  };
}

export async function actualizarPerfil(
  userId: number,
  data: { nombre: string; apellido: string; telefono: string; direccion?: string }
): Promise<Resultado<boolean>> {
  await usuarioRepo.actualizarPerfil(userId, {
    nombre: data.nombre,
    apellido: data.apellido,
    telefono: data.telefono,
    direccion: data.direccion || null,
  });
  return { exitoso: true, valor: true };
}

export async function getTodosLosUsuariosAdmin() {
  return usuarioRepo.getTodosLosUsuarios();
}

export async function actualizarEstadoUsuario(userId: number, activo: boolean) {
  return usuarioRepo.actualizarEstadoUsuario(userId, activo);
}

export async function solicitarRecuperacionPassword(email: string): Promise<void> {
  const usuario = await usuarioRepo.getUsuarioPorEmail(email);
  // Sin importar si el correo existe o no, la función no revela nada distinto a quien la llama
  // (misma respuesta genérica en la ruta de API) — evita enumeración de cuentas.
  if (!usuario) return;

  await usuarioRepo.invalidarTokensRecuperacion(usuario.id);

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VIGENCIA_TOKEN_MS);
  await usuarioRepo.crearTokenRecuperacion(usuario.id, token, expiresAt);

  const enlace = `${siteConfig.url}/cuenta/restablecer?token=${token}`;
  await enviarEmail({
    to: usuario.email,
    subject: "Restablece tu contraseña",
    html: plantillaBase(`
      <h1 style="font-size: 18px; margin-bottom: 12px;">Restablece tu contraseña</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${siteConfig.nombreCompleto}.
        Este enlace es válido por 1 hora. Si no fuiste tú, puedes ignorar este correo.
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${enlace}" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          Restablecer contraseña
        </a>
      </div>
      <p style="font-size: 12px; color: #888;">Si el botón no funciona, copia y pega este enlace: ${enlace}</p>
    `),
  });
}

export async function restablecerPassword(token: string, nuevaPassword: string): Promise<Resultado<boolean>> {
  const tokenValido = await usuarioRepo.getTokenRecuperacionValido(token);
  if (!tokenValido) {
    return { exitoso: false, errores: ["Este enlace no es válido o ya expiró. Solicita uno nuevo."] };
  }

  const passwordHash = await bcrypt.hash(nuevaPassword, 12);
  await usuarioRepo.actualizarPassword(tokenValido.userId, passwordHash);
  await usuarioRepo.marcarTokenUsado(tokenValido.id);
  await usuarioRepo.invalidarTokensRecuperacion(tokenValido.userId);

  return { exitoso: true, valor: true };
}

export async function cambiarPassword(
  userId: number,
  passwordActual: string,
  passwordNueva: string
): Promise<Resultado<boolean>> {
  const usuario = await usuarioRepo.getUsuarioPorId(userId);
  if (!usuario) {
    return { exitoso: false, errores: ["Usuario no encontrado."] };
  }

  const coincide = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!coincide) {
    return { exitoso: false, errores: ["La contraseña actual no es correcta."] };
  }

  const passwordHash = await bcrypt.hash(passwordNueva, 12);
  await usuarioRepo.actualizarPassword(userId, passwordHash);

  return { exitoso: true, valor: true };
}

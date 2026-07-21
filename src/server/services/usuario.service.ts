import bcrypt from "bcryptjs";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import type { Resultado } from "@/types/carrito";

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
    return { exitoso: false, errores: ["Ya existe una cuenta con este correo electrónico."] };
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

export async function actualizarRolYEstado(userId: number, data: { roleNombre: string; activo: boolean }) {
  return usuarioRepo.actualizarRolYEstado(userId, data);
}

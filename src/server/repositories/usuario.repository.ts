import { prisma } from "@/lib/prisma";

export async function getUsuarioPorEmail(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { role: true } });
}

export async function getUsuarioPorId(id: number) {
  return prisma.user.findUnique({ where: { id }, include: { role: true } });
}

export async function crearUsuario(data: {
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  telefono: string;
  roleNombre: string;
}) {
  const role = await prisma.role.findUniqueOrThrow({ where: { nombre: data.roleNombre } });
  return prisma.user.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      passwordHash: data.passwordHash,
      telefono: data.telefono,
      roleId: role.id,
    },
  });
}

export async function actualizarPerfil(
  userId: number,
  data: { nombre: string; apellido: string; telefono: string; direccion?: string | null }
) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function getTodosLosUsuarios() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
      telefono: true,
      activo: true,
      createdAt: true,
      role: { select: { id: true, nombre: true } },
      _count: { select: { orders: true } },
    },
  });
}

export async function actualizarEstadoUsuario(userId: number, activo: boolean) {
  return prisma.user.update({ where: { id: userId }, data: { activo } });
}

export async function actualizarPassword(userId: number, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function crearTokenRecuperacion(userId: number, token: string, expiresAt: Date) {
  return prisma.passwordResetToken.create({ data: { userId, token, expiresAt } });
}

export async function getTokenRecuperacionValido(token: string) {
  return prisma.passwordResetToken.findFirst({
    where: { token, usedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
}

export async function marcarTokenUsado(id: number) {
  return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}

export async function invalidarTokensRecuperacion(userId: number) {
  return prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
}

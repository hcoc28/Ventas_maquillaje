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
    include: { role: true, _count: { select: { orders: true } } },
  });
}

export async function actualizarRolYEstado(userId: number, data: { roleNombre: string; activo: boolean }) {
  const role = await prisma.role.findUniqueOrThrow({ where: { nombre: data.roleNombre } });
  return prisma.user.update({ where: { id: userId }, data: { roleId: role.id, activo: data.activo } });
}

import { prisma } from "@/lib/prisma";

export async function guardarMensajeContacto(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}) {
  return prisma.contactMessage.create({ data });
}

export async function getTodosLosMensajesAdmin() {
  return prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
}

export async function marcarLeido(id: number) {
  return prisma.contactMessage.update({ where: { id }, data: { leido: true } });
}

export async function cambiarLeido(id: number, leido: boolean) {
  return prisma.contactMessage.update({ where: { id }, data: { leido } });
}

export async function eliminarMensaje(id: number) {
  return prisma.contactMessage.delete({ where: { id } });
}

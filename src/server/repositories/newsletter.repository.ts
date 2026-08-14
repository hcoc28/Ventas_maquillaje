import { prisma } from "@/lib/prisma";

export async function suscribir(email: string) {
  const existente = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existente) return existente;
  return prisma.newsletterSubscriber.create({ data: { email } });
}

export async function getTodosLosSuscriptoresAdmin() {
  return prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
}

export async function actualizarEstadoSuscriptor(id: number, activo: boolean) {
  return prisma.newsletterSubscriber.update({ where: { id }, data: { activo } });
}

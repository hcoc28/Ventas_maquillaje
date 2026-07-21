import { prisma } from "@/lib/prisma";

export async function suscribir(email: string) {
  const existente = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existente) return existente;
  return prisma.newsletterSubscriber.create({ data: { email } });
}

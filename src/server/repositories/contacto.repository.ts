import { prisma } from "@/lib/prisma";

export async function guardarMensajeContacto(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}) {
  return prisma.contactMessage.create({ data });
}

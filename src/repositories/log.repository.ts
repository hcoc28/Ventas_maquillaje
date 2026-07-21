import { prisma } from "@/lib/prisma";

export async function crearActivityLog(data: { userId: number | null; accion: string; detalle?: string }) {
  return prisma.activityLog.create({
    data: { userId: data.userId, accion: data.accion, detalle: data.detalle ?? null },
  });
}

export async function crearAuditLog(data: {
  entidad: string;
  entidadId: number;
  accion: string;
  valoresPrevios?: unknown;
  valoresNuevos?: unknown;
  userId: number | null;
}) {
  return prisma.auditLog.create({
    data: {
      entidad: data.entidad,
      entidadId: data.entidadId,
      accion: data.accion,
      valoresPrevios: data.valoresPrevios ? JSON.stringify(data.valoresPrevios) : null,
      valoresNuevos: data.valoresNuevos ? JSON.stringify(data.valoresNuevos) : null,
      userId: data.userId,
    },
  });
}

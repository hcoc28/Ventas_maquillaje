import * as logRepo from "@/server/repositories/log.repository";

export async function registrarActividad(userId: number | null, accion: string, detalle?: string) {
  try {
    await logRepo.crearActivityLog({ userId, accion, detalle });
  } catch {
    /* el registro de actividad nunca debe interrumpir la operación principal */
  }
}

export async function registrarAuditoria(data: {
  entidad: string;
  entidadId: number;
  accion: "crear" | "actualizar" | "eliminar";
  valoresPrevios?: unknown;
  valoresNuevos?: unknown;
  userId: number | null;
}) {
  try {
    await logRepo.crearAuditLog(data);
  } catch {
    /* el registro de auditoría nunca debe interrumpir la operación principal */
  }
}

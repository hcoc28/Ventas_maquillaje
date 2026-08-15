import { prisma } from "@/lib/prisma";

const ID_CONFIGURACION = 1;

/** Fila unica de configuracion (id=1); se crea con los valores por defecto si todavia no existe. */
export async function getConfiguracion() {
  return prisma.siteSetting.upsert({
    where: { id: ID_CONFIGURACION },
    update: {},
    create: { id: ID_CONFIGURACION },
  });
}

export async function actualizarConfiguracion(data: {
  mostrarFiltroMarcas: boolean;
  nombreEmpresa: string;
  descripcionEmpresa: string;
  whatsappNumero: string;
  emailNotificaciones?: string | null;
  direccionEmpresa?: string | null;
}) {
  return prisma.siteSetting.upsert({
    where: { id: ID_CONFIGURACION },
    update: data,
    create: { id: ID_CONFIGURACION, ...data },
  });
}

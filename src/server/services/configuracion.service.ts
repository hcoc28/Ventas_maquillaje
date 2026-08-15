import * as configuracionRepo from "@/server/repositories/configuracion.repository";
import type { ConfiguracionAdminInput } from "@/validators/admin";

function mapearConfiguracion(config: Awaited<ReturnType<typeof configuracionRepo.getConfiguracion>>) {
  return {
    mostrarFiltroMarcas: config.mostrarFiltroMarcas,
    nombreEmpresa: config.nombreEmpresa,
    descripcionEmpresa: config.descripcionEmpresa,
    whatsappNumero: config.whatsappNumero,
    emailNotificaciones: config.emailNotificaciones ?? "",
    direccionEmpresa: config.direccionEmpresa ?? "",
  };
}

export async function getConfiguracion() {
  const config = await configuracionRepo.getConfiguracion();
  return mapearConfiguracion(config);
}

export async function actualizarConfiguracionAdmin(data: ConfiguracionAdminInput) {
  const config = await configuracionRepo.actualizarConfiguracion({
    mostrarFiltroMarcas: data.mostrarFiltroMarcas,
    nombreEmpresa: data.nombreEmpresa,
    descripcionEmpresa: data.descripcionEmpresa,
    whatsappNumero: data.whatsappNumero,
    emailNotificaciones: data.emailNotificaciones || null,
    direccionEmpresa: data.direccionEmpresa || null,
  });
  return mapearConfiguracion(config);
}

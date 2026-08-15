import * as configuracionRepo from "@/server/repositories/configuracion.repository";

export async function getConfiguracion() {
  const config = await configuracionRepo.getConfiguracion();
  return { mostrarFiltroMarcas: config.mostrarFiltroMarcas };
}

export async function actualizarConfiguracionAdmin(data: { mostrarFiltroMarcas: boolean }) {
  const config = await configuracionRepo.actualizarConfiguracion(data);
  return { mostrarFiltroMarcas: config.mostrarFiltroMarcas };
}

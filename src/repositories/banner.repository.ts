import { prisma } from "@/lib/prisma";
import type { BannerAdminInput } from "@/validators/admin";

export async function getBannersActivos() {
  return prisma.banner.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });
}

export async function getTodosLosBanners() {
  return prisma.banner.findMany({ orderBy: { orden: "asc" } });
}

export async function getBannerPorId(id: number) {
  return prisma.banner.findUnique({ where: { id } });
}

function datosBanner(data: BannerAdminInput) {
  return {
    titulo: data.titulo,
    subtitulo: data.subtitulo || null,
    imagenUrl: data.imagenUrl,
    textoBotonPrimario: data.textoBotonPrimario || null,
    urlBotonPrimario: data.urlBotonPrimario || null,
    orden: data.orden,
    activo: data.activo,
  };
}

export async function crearBanner(data: BannerAdminInput) {
  return prisma.banner.create({ data: datosBanner(data) });
}

export async function actualizarBanner(id: number, data: BannerAdminInput) {
  return prisma.banner.update({ where: { id }, data: datosBanner(data) });
}

export async function eliminarBanner(id: number) {
  return prisma.banner.delete({ where: { id } });
}

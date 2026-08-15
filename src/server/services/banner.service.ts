import * as bannerRepo from "@/server/repositories/banner.repository";
import type { BannerDto } from "@/types/catalogo";
import type { BannerAdminInput } from "@/validators/admin";

export async function getBannersActivos(): Promise<BannerDto[]> {
  const banners = await bannerRepo.getBannersActivos();
  return banners.map((b) => ({
    titulo: b.titulo,
    subtitulo: b.subtitulo,
    imagenUrl: b.imagenUrl,
    textoBotonPrimario: b.textoBotonPrimario,
    urlBotonPrimario: b.urlBotonPrimario,
  }));
}

export async function getTodosLosBannersAdmin() {
  return bannerRepo.getTodosLosBanners();
}

export async function getBannerPorId(id: number) {
  return bannerRepo.getBannerPorId(id);
}

export async function crearBanner(data: BannerAdminInput) {
  return bannerRepo.crearBanner(data);
}

export async function actualizarBanner(id: number, data: BannerAdminInput) {
  return bannerRepo.actualizarBanner(id, data);
}

export async function eliminarBanner(id: number) {
  return bannerRepo.eliminarBanner(id);
}

export async function cambiarEstadoBanner(id: number, activo: boolean) {
  return bannerRepo.cambiarEstadoBanner(id, activo);
}

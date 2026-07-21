import * as marcaRepo from "@/server/repositories/marca.repository";
import type { MarcaDto } from "@/types/catalogo";
import type { MarcaAdminInput } from "@/validators/admin";

export async function getMarcasActivas(): Promise<MarcaDto[]> {
  const [marcas, conteos] = await Promise.all([
    marcaRepo.getMarcasActivas(),
    marcaRepo.getConteoProductosPorMarca(),
  ]);

  return marcas.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    slug: m.slug,
    descripcion: m.descripcion,
    logoUrl: m.logoUrl,
    totalProductos: conteos.get(m.id) ?? 0,
  }));
}

export async function getTodasLasMarcasAdmin() {
  return marcaRepo.getTodasLasMarcas();
}

export async function getMarcaPorId(id: number) {
  return marcaRepo.getMarcaPorId(id);
}

export async function crearMarca(data: MarcaAdminInput) {
  return marcaRepo.crearMarca(data);
}

export async function actualizarMarca(id: number, data: MarcaAdminInput) {
  return marcaRepo.actualizarMarca(id, data);
}

export async function eliminarMarca(id: number) {
  return marcaRepo.eliminarMarca(id);
}

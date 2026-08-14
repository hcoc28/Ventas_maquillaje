import * as categoriaRepo from "@/server/repositories/categoria.repository";
import type { CategoriaDto } from "@/types/catalogo";
import type { CategoriaAdminInput } from "@/validators/admin";

export async function getCategoriasActivas(): Promise<CategoriaDto[]> {
  const [categorias, conteos] = await Promise.all([
    categoriaRepo.getCategoriasActivas(),
    categoriaRepo.getConteoProductosPorCategoria(),
  ]);

  return categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    descripcion: c.descripcion,
    imagenUrl: c.imagenUrl,
    icono: c.icono,
    totalProductos: conteos.get(c.id) ?? 0,
  }));
}

export async function getTodasLasCategoriasAdmin(soloActivas?: boolean) {
  return categoriaRepo.getTodasLasCategorias(soloActivas);
}

export async function getCategoriaPorId(id: number) {
  return categoriaRepo.getCategoriaPorId(id);
}

export async function crearCategoria(data: CategoriaAdminInput) {
  return categoriaRepo.crearCategoria(data);
}

export async function actualizarCategoria(id: number, data: CategoriaAdminInput) {
  return categoriaRepo.actualizarCategoria(id, data);
}

export async function eliminarCategoria(id: number) {
  return categoriaRepo.eliminarCategoria(id);
}

export async function activarCategoria(id: number) {
  return categoriaRepo.activarCategoria(id);
}

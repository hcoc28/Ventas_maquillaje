import { prisma } from "@/lib/prisma";
import type { CategoriaAdminInput } from "@/validators/admin";

export async function getCategoriasActivas() {
  return prisma.category.findMany({ where: { activo: true }, orderBy: { orden: "asc" } });
}

export async function getCategoriaBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, activo: true } });
}

export async function getConteoProductosPorCategoria(): Promise<Map<number, number>> {
  const grupos = await prisma.product.groupBy({
    by: ["categoryId"],
    where: { activo: true },
    _count: { _all: true },
  });
  return new Map(grupos.map((g) => [g.categoryId, g._count._all]));
}

export async function getTodasLasCategorias() {
  return prisma.category.findMany({
    orderBy: { orden: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategoriaPorId(id: number) {
  return prisma.category.findUnique({ where: { id } });
}

function datosCategoria(data: CategoriaAdminInput) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion || null,
    imagenUrl: data.imagenUrl || null,
    icono: data.icono || null,
    orden: data.orden,
    activo: data.activo,
  };
}

export async function crearCategoria(data: CategoriaAdminInput) {
  return prisma.category.create({ data: datosCategoria(data) });
}

export async function actualizarCategoria(id: number, data: CategoriaAdminInput) {
  return prisma.category.update({ where: { id }, data: datosCategoria(data) });
}

export async function eliminarCategoria(id: number) {
  return prisma.category.update({ where: { id }, data: { activo: false, deletedAt: new Date() } });
}

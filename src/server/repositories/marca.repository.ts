import { prisma } from "@/lib/prisma";
import type { MarcaAdminInput } from "@/validators/admin";

export async function getMarcasActivas() {
  return prisma.brand.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } });
}

export async function getMarcaBySlug(slug: string) {
  return prisma.brand.findFirst({ where: { slug, activo: true } });
}

export async function getConteoProductosPorMarca(): Promise<Map<number, number>> {
  const grupos = await prisma.product.groupBy({
    by: ["brandId"],
    where: { activo: true },
    _count: { _all: true },
  });
  return new Map(grupos.map((g) => [g.brandId, g._count._all]));
}

export async function getTodasLasMarcas(soloActivas?: boolean) {
  return prisma.brand.findMany({
    where: soloActivas ? { activo: true } : undefined,
    orderBy: { nombre: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function getMarcaPorId(id: number) {
  return prisma.brand.findUnique({ where: { id } });
}

function datosMarca(data: MarcaAdminInput) {
  return {
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion || null,
    logoUrl: data.logoUrl || null,
    activo: data.activo,
  };
}

export async function crearMarca(data: MarcaAdminInput) {
  return prisma.brand.create({ data: datosMarca(data) });
}

export async function actualizarMarca(id: number, data: MarcaAdminInput) {
  return prisma.brand.update({ where: { id }, data: datosMarca(data) });
}

export async function eliminarMarca(id: number) {
  return prisma.brand.update({ where: { id }, data: { activo: false, deletedAt: new Date() } });
}

export async function activarMarca(id: number) {
  return prisma.brand.update({ where: { id }, data: { activo: true, deletedAt: null } });
}

export async function eliminarMarcaPermanente(id: number) {
  const productos = await prisma.product.count({ where: { brandId: id } });
  if (productos > 0) {
    throw new Error("No se puede eliminar una marca con productos asociados. Desactívala o mueve sus productos primero.");
  }
  return prisma.brand.delete({ where: { id } });
}

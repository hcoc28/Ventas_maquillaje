import { prisma } from "@/lib/prisma";

export async function getProductosFavoritos(userId: number) {
  const favoritos = await prisma.favorite.findMany({
    where: { userId, product: { activo: true } },
    include: {
      product: {
        include: {
          category: true,
          brand: true,
          promotion: true,
          inventory: true,
          images: { orderBy: { orden: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return favoritos.map((f) => f.product);
}

export async function existeFavorito(userId: number, productId: number) {
  const favorito = await prisma.favorite.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  return favorito !== null;
}

export async function agregarFavorito(userId: number, productId: number) {
  await prisma.favorite.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

export async function quitarFavorito(userId: number, productId: number) {
  await prisma.favorite.deleteMany({ where: { userId, productId } });
}

export async function getIdsFavoritos(userId: number): Promise<number[]> {
  const favoritos = await prisma.favorite.findMany({ where: { userId }, select: { productId: true } });
  return favoritos.map((f) => f.productId);
}

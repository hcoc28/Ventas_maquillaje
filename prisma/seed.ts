import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER!,
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: { trustServerCertificate: true, encrypt: true },
});

const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL_DEFAULT = "amour@gmail.com";
const ADMIN_EMAIL_ANTERIOR = "admin@eclatmaquillaje.com";
const EMAILS_CLIENTES_DEMO = ["maria.gonzalez@example.com", "ana.martinez@example.com", "lucia.ramirez@example.com"];
const PEDIDOS_DEMO = Array.from({ length: 8 }, (_, index) => `ORD-2026-${1000 + index}`);
const CATEGORIAS_DEMO = [
  "labiales",
  "bases",
  "correctores",
  "rubores",
  "sombras",
  "mascaras",
  "delineadores",
  "brochas",
  "iluminadores",
  "polvos",
  "skincare",
];
const MARCAS_DEMO = [
  "lumiere-paris",
  "velvet-noir",
  "rose-atelier",
  "maison-eclat",
  "nova-beauty",
  "satin-silk",
  "bloom-cosmetics",
  "ombre-luxe",
];
const PROMOCIONES_DEMO = ["Venta de Verano", "Black Friday Beauty", "Skincare Week", "Edición Especial Ojos"];
const BANNERS_DEMO = [
  "Belleza que se define en ti",
  "Edición Limitada Midnight",
  "Skincare que transforma",
  "Hasta 30% de descuento",
];
const PRODUCTOS_DEMO = [
  "labial-velvet-rouge",
  "labial-satin-kiss",
  "labial-gloss-diamond",
  "base-hd-perfeccion-infinita",
  "base-velvet-matte-24h",
  "base-luminous-skin-tint",
  "corrector-bright-eyes",
  "corrector-full-coverage-pro",
  "rubor-blossom-glow",
  "rubor-cream-flush",
  "paleta-sombras-sunset-muse",
  "paleta-sombras-midnight-velvet",
  "mascara-volume-extreme",
  "mascara-curl-lift-48h",
  "delineador-precision-ink",
  "delineador-gel-waterproof",
  "set-brochas-luxe-collection",
  "brocha-kabuki-base-perfecta",
  "iluminador-liquid-glow",
  "iluminador-en-polvo-diamond-dust",
  "polvo-compacto-matte-finish",
  "polvo-suelto-hd-setting",
  "serum-vitamina-c-radiance",
  "crema-hidratante-24h-barrier",
  "protector-solar-invisible-spf50",
  "serum-acido-hialuronico-plump",
  "contorno-de-ojos-renew",
  "labial-liquid-matte-extreme",
  "base-cushion-glow-compact",
  "paleta-rubor-iluminador-duo",
  "sombra-individual-metallic-foil",
  "brocha-difuminadora-sombras-pro",
  "mascarilla-facial-detox-clay",
];

async function limpiarDatosDemo() {
  console.log("Limpiando datos demo conocidos...");

  await prisma.review.deleteMany({
    where: {
      OR: [
        { user: { email: { in: EMAILS_CLIENTES_DEMO } } },
        { product: { slug: { in: PRODUCTOS_DEMO } } },
      ],
    },
  });
  await prisma.order.deleteMany({ where: { numeroPedido: { in: PEDIDOS_DEMO } } });
  await prisma.cartItem.deleteMany({ where: { product: { slug: { in: PRODUCTOS_DEMO } } } });
  await prisma.cartItem.deleteMany({ where: { cart: { user: { email: { in: EMAILS_CLIENTES_DEMO } } } } });
  await prisma.cart.deleteMany({ where: { user: { email: { in: EMAILS_CLIENTES_DEMO } } } });
  await prisma.favorite.deleteMany({ where: { product: { slug: { in: PRODUCTOS_DEMO } } } });
  await prisma.product.updateMany({
    where: { slug: { in: PRODUCTOS_DEMO } },
    data: { activo: false, deletedAt: new Date() },
  });
  await prisma.product.deleteMany({
    where: {
      slug: { in: PRODUCTOS_DEMO },
      orderDetails: { none: {} },
      reviews: { none: {} },
      favorites: { none: {} },
      cartItems: { none: {} },
    },
  });
  await prisma.user.deleteMany({ where: { email: { in: EMAILS_CLIENTES_DEMO } } });
  await prisma.banner.deleteMany({ where: { titulo: { in: BANNERS_DEMO } } });
  await prisma.promotion.deleteMany({ where: { nombre: { in: PROMOCIONES_DEMO }, products: { none: {} } } });
  await prisma.brand.deleteMany({ where: { slug: { in: MARCAS_DEMO }, products: { none: {} } } });
  await prisma.category.deleteMany({ where: { slug: { in: CATEGORIAS_DEMO }, products: { none: {} } } });
}

async function main() {
  console.log("Preparando roles base...");
  const roleAdmin = await prisma.role.upsert({
    where: { nombre: "Administrador" },
    update: {},
    create: { nombre: "Administrador" },
  });
  await prisma.role.upsert({ where: { nombre: "Empleado" }, update: {}, create: { nombre: "Empleado" } });
  await prisma.role.upsert({ where: { nombre: "Cliente" }, update: {}, create: { nombre: "Cliente" } });

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? ADMIN_EMAIL_DEFAULT).trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "SEED_ADMIN_PASSWORD es obligatorio para crear o actualizar el administrador inicial."
    );
  }

  console.log("Preparando usuario administrador...");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      nombre: "Administrador",
      apellido: "Amour",
      passwordHash,
      roleId: roleAdmin.id,
      activo: true,
      deletedAt: null,
    },
    create: {
      nombre: "Administrador",
      apellido: "Amour",
      email: adminEmail,
      passwordHash,
      telefono: process.env.SEED_ADMIN_PHONE ?? null,
      roleId: roleAdmin.id,
      activo: true,
    },
  });

  if (adminEmail !== ADMIN_EMAIL_ANTERIOR) {
    await prisma.user.updateMany({
      where: { email: ADMIN_EMAIL_ANTERIOR },
      data: {
        activo: false,
        deletedAt: new Date(),
      },
    });
  }

  await limpiarDatosDemo();

  console.log("Seed minimo completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

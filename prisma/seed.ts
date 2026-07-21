import "dotenv/config";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { bannersSeed, categoriasSeed, marcasSeed, productosSeed, promocionesSeed } from "./seed-data";

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER!,
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: { trustServerCertificate: true, encrypt: true },
});

const prisma = new PrismaClient({ adapter });

function slugifyNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Sembrando roles...");
  const roleAdmin = await prisma.role.upsert({
    where: { nombre: "Administrador" },
    update: {},
    create: { nombre: "Administrador" },
  });
  await prisma.role.upsert({ where: { nombre: "Empleado" }, update: {}, create: { nombre: "Empleado" } });
  await prisma.role.upsert({ where: { nombre: "Cliente" }, update: {}, create: { nombre: "Cliente" } });

  console.log("Sembrando usuario administrador...");
  const adminEmail = "admin@eclatmaquillaje.com";
  const passwordHash = await bcrypt.hash("Admin#2026!", 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nombre: "Administrador",
      apellido: "Èclat",
      email: adminEmail,
      passwordHash,
      telefono: "50212345678",
      roleId: roleAdmin.id,
    },
  });

  const existentes = await prisma.category.count();
  if (existentes > 0) {
    console.log("La base ya tiene datos de catálogo; se omite el resto del seed.");
    return;
  }

  console.log("Sembrando categorías...");
  const categorias = await Promise.all(
    categoriasSeed.map((c) => prisma.category.create({ data: c }))
  );
  const categoriaPorSlug = new Map(categorias.map((c) => [c.slug, c]));

  console.log("Sembrando marcas...");
  const marcas = await Promise.all(marcasSeed.map((m) => prisma.brand.create({ data: m })));
  const marcaPorNombre = new Map(marcas.map((m) => [m.nombre, m]));

  console.log("Sembrando promociones...");
  const ahora = Date.now();
  const dia = 24 * 60 * 60 * 1000;
  const promociones = await Promise.all(
    promocionesSeed.map((p) =>
      prisma.promotion.create({
        data: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          porcentajeDescuento: p.porcentajeDescuento,
          fechaInicio: new Date(ahora + p.diasInicio * dia),
          fechaFin: new Date(ahora + p.diasFin * dia),
        },
      })
    )
  );
  const promocionPorNombre = new Map(promociones.map((p) => [p.nombre, p]));

  console.log("Sembrando productos...");
  for (const p of productosSeed) {
    const categoria = categoriaPorSlug.get(p.categoriaSlug);
    const marca = marcaPorNombre.get(p.marca);
    if (!categoria || !marca) continue;
    const promocion = p.promocion ? promocionPorNombre.get(p.promocion) : undefined;

    await prisma.product.create({
      data: {
        nombre: p.nombre,
        slug: slugifyNombre(p.nombre),
        descripcionCorta: p.descripcionCorta,
        descripcionLarga: p.descripcionLarga,
        ingredientes: p.ingredientes,
        modoUso: p.modoUso,
        beneficios: p.beneficios,
        precio: p.precio,
        esNuevo: p.esNuevo,
        esEdicionLimitada: p.esEdicionLimitada,
        categoryId: categoria.id,
        brandId: marca.id,
        promotionId: promocion?.id,
        inventory: { create: { stock: p.stock, stockMinimo: 5 } },
        images: {
          create: p.imagenes.map((id, index) => ({
            url: `https://images.unsplash.com/photo-${id}?w=900&h=900&fit=crop&auto=format&q=80`,
            textoAlt: p.nombre,
            orden: index,
            esPrincipal: index === 0,
          })),
        },
      },
    });
  }

  console.log("Sembrando banners...");
  await Promise.all(bannersSeed.map((b) => prisma.banner.create({ data: b })));

  console.log("Sembrando clientes, pedidos y reseñas de muestra...");
  const clienteRole = await prisma.role.findUniqueOrThrow({ where: { nombre: "Cliente" } });
  const clientesDemo = await Promise.all(
    [
      { nombre: "María", apellido: "González", email: "maria.gonzalez@example.com", telefono: "50255511122", direccion: "Zona 10, Ciudad de Guatemala" },
      { nombre: "Ana", apellido: "Martínez", email: "ana.martinez@example.com", telefono: "50255522233", direccion: "Zona 4, Ciudad de Guatemala" },
      { nombre: "Lucía", apellido: "Ramírez", email: "lucia.ramirez@example.com", telefono: "50255533344", direccion: "Antigua Guatemala" },
    ].map((c) =>
      prisma.user.create({
        data: { ...c, passwordHash, roleId: clienteRole.id },
      })
    )
  );

  const productos = await prisma.product.findMany();
  const random = (max: number) => Math.floor(Math.random() * max);

  for (let i = 0; i < 8; i++) {
    const cliente = clientesDemo[random(clientesDemo.length)];
    const cantidadItems = 1 + random(3);
    const detalles = Array.from({ length: cantidadItems }, () => {
      const producto = productos[random(productos.length)];
      const cantidad = 1 + random(2);
      return { producto, cantidad };
    });
    const subtotal = detalles.reduce((acc, d) => acc + Number(d.producto.precio) * d.cantidad, 0);

    await prisma.order.create({
      data: {
        numeroPedido: `ORD-2026-${1000 + i}`,
        userId: cliente.id,
        subtotal,
        total: subtotal,
        nombreContacto: `${cliente.nombre} ${cliente.apellido}`,
        telefonoContacto: cliente.telefono ?? "",
        direccionEntrega: cliente.direccion ?? "Ciudad de Guatemala",
        details: {
          create: detalles.map((d) => ({
            productId: d.producto.id,
            nombreProducto: d.producto.nombre,
            cantidad: d.cantidad,
            precioUnitario: d.producto.precio,
          })),
        },
      },
    });
  }

  for (let i = 0; i < 15; i++) {
    const producto = productos[random(productos.length)];
    const cliente = clientesDemo[random(clientesDemo.length)];
    await prisma.review.create({
      data: {
        productId: producto.id,
        userId: cliente.id,
        calificacion: 3 + random(3),
        comentario: "Excelente producto, la calidad superó mis expectativas y la duración es increíble.",
        aprobada: true,
      },
    });
  }

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

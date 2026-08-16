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

async function main() {
  console.log("Preparando roles base...");
  const roleAdmin = await prisma.role.upsert({
    where: { nombre: "Administrador" },
    update: {},
    create: { nombre: "Administrador" },
  });
  await prisma.role.upsert({ where: { nombre: "Empleado" }, update: {}, create: { nombre: "Empleado" } });
  await prisma.role.upsert({ where: { nombre: "Cliente" }, update: {}, create: { nombre: "Cliente" } });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "amour@gmail.com";
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

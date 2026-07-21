import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as pedidoRepo from "@/server/repositories/pedido.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { calcularCarrito } from "@/server/services/carrito.service";
import { construirEnlaceWhatsApp, construirMensajeWhatsApp } from "@/server/services/whatsapp.service";
import { registrarActividad } from "@/server/services/log.service";
import type { CrearPedidoInput, PedidoResumen, Resultado } from "@/types/carrito";

async function obtenerOCrearUsuarioParaPedido(input: CrearPedidoInput, userId: number | null): Promise<number> {
  if (userId) return userId;

  if (input.email?.trim()) {
    const existente = await usuarioRepo.getUsuarioPorEmail(input.email.trim());
    if (existente) return existente.id;
  }

  const partes = input.nombreContacto.trim().split(" ");
  const email = input.email?.trim() || `invitado.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@eclatmaquillaje.com`;
  const passwordHash = await bcrypt.hash(`invitado-${Date.now()}-${Math.random()}`, 10);

  const usuario = await usuarioRepo.crearUsuario({
    nombre: partes[0] || input.nombreContacto,
    apellido: partes.slice(1).join(" ") || "",
    email,
    passwordHash,
    telefono: input.telefonoContacto,
    roleNombre: "Cliente",
  });

  return usuario.id;
}

function mapearPedido(pedido: {
  id: number;
  numeroPedido: string;
  createdAt: Date;
  estado: string;
  subtotal: unknown;
  total: unknown;
  nombreContacto: string;
  telefonoContacto: string;
  direccionEntrega: string;
  observaciones: string | null;
  details: { nombreProducto: string; cantidad: number; precioUnitario: unknown }[];
}): PedidoResumen {
  return {
    id: pedido.id,
    numeroPedido: pedido.numeroPedido,
    fechaPedido: pedido.createdAt.toISOString(),
    estado: pedido.estado,
    subtotal: Number(pedido.subtotal),
    total: Number(pedido.total),
    nombreContacto: pedido.nombreContacto,
    telefonoContacto: pedido.telefonoContacto,
    direccionEntrega: pedido.direccionEntrega,
    observaciones: pedido.observaciones,
    detalles: pedido.details.map((d) => ({
      nombreProducto: d.nombreProducto,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Math.round(Number(d.precioUnitario) * d.cantidad * 100) / 100,
    })),
  };
}

export async function crearPedido(input: CrearPedidoInput, userId: number | null): Promise<Resultado<PedidoResumen>> {
  if (!input.nombreContacto?.trim() || !input.telefonoContacto?.trim() || !input.direccionEntrega?.trim()) {
    return { exitoso: false, errores: ["Nombre, teléfono y dirección de entrega son obligatorios."] };
  }

  const carrito = await calcularCarrito(input.items);
  if (carrito.items.length === 0) {
    return { exitoso: false, errores: ["El carrito está vacío o los productos ya no están disponibles."] };
  }

  const usuarioId = await obtenerOCrearUsuarioParaPedido(input, userId);
  const numeroPedido = await pedidoRepo.generarNumeroPedido();

  const pedido = await prisma.$transaction(async (tx) => {
    const creado = await tx.order.create({
      data: {
        numeroPedido,
        userId: usuarioId,
        subtotal: carrito.subtotal,
        total: carrito.total,
        nombreContacto: input.nombreContacto,
        telefonoContacto: input.telefonoContacto,
        direccionEntrega: input.direccionEntrega,
        observaciones: input.observaciones || null,
        details: {
          create: carrito.items.map((item) => ({
            productId: item.productoId,
            nombreProducto: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
          })),
        },
      },
      include: { details: true },
    });

    for (const item of carrito.items) {
      await tx.inventory.updateMany({
        where: { productId: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return creado;
  });

  const resumen = mapearPedido(pedido);
  const mensajeWhatsApp = construirMensajeWhatsApp(resumen);
  const enlaceWhatsApp = construirEnlaceWhatsApp(mensajeWhatsApp);

  await registrarActividad(usuarioId, "Pedido creado", `${resumen.numeroPedido} · Q${resumen.total}`);

  return { exitoso: true, valor: { ...resumen, mensajeWhatsApp, enlaceWhatsApp } };
}

export async function getPedidosPorUsuario(userId: number): Promise<PedidoResumen[]> {
  const pedidos = await pedidoRepo.getPedidosPorUsuario(userId);
  return pedidos.map(mapearPedido);
}

export async function getTodosLosPedidosAdmin() {
  const pedidos = await pedidoRepo.getTodosLosPedidos();
  return pedidos.map((p) => ({
    ...mapearPedido(p),
    clienteNombre: `${p.user.nombre} ${p.user.apellido}`,
    clienteEmail: p.user.email,
  }));
}

export async function actualizarEstadoPedido(id: number, estado: string) {
  return pedidoRepo.actualizarEstadoPedido(id, estado);
}

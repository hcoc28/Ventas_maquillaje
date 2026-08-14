import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import * as pedidoRepo from "@/server/repositories/pedido.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { calcularCarrito } from "@/server/services/carrito.service";
import { construirEnlaceWhatsApp, construirMensajeWhatsApp } from "@/server/services/whatsapp.service";
import { registrarActividad } from "@/server/services/log.service";
import { enviarEmail, plantillaBase } from "@/server/services/email.service";
import { siteConfig } from "@/config/site";
import { formatearMoneda } from "@/lib/utils";
import { METODOS_PAGO } from "@/validators/pedido";
import type { CrearPedidoInput, PedidoResumen, Resultado } from "@/types/carrito";

const MAX_INTENTOS_NUMERO_PEDIDO = 5;

/** Se usa para abortar la transacción (rollback) cuando el stock ya no alcanza al momento de descontar. */
class StockInsuficienteError extends Error {
  constructor(nombreProducto: string) {
    super(`Ya no hay suficiente stock de "${nombreProducto}".`);
  }
}

/** Se usa para abortar la transacción (rollback) cuando el cupón agota su límite justo antes de aplicarlo. */
class CuponAgotadoError extends Error {
  constructor() {
    super("El cupón ya alcanzó su límite de usos.");
  }
}

function esColisionNumeroPedido(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function obtenerOCrearUsuarioParaPedido(input: CrearPedidoInput, userId: number | null): Promise<number> {
  if (userId) return userId;

  // Cada pedido de invitado (sin cuenta) recibe un usuario sintético propio — nunca lo adjuntamos
  // a una cuenta existente, ya que no hay forma de verificar identidad en este flujo.
  const email = `invitado.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@amourbloom.com`;

  const partes = input.nombreContacto.trim().split(" ");
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
  descuento: unknown;
  cuponCodigo: string | null;
  total: unknown;
  nombreContacto: string;
  telefonoContacto: string;
  metodoPago: string;
  observaciones: string | null;
  details: { nombreProducto: string; cantidad: number; precioUnitario: unknown }[];
}): PedidoResumen {
  return {
    id: pedido.id,
    numeroPedido: pedido.numeroPedido,
    fechaPedido: pedido.createdAt.toISOString(),
    estado: pedido.estado,
    subtotal: Number(pedido.subtotal),
    descuento: Number(pedido.descuento),
    cuponCodigo: pedido.cuponCodigo,
    total: Number(pedido.total),
    nombreContacto: pedido.nombreContacto,
    telefonoContacto: pedido.telefonoContacto,
    metodoPago: pedido.metodoPago,
    observaciones: pedido.observaciones,
    detalles: pedido.details.map((d) => ({
      nombreProducto: d.nombreProducto,
      cantidad: d.cantidad,
      precioUnitario: Number(d.precioUnitario),
      subtotal: Math.round(Number(d.precioUnitario) * d.cantidad * 100) / 100,
    })),
  };
}

function detalleProductosHtml(resumen: PedidoResumen): string {
  const filas = resumen.detalles
    .map(
      (d) =>
        `<tr><td style="padding: 4px 0;">${d.nombreProducto} x${d.cantidad}</td><td style="padding: 4px 0; text-align: right;">${formatearMoneda(d.subtotal)}</td></tr>`
    )
    .join("");
  return `
    <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin: 16px 0;">${filas}</table>
    <p style="font-size: 14px; margin: 4px 0;"><strong>Total:</strong> ${formatearMoneda(resumen.total)}</p>
    <p style="font-size: 13px; color: #555; margin: 4px 0;">Método de pago: ${resumen.metodoPago}</p>
  `;
}

/**
 * Notificaciones por correo del pedido (nunca deben interrumpir la respuesta al cliente: el
 * pedido ya quedó creado, así que cualquier falla de envío solo se registra en consola).
 */
async function enviarNotificacionesPedido(resumen: PedidoResumen, usuarioId: number, esInvitado: boolean): Promise<void> {
  if (siteConfig.emailNotificaciones) {
    try {
      await enviarEmail({
        to: siteConfig.emailNotificaciones,
        subject: `Nuevo pedido ${resumen.numeroPedido}`,
        html: plantillaBase(`
          <h1 style="font-size: 18px; margin-bottom: 12px;">Nuevo pedido recibido</h1>
          <p style="font-size: 14px; margin: 4px 0;">Pedido <strong>${resumen.numeroPedido}</strong></p>
          <p style="font-size: 13px; color: #555; margin: 4px 0;">Cliente: ${resumen.nombreContacto} · ${resumen.telefonoContacto}</p>
          ${detalleProductosHtml(resumen)}
        `),
      });
    } catch (error) {
      console.error("[pedido] Error al enviar notificación interna:", error);
    }
  }

  if (!esInvitado) {
    try {
      const usuario = await usuarioRepo.getUsuarioPorId(usuarioId);
      if (usuario?.email) {
        await enviarEmail({
          to: usuario.email,
          subject: `Confirmación de tu pedido ${resumen.numeroPedido}`,
          html: plantillaBase(`
            <h1 style="font-size: 18px; margin-bottom: 12px;">¡Gracias por tu compra, ${resumen.nombreContacto}!</h1>
            <p style="font-size: 14px; line-height: 1.6; color: #333;">
              Recibimos tu pedido y lo estamos preparando. Te contactaremos por WhatsApp para coordinar el pago y la entrega.
            </p>
            ${detalleProductosHtml(resumen)}
          `),
        });
      }
    } catch (error) {
      console.error("[pedido] Error al enviar confirmación al cliente:", error);
    }
  }
}

export async function crearPedido(input: CrearPedidoInput, userId: number | null): Promise<Resultado<PedidoResumen>> {
  if (!input.nombreContacto?.trim() || !input.telefonoContacto?.trim()) {
    return { exitoso: false, errores: ["Nombre y teléfono son obligatorios."] };
  }
  if (!METODOS_PAGO.includes(input.metodoPago as (typeof METODOS_PAGO)[number])) {
    return { exitoso: false, errores: ["Selecciona un método de pago válido."] };
  }

  const carrito = await calcularCarrito(input.items, input.codigoCupon);
  if (carrito.items.length === 0) {
    return { exitoso: false, errores: ["El carrito está vacío o los productos ya no están disponibles."] };
  }
  if (input.codigoCupon?.trim() && carrito.cuponError) {
    return { exitoso: false, errores: [carrito.cuponError] };
  }

  const usuarioId = await obtenerOCrearUsuarioParaPedido(input, userId);

  let pedido;
  for (let intento = 1; intento <= MAX_INTENTOS_NUMERO_PEDIDO; intento++) {
    const numeroPedido = await pedidoRepo.generarNumeroPedido();
    try {
      pedido = await prisma.$transaction(async (tx) => {
        const creado = await tx.order.create({
          data: {
            numeroPedido,
            userId: usuarioId,
            subtotal: carrito.subtotal,
            descuento: carrito.descuento,
            cuponCodigo: carrito.codigoCupon ?? null,
            total: carrito.total,
            nombreContacto: input.nombreContacto,
            telefonoContacto: input.telefonoContacto,
            metodoPago: input.metodoPago,
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

        // Descuento atómico y condicional: si dos pedidos compiten por el mismo stock, esta
        // actualización solo aplica cuando aún alcanza — evita vender de más (oversell).
        for (const item of carrito.items) {
          const resultado = await tx.inventory.updateMany({
            where: { productId: item.productoId, stock: { gte: item.cantidad } },
            data: { stock: { decrement: item.cantidad } },
          });
          if (resultado.count === 0) {
            throw new StockInsuficienteError(item.nombre);
          }
        }

        // Uso de cupón atómico: se hace dentro de la MISMA transacción que el pedido, condicionado
        // a que aún no llegue al límite — si dos clientes usan el último cupón a la vez, solo uno
        // gana y el otro revierte el pedido completo (rollback) en vez de dejar el cupón sobre-usado.
        if (carrito.cuponId) {
          const cupon = await tx.coupon.findUnique({ where: { id: carrito.cuponId }, select: { usoMaximo: true } });
          const resultadoCupon = await tx.coupon.updateMany({
            where: {
              id: carrito.cuponId,
              ...(cupon?.usoMaximo != null ? { vecesUsado: { lt: cupon.usoMaximo } } : {}),
            },
            data: { vecesUsado: { increment: 1 } },
          });
          if (resultadoCupon.count === 0) {
            throw new CuponAgotadoError();
          }
        }

        return creado;
      });
      break;
    } catch (error) {
      if (esColisionNumeroPedido(error)) {
        if (intento < MAX_INTENTOS_NUMERO_PEDIDO) {
          continue;
        }
        return { exitoso: false, errores: ["No se pudo generar el número de pedido, intenta de nuevo."] };
      }
      if (error instanceof StockInsuficienteError || error instanceof CuponAgotadoError) {
        return { exitoso: false, errores: [error.message] };
      }
      throw error;
    }
  }

  if (!pedido) {
    return { exitoso: false, errores: ["No se pudo generar el número de pedido, intenta de nuevo."] };
  }

  const resumen = mapearPedido(pedido);
  const mensajeWhatsApp = construirMensajeWhatsApp(resumen);
  const enlaceWhatsApp = construirEnlaceWhatsApp(mensajeWhatsApp);

  await registrarActividad(usuarioId, "Pedido creado", `${resumen.numeroPedido} · Q${resumen.total}`);
  await enviarNotificacionesPedido(resumen, usuarioId, !userId);

  return { exitoso: true, valor: { ...resumen, mensajeWhatsApp, enlaceWhatsApp } };
}

export async function getPedidosPorUsuario(userId: number): Promise<PedidoResumen[]> {
  const pedidos = await pedidoRepo.getPedidosPorUsuario(userId);
  return pedidos.map((p) => {
    const resumen = mapearPedido(p);
    const mensajeWhatsApp = construirMensajeWhatsApp(resumen);
    return { ...resumen, mensajeWhatsApp, enlaceWhatsApp: construirEnlaceWhatsApp(mensajeWhatsApp) };
  });
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

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import * as pedidoRepo from "@/server/repositories/pedido.repository";
import * as usuarioRepo from "@/server/repositories/usuario.repository";
import { calcularCarrito } from "@/server/services/carrito.service";
import { registrarUsoCupon } from "@/server/services/cupon.service";
import { construirEnlaceWhatsApp, construirMensajeWhatsApp } from "@/server/services/whatsapp.service";
import { registrarActividad } from "@/server/services/log.service";
import { enviarEmail, plantillaBase } from "@/server/services/email.service";
import { formatearMoneda } from "@/lib/utils";
import { METODOS_PAGO } from "@/validators/pedido";
import type { CrearPedidoInput, PedidoResumen, Resultado } from "@/types/carrito";

async function enviarConfirmacionPedido(email: string, resumen: PedidoResumen): Promise<void> {
  const filasProductos = resumen.detalles
    .map(
      (d) => `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #333;">${d.nombreProducto} × ${d.cantidad}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #333; text-align: right;">${formatearMoneda(d.subtotal)}</td>
        </tr>`
    )
    .join("");

  await enviarEmail({
    to: email,
    subject: `Confirmación de tu pedido ${resumen.numeroPedido}`,
    html: plantillaBase(`
      <h1 style="font-size: 18px; margin-bottom: 12px;">¡Gracias por tu pedido!</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #333;">
        Recibimos tu pedido <strong>${resumen.numeroPedido}</strong>. Te contactaremos por WhatsApp para coordinar la entrega.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${filasProductos}
        <tr>
          <td style="padding: 8px 0 0; font-size: 13px; color: #666; border-top: 1px solid #eee;">Subtotal</td>
          <td style="padding: 8px 0 0; font-size: 13px; color: #666; text-align: right; border-top: 1px solid #eee;">${formatearMoneda(resumen.subtotal)}</td>
        </tr>
        ${
          resumen.descuento > 0
            ? `<tr>
                <td style="padding: 4px 0; font-size: 13px; color: #16a34a;">Descuento${resumen.cuponCodigo ? ` (${resumen.cuponCodigo})` : ""}</td>
                <td style="padding: 4px 0; font-size: 13px; color: #16a34a; text-align: right;">-${formatearMoneda(resumen.descuento)}</td>
              </tr>`
            : ""
        }
        <tr>
          <td style="padding: 8px 0 0; font-size: 14px; font-weight: 600;">Total</td>
          <td style="padding: 8px 0 0; font-size: 14px; font-weight: 600; text-align: right;">${formatearMoneda(resumen.total)}</td>
        </tr>
      </table>
      <p style="font-size: 13px; color: #666;"><strong>Entrega:</strong> ${resumen.direccionEntrega}</p>
      <p style="font-size: 13px; color: #666;"><strong>Método de pago:</strong> ${resumen.metodoPago}</p>
    `),
  });
}

async function obtenerOCrearUsuarioParaPedido(input: CrearPedidoInput, userId: number | null): Promise<number> {
  if (userId) return userId;

  // Nunca adjuntamos un pedido anónimo a una cuenta existente solo porque alguien escribió su
  // correo — sin contraseña ni verificación, cualquiera podría "regalarle" pedidos falsos a otra
  // persona. Si el correo ya está registrado, generamos uno de invitado sintético en su lugar.
  const emailIngresado = input.email?.trim();
  const correoOcupado = emailIngresado ? await usuarioRepo.getUsuarioPorEmail(emailIngresado) : null;
  const email =
    emailIngresado && !correoOcupado
      ? emailIngresado
      : `invitado.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@amourbloom.com`;

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
  direccionEntrega: string;
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
    direccionEntrega: pedido.direccionEntrega,
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

export async function crearPedido(input: CrearPedidoInput, userId: number | null): Promise<Resultado<PedidoResumen>> {
  if (!input.nombreContacto?.trim() || !input.telefonoContacto?.trim() || !input.direccionEntrega?.trim()) {
    return { exitoso: false, errores: ["Nombre, teléfono y dirección de entrega son obligatorios."] };
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
  const numeroPedido = await pedidoRepo.generarNumeroPedido();

  const pedido = await prisma.$transaction(async (tx) => {
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
        direccionEntrega: input.direccionEntrega,
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

    for (const item of carrito.items) {
      await tx.inventory.updateMany({
        where: { productId: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      });
    }

    return creado;
  });

  if (carrito.cuponId) {
    await registrarUsoCupon(carrito.cuponId);
  }

  const resumen = mapearPedido(pedido);
  const mensajeWhatsApp = construirMensajeWhatsApp(resumen);
  const enlaceWhatsApp = construirEnlaceWhatsApp(mensajeWhatsApp);

  await registrarActividad(usuarioId, "Pedido creado", `${resumen.numeroPedido} · Q${resumen.total}`);

  if (input.email?.trim()) {
    await enviarConfirmacionPedido(input.email.trim(), resumen);
  }

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

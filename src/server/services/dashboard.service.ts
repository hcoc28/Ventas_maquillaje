import * as dashboardRepo from "@/server/repositories/dashboard.repository";

export async function getEstadisticasDashboard() {
  const stats = await dashboardRepo.getEstadisticasDashboard();
  return {
    ...stats,
    pedidosRecientes: stats.pedidosRecientes.map((p) => ({
      id: p.id,
      numeroPedido: p.numeroPedido,
      estado: p.estado,
      total: Number(p.total),
      fecha: p.createdAt.toISOString(),
      cliente: `${p.user.nombre} ${p.user.apellido}`,
    })),
    ultimosMensajesContacto: stats.ultimosMensajesContacto.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      asunto: m.asunto,
      leido: m.leido,
      fecha: m.createdAt.toISOString(),
    })),
  };
}

export async function getReportesVentas(dias: number) {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  fechaInicio.setHours(0, 0, 0, 0);

  const reporte = await dashboardRepo.getReportesVentas(fechaInicio);

  return {
    ventasPorDia: reporte.ventasPorDia.map((v) => ({
      fecha: v.fecha.toISOString().slice(0, 10),
      total: Number(v.total),
    })),
    ventasPorCategoria: reporte.ventasPorCategoria.map((v) => ({
      categoria: v.categoria,
      total: Number(v.total),
    })),
    ventasPorMetodoPago: reporte.ventasPorMetodoPago.map((v) => ({
      metodoPago: v.metodoPago,
      total: Number(v.total),
    })),
    topProductos: reporte.topProductos.map((p) => ({
      productId: p.productId,
      nombre: p.nombre,
      slug: p.slug,
      unidadesVendidas: Number(p.unidadesVendidas),
      ingresos: Number(p.ingresos),
    })),
  };
}

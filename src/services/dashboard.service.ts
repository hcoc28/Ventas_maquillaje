import * as dashboardRepo from "@/repositories/dashboard.repository";

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
  };
}

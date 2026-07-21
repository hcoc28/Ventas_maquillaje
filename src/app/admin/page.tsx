import Link from "next/link";
import { AlertTriangle, ClipboardList, DollarSign, Package, Users } from "lucide-react";
import { getEstadisticasDashboard } from "@/server/services/dashboard.service";
import { formatearMoneda } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getEstadisticasDashboard();

  const tarjetas = [
    { label: "Ingresos totales", valor: formatearMoneda(stats.ingresosTotales), icon: DollarSign },
    { label: "Pedidos", valor: stats.totalPedidos, icon: ClipboardList },
    { label: "Productos activos", valor: stats.totalProductos, icon: Package },
    { label: "Usuarios activos", valor: stats.totalUsuarios, icon: Users },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Panel</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((t) => (
          <div key={t.label} className="flex items-center gap-4 rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-strong/10 text-accent-strong">
              <t.icon size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold">{t.valor}</p>
              <p className="text-sm text-text-muted">{t.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pedidos recientes</h2>
            <Link href="/admin/pedidos" className="text-sm font-medium text-accent-strong hover:underline">
              Ver todos
            </Link>
          </div>
          {stats.pedidosRecientes.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Aún no hay pedidos.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {stats.pedidosRecientes.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{p.numeroPedido}</p>
                    <p className="text-xs text-text-muted">{p.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatearMoneda(p.total)}</p>
                    <p className="text-xs text-text-muted">{p.estado}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold">Stock bajo</h2>
          </div>
          {stats.productosBajoStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Todos los productos tienen stock suficiente.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {stats.productosBajoStock.map((p) => (
                <Link
                  key={p.productId}
                  href={`/admin/productos/${p.productId}`}
                  className="flex items-center justify-between py-3 hover:text-accent-strong"
                >
                  <span className="font-medium">{p.nombre}</span>
                  <span className="text-xs text-red-600">
                    {p.stock} / {p.stockMinimo} min.
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

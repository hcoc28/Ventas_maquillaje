import Link from "next/link";
import { AlertTriangle, Clock, ClipboardList, DollarSign, MessageSquare, Package, TicketPercent, Users } from "lucide-react";
import { getEstadisticasDashboard, getReportesVentas } from "@/server/services/dashboard.service";
import { cn, formatearMoneda } from "@/lib/utils";

const PERIODOS = [
  { dias: 7, label: "7 días" },
  { dias: 30, label: "30 días" },
  { dias: 90, label: "90 días" },
];

interface Props {
  searchParams: Promise<{ dias?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const diasSeleccionados = PERIODOS.some((p) => String(p.dias) === params.dias) ? Number(params.dias) : 30;

  const [stats, reporte] = await Promise.all([getEstadisticasDashboard(), getReportesVentas(diasSeleccionados)]);

  const tarjetas = [
    { label: "Ingresos totales", valor: formatearMoneda(stats.ingresosTotales), icon: DollarSign },
    { label: "Pedidos", valor: stats.totalPedidos, icon: ClipboardList },
    { label: "Pedidos pendientes", valor: stats.pedidosPendientes, icon: Clock },
    { label: "Productos activos", valor: stats.totalProductos, icon: Package },
    { label: "Usuarios activos", valor: stats.totalUsuarios, icon: Users },
  ];

  const maxVentaDia = Math.max(...reporte.ventasPorDia.map((v) => v.total), 1);
  const maxVentaCategoria = Math.max(...reporte.ventasPorCategoria.map((v) => v.total), 1);
  const maxVentaMetodoPago = Math.max(...reporte.ventasPorMetodoPago.map((v) => v.total), 1);
  const ingresosPeriodo = reporte.ventasPorDia.reduce((acc, v) => acc + v.total, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Panel</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Ventas por día</h2>
            <p className="text-sm text-text-muted">
              {formatearMoneda(ingresosPeriodo)} en los últimos {diasSeleccionados} días
            </p>
          </div>
          <div className="flex gap-1.5 rounded-full border border-border p-1">
            {PERIODOS.map((p) => (
              <Link
                key={p.dias}
                href={`/admin?dias=${p.dias}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                  p.dias === diasSeleccionados ? "bg-black text-white" : "hover:bg-surface-muted"
                )}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        {reporte.ventasPorDia.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">No hay ventas en este período.</p>
        ) : (
          <div className="flex h-40 items-end gap-1 overflow-x-auto">
            {reporte.ventasPorDia.map((v) => (
              <div
                key={v.fecha}
                title={`${new Date(v.fecha).toLocaleDateString("es-GT", { day: "numeric", month: "short" })}: ${formatearMoneda(v.total)}`}
                className="flex min-w-[10px] flex-1 flex-col items-center justify-end"
              >
                <div
                  className="w-full rounded-t bg-accent-strong transition-all hover:bg-accent"
                  style={{ height: `${Math.max((v.total / maxVentaDia) * 100, 3)}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-lg font-semibold">Ventas por categoría</h2>
          {reporte.ventasPorCategoria.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No hay ventas en este período.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reporte.ventasPorCategoria.map((v) => (
                <div key={v.categoria}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{v.categoria}</span>
                    <span className="text-text-muted">{formatearMoneda(v.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-accent-strong" style={{ width: `${(v.total / maxVentaCategoria) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-lg font-semibold">Productos más vendidos</h2>
          {reporte.topProductos.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No hay ventas en este período.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {reporte.topProductos.map((p) => (
                <Link
                  key={p.productId}
                  href={`/admin/productos/${p.productId}`}
                  className="flex items-center justify-between py-3 hover:text-accent-strong"
                >
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-xs text-text-muted">{p.unidadesVendidas} unidades vendidas</p>
                  </div>
                  <span className="font-semibold">{formatearMoneda(p.ingresos)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 text-lg font-semibold">Ventas por método de pago</h2>
          {reporte.ventasPorMetodoPago.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No hay ventas en este período.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reporte.ventasPorMetodoPago.map((v) => (
                <div key={v.metodoPago}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{v.metodoPago}</span>
                    <span className="text-text-muted">{formatearMoneda(v.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-accent-strong"
                      style={{ width: `${(v.total / maxVentaMetodoPago) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center gap-2">
            <TicketPercent size={18} className="text-accent-strong" />
            <h2 className="text-lg font-semibold">Cupones más usados</h2>
          </div>
          {stats.cuponesUsados.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Todavía no se ha usado ningún cupón.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {stats.cuponesUsados.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <span className="font-medium">{c.codigo}</span>
                  <span className="text-sm text-text-muted">
                    {c.vecesUsado} {c.usoMaximo ? `/ ${c.usoMaximo}` : ""} usos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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

      <div className="rounded-2xl bg-surface p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-strong" />
            <h2 className="text-lg font-semibold">Últimos mensajes de contacto</h2>
          </div>
          <Link href="/admin/contacto" className="text-sm font-medium text-accent-strong hover:underline">
            Ver todos
          </Link>
        </div>
        {stats.ultimosMensajesContacto.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">No hay mensajes de contacto todavía.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {stats.ultimosMensajesContacto.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{m.nombre}</p>
                  <p className="text-xs text-text-muted">{m.asunto}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    m.leido ? "bg-surface-muted text-text-muted" : "bg-accent-strong/15 text-accent-strong"
                  }`}
                >
                  {m.leido ? "Leído" : "No leído"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

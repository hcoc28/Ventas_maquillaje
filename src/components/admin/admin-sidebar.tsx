"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Percent,
  TicketPercent,
  Image as ImageIcon,
  Users,
  ClipboardList,
  Star,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: FolderTree },
  { href: "/admin/marcas", label: "Marcas", icon: Tag },
  { href: "/admin/promociones", label: "Promociones", icon: Percent },
  { href: "/admin/cupones", label: "Cupones", icon: TicketPercent },
  { href: "/admin/opiniones", label: "Opiniones", icon: Star },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, soloAdmin: true },
];

export function AdminSidebar({ rol }: { rol: string }) {
  const pathname = usePathname();
  const linksVisibles = links.filter((link) => !link.soloAdmin || rol === "Administrador");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <span className="font-[family-name:var(--font-display)] text-xl">Amour Bloom</span>
        <span className="rounded-full bg-accent-strong/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-accent-strong">
          {rol}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {linksVisibles.map((link) => {
          const activo = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                activo ? "bg-accent-strong/15 text-accent-strong" : "text-foreground/75 hover:bg-surface-muted"
              )}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/75 hover:bg-surface-muted"
        >
          <ArrowLeft size={17} />
          Volver a la tienda
        </Link>
      </div>
    </aside>
  );
}

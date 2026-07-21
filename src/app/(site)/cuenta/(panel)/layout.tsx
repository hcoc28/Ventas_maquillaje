import Link from "next/link";
import { Heart, LayoutGrid, Package, User } from "lucide-react";

// Páginas de cuenta autenticadas: siempre dependen de la sesión del usuario, nunca deben prerenderizarse.
export const dynamic = "force-dynamic";

const links = [
  { href: "/cuenta", label: "Resumen", icon: LayoutGrid },
  { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cuenta/perfil", label: "Mi perfil", icon: User },
];

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              <link.icon size={16} /> {link.label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}

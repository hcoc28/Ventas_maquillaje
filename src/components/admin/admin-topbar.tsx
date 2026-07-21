"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminTopbar({ nombre, email }: { nombre: string; email: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 sm:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">Panel administrativo</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold leading-tight">{nombre}</p>
          <p className="text-xs text-text-muted leading-tight">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          aria-label="Cerrar sesión"
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-surface-muted hover:text-red-600"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

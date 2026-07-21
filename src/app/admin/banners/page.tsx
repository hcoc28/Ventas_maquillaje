import Link from "next/link";
import { Plus } from "lucide-react";
import { getTodosLosBannersAdmin } from "@/services/banner.service";
import { BannersTable } from "./banners-table";

export default async function AdminBannersPage() {
  const banners = await getTodosLosBannersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Contenido</span>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Banners</h1>
        </div>
        <Link
          href="/admin/banners/nuevo"
          className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          <Plus size={16} /> Nuevo banner
        </Link>
      </div>

      <BannersTable banners={banners} />
    </div>
  );
}

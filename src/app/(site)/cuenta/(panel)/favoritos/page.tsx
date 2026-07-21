import { Heart } from "lucide-react";
import { auth } from "@/lib/auth";
import { getFavoritos } from "@/services/favorito.service";
import { ProductCard } from "@/components/product/product-card";

export default async function CuentaFavoritosPage() {
  const session = await auth();
  const favoritos = await getFavoritos(Number(session!.user.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Tu selección</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Mis favoritos</h1>
      </div>

      {favoritos.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface py-16 text-center shadow-[var(--shadow-soft)]">
          <Heart size={32} className="text-text-muted" />
          <p className="text-sm text-text-muted">Todavía no has guardado ningún producto como favorito.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {favoritos.map((producto, i) => (
            <ProductCard key={producto.id} producto={producto} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

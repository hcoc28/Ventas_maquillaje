import { CategoriaForm } from "../categoria-form";

export default function NuevaCategoriaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Catálogo</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Nueva categoría</h1>
      </div>
      <CategoriaForm />
    </div>
  );
}

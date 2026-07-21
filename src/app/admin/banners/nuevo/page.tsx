import { BannerForm } from "../banner-form";

export default function NuevoBannerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Contenido</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Nuevo banner</h1>
      </div>
      <BannerForm />
    </div>
  );
}

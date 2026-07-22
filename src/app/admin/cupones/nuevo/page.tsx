import { CuponForm } from "../cupon-form";

export default function NuevoCuponPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Marketing</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl">Nuevo cupón</h1>
      </div>
      <CuponForm />
    </div>
  );
}

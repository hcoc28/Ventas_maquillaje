import Image from "next/image";
import Link from "next/link";
import type { CategoriaDto } from "@/types/catalogo";

export function CategoryCard({ categoria }: { categoria: CategoriaDto }) {
  return (
    <Link
      href={`/catalogo?categoria=${categoria.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-medium)]"
    >
      {categoria.imagenUrl && (
        <Image
          src={categoria.imagenUrl}
          alt={categoria.nombre}
          fill
          sizes="(max-width: 768px) 45vw, 18vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/75 via-black/0 to-black/0 p-4">
        <span className="font-[family-name:var(--font-display)] text-lg text-white">{categoria.nombre}</span>
      </div>
    </Link>
  );
}

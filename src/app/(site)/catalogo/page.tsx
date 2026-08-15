import type { Metadata } from "next";
import { CatalogoClient } from "@/components/catalogo/catalogo-client";
import { getCategoriasActivas } from "@/server/services/categoria.service";
import { getMarcasActivas } from "@/server/services/marca.service";
import { buscarProductos } from "@/server/services/producto.service";
import { getConfiguracion } from "@/server/services/configuracion.service";
import type { OrdenCatalogo } from "@/types/catalogo";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora nuestro catálogo completo de maquillaje: labiales, bases, sombras, skincare y más.",
  alternates: { canonical: "/catalogo" },
  openGraph: {
    title: "Catálogo",
    description: "Explora nuestro catálogo completo de maquillaje: labiales, bases, sombras, skincare y más.",
  },
};

const ORDENES_VALIDOS: OrdenCatalogo[] = [
  "relevancia",
  "precio-asc",
  "precio-desc",
  "nombre",
  "mas-vendidos",
  "recientes",
  "descuento",
];

interface CatalogoPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function comoArray(valor: string | string[] | undefined): string[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : "";
  const categoriasSel = comoArray(params.categoria);
  const marcasSel = comoArray(params.marca);
  const oferta = params.oferta === "true";
  const stock = params.stock === "true";
  const ordenParam = typeof params.orden === "string" ? params.orden : "relevancia";
  const orden = (ORDENES_VALIDOS as string[]).includes(ordenParam) ? (ordenParam as OrdenCatalogo) : "relevancia";
  const pagina = params.pagina ? Number(params.pagina) : 1;

  const [categorias, marcas, resultadoInicial, configuracion] = await Promise.all([
    getCategoriasActivas(),
    getMarcasActivas(),
    buscarProductos({
      busqueda: q || undefined,
      categorias: categoriasSel,
      marcas: marcasSel,
      soloConDescuento: oferta,
      soloConStock: stock,
      orden,
      pagina,
      tamanoPagina: 12,
    }),
    getConfiguracion(),
  ]);

  return (
    <CatalogoClient
      categorias={categorias}
      marcas={marcas}
      resultadoInicial={resultadoInicial}
      filtroInicial={{ q, categorias: categoriasSel, marcas: marcasSel, oferta, stock, orden, pagina }}
      mostrarFiltroMarcas={configuracion.mostrarFiltroMarcas}
    />
  );
}

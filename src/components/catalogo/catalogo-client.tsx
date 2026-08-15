"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { NavbarOscura } from "@/components/layout/navbar-theme-context";
import type { CategoriaDto, MarcaDto, OrdenCatalogo, PagedResult, ProductoResumen } from "@/types/catalogo";

const OPCIONES_ORDEN: { valor: OrdenCatalogo; etiqueta: string }[] = [
  { valor: "relevancia", etiqueta: "Relevancia" },
  { valor: "recientes", etiqueta: "Más recientes" },
  { valor: "mas-vendidos", etiqueta: "Más vendidos" },
  { valor: "precio-asc", etiqueta: "Precio: menor a mayor" },
  { valor: "precio-desc", etiqueta: "Precio: mayor a menor" },
  { valor: "descuento", etiqueta: "Mayor descuento" },
  { valor: "nombre", etiqueta: "Nombre A-Z" },
];

interface Props {
  categorias: CategoriaDto[];
  marcas: MarcaDto[];
  resultadoInicial: PagedResult<ProductoResumen>;
  filtroInicial: {
    q: string;
    categorias: string[];
    marcas: string[];
    oferta: boolean;
    stock: boolean;
    orden: OrdenCatalogo;
    pagina: number;
  };
  mostrarFiltroMarcas: boolean;
}

/** Identifica una combinación de filtros de búsqueda (todo menos la página). */
function claveBusqueda(f: { q: string; categorias: string[]; marcas: string[]; oferta: boolean; stock: boolean; orden: OrdenCatalogo }): string {
  return JSON.stringify([f.q, f.categorias, f.marcas, f.oferta, f.stock, f.orden]);
}

export function CatalogoClient({ categorias, marcas, resultadoInicial, filtroInicial, mostrarFiltroMarcas }: Props) {
  const router = useRouter();

  const [resultado, setResultado] = useState(resultadoInicial);
  const [cargando, setCargando] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const [q, setQ] = useState(filtroInicial.q);
  const [categoriasSel, setCategoriasSel] = useState<string[]>(filtroInicial.categorias);
  const [marcasSel, setMarcasSel] = useState<string[]>(filtroInicial.marcas);
  const [oferta, setOferta] = useState(filtroInicial.oferta);
  const [stock, setStock] = useState(filtroInicial.stock);
  const [orden, setOrden] = useState<OrdenCatalogo>(filtroInicial.orden);
  const [pagina, setPagina] = useState(filtroInicial.pagina);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combinación de filtros que ya coincide con lo que hay en `resultado` — sirve para saber si
  // el efecto de búsqueda debe disparar una petición o si ya está al día (evita una petición
  // duplicada justo después de resincronizar por una navegación externa, ver abajo).
  const [busquedaAplicada, setBusquedaAplicada] = useState(() => claveBusqueda(filtroInicial));

  // Al navegar entre links (ej. categorías del navbar) el componente no se desmonta, así que
  // hay que resincronizar el estado interno con los nuevos props del servidor cada vez que
  // cambian. Se ajusta durante el render mismo (patrón que recomienda React para esto) en vez
  // de en un useEffect, para no disparar un ciclo extra de renders.
  const [filtroAplicado, setFiltroAplicado] = useState(() => JSON.stringify(filtroInicial));
  const claveActual = JSON.stringify(filtroInicial);
  if (claveActual !== filtroAplicado) {
    setFiltroAplicado(claveActual);
    setBusquedaAplicada(claveBusqueda(filtroInicial));
    setResultado(resultadoInicial);
    setQ(filtroInicial.q);
    setCategoriasSel(filtroInicial.categorias);
    setMarcasSel(filtroInicial.marcas);
    setOferta(filtroInicial.oferta);
    setStock(filtroInicial.stock);
    setOrden(filtroInicial.orden);
    setPagina(filtroInicial.pagina);
  }

  const buscar = useCallback(
    async (paginaObjetivo: number) => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        categoriasSel.forEach((c) => params.append("categoria", c));
        marcasSel.forEach((m) => params.append("marca", m));
        if (oferta) params.set("oferta", "true");
        if (stock) params.set("stock", "true");
        params.set("orden", orden);
        params.set("pagina", String(paginaObjetivo));

        const { data } = await axios.get<PagedResult<ProductoResumen>>(`/api/productos/buscar?${params.toString()}`);
        setResultado(data);
        setPagina(paginaObjetivo);
        setBusquedaAplicada(claveBusqueda({ q, categorias: categoriasSel, marcas: marcasSel, oferta, stock, orden }));
        router.replace(`/catalogo?${params.toString()}`, { scroll: false });
      } finally {
        setCargando(false);
      }
    },
    [q, categoriasSel, marcasSel, oferta, stock, orden, router]
  );

  useEffect(() => {
    const claveActualBusqueda = claveBusqueda({ q, categorias: categoriasSel, marcas: marcasSel, oferta, stock, orden });
    if (claveActualBusqueda === busquedaAplicada) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(1), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoriasSel, marcasSel, oferta, stock, orden]);

  function toggleCategoria(slug: string) {
    setCategoriasSel((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function toggleMarca(slug: string) {
    setMarcasSel((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  function limpiarFiltros() {
    setQ("");
    setCategoriasSel([]);
    setMarcasSel([]);
    setOferta(false);
    setStock(false);
    setOrden("relevancia");
  }

  return (
    <div>
      <NavbarOscura />
      <section className="bg-brand-black px-5 pb-16 pt-32 text-center text-white sm:px-8">
        <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-brand-gold-light">Colección completa</span>
        <h1 className="mb-2 font-[family-name:var(--font-display)] text-4xl sm:text-5xl">Catálogo</h1>
        <p className="text-white/65">Descubre {resultado.totalRegistros} productos seleccionados de las mejores marcas de lujo.</p>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className={`rounded-2xl bg-surface p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:block lg:h-fit ${sidebarAbierto ? "block" : "hidden"}`}>
            <FiltroBloque titulo="Categorías">
              {categorias.map((c) => (
                <label key={c.id} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-text-muted hover:text-foreground">
                  <input type="checkbox" checked={categoriasSel.includes(c.slug)} onChange={() => toggleCategoria(c.slug)} className="accent-accent-strong" />
                  {c.nombre} <span className="ml-auto text-xs">({c.totalProductos})</span>
                </label>
              ))}
            </FiltroBloque>

            {mostrarFiltroMarcas && (
              <FiltroBloque titulo="Marcas">
                {marcas.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-text-muted hover:text-foreground">
                    <input type="checkbox" checked={marcasSel.includes(m.slug)} onChange={() => toggleMarca(m.slug)} className="accent-accent-strong" />
                    {m.nombre} <span className="ml-auto text-xs">({m.totalProductos})</span>
                  </label>
                ))}
              </FiltroBloque>
            )}

            <FiltroBloque titulo="Disponibilidad">
              <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-text-muted hover:text-foreground">
                <input type="checkbox" checked={oferta} onChange={(e) => setOferta(e.target.checked)} className="accent-accent-strong" />
                Solo ofertas
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-text-muted hover:text-foreground">
                <input type="checkbox" checked={stock} onChange={(e) => setStock(e.target.checked)} className="accent-accent-strong" />
                Solo disponibles
              </label>
            </FiltroBloque>

            <button onClick={limpiarFiltros} className="w-full rounded-full border border-foreground/20 py-2 text-xs font-semibold uppercase tracking-wider text-foreground transition hover:bg-surface-muted">
              Limpiar filtros
            </button>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  type="text"
                  aria-label="Buscar productos"
                  placeholder="Buscar productos..."
                  className="w-full rounded-full border border-border bg-surface py-2.5 pl-11 pr-4 text-sm outline-none focus:border-accent-strong"
                />
              </div>

              <button
                onClick={() => setSidebarAbierto((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filtros
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">{resultado.totalRegistros} productos</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as OrdenCatalogo)}
                  aria-label="Ordenar productos"
                  className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none"
                >
                  {OPCIONES_ORDEN.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ opacity: cargando ? 0.5 : 1, transition: "opacity 0.2s" }}>
              {resultado.items.length === 0 ? (
                <div className="py-20 text-center text-text-muted">
                  <Search className="mx-auto mb-4 text-brand-pink-pastel" size={40} />
                  <p>No encontramos productos que coincidan con tu búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                  {resultado.items.map((producto, i) => (
                    <ProductCard key={producto.id} producto={producto} index={i} />
                  ))}
                </div>
              )}
            </div>

            {resultado.totalPaginas > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: resultado.totalPaginas }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagina) <= 2 || p === 1 || p === resultado.totalPaginas)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-2">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-text-muted">…</span>}
                      <button
                        onClick={() => buscar(p)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm transition ${
                          p === pagina ? "bg-black text-white" : "hover:bg-surface-muted"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltroBloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 border-b border-border pb-4 last:border-none">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">{titulo}</div>
      {children}
    </div>
  );
}

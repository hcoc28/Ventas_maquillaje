export interface ProductoResumen {
  id: number;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  imagenPrincipalUrl: string;
  precio: number;
  precioFinal: number;
  porcentajeDescuento: number | null;
  categoriaNombre: string | null;
  categoriaSlug: string | null;
  marcaNombre: string | null;
  marcaSlug: string | null;
  hayStock: boolean;
  esNuevo: boolean;
  esEdicionLimitada: boolean;
  esOferta: boolean;
  esMasVendido: boolean;
  calificacionPromedio: number;
  totalOpiniones: number;
}

export interface ProductoImagenDto {
  url: string;
  textoAlt: string;
  esPrincipal: boolean;
}

export interface OpinionDto {
  nombreCliente: string;
  calificacion: number;
  comentario: string;
  fechaCreacion: string;
}

export interface ProductoDetalle extends ProductoResumen {
  descripcionLarga: string;
  ingredientes: string | null;
  modoUso: string | null;
  beneficios: string | null;
  stock: number;
  imagenes: ProductoImagenDto[];
  opiniones: OpinionDto[];
  relacionados: ProductoResumen[];
}

export type OrdenCatalogo =
  | "relevancia"
  | "precio-asc"
  | "precio-desc"
  | "nombre"
  | "mas-vendidos"
  | "recientes"
  | "descuento";

export interface FiltroProducto {
  busqueda?: string;
  categorias?: string[];
  marcas?: string[];
  precioMin?: number;
  precioMax?: number;
  soloConDescuento?: boolean;
  soloConStock?: boolean;
  orden?: OrdenCatalogo;
  pagina?: number;
  tamanoPagina?: number;
}

export interface PagedResult<T> {
  items: T[];
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
}

export interface CategoriaDto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  icono: string | null;
  totalProductos: number;
}

export interface MarcaDto {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  logoUrl: string | null;
  totalProductos: number;
}

export interface BannerDto {
  titulo: string;
  subtitulo: string | null;
  imagenUrl: string;
  textoBotonPrimario: string | null;
  urlBotonPrimario: string | null;
}

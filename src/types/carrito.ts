export interface CarritoItemInput {
  productoId: number;
  cantidad: number;
}

export interface CarritoItem {
  productoId: number;
  nombre: string;
  slug: string;
  imagenUrl: string;
  precioUnitario: number;
  cantidad: number;
  stockDisponible: number;
  cantidadAjustada: boolean;
  subtotal: number;
}

export interface Carrito {
  items: CarritoItem[];
  subtotal: number;
  descuento: number;
  total: number;
  cantidadTotalItems: number;
  codigoCupon?: string;
  cuponId?: number;
  cuponError?: string;
}

export interface CrearPedidoInput {
  nombreContacto: string;
  telefonoContacto: string;
  direccionEntrega: string;
  observaciones?: string;
  email?: string;
  items: CarritoItemInput[];
  codigoCupon?: string;
}

export interface PedidoDetalleDto {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResumen {
  id: number;
  numeroPedido: string;
  fechaPedido: string;
  estado: string;
  subtotal: number;
  descuento: number;
  cuponCodigo?: string | null;
  total: number;
  nombreContacto: string;
  telefonoContacto: string;
  direccionEntrega: string;
  observaciones: string | null;
  detalles: PedidoDetalleDto[];
  mensajeWhatsApp?: string;
  enlaceWhatsApp?: string;
}

export interface Resultado<T> {
  exitoso: boolean;
  valor?: T;
  errores?: string[];
}

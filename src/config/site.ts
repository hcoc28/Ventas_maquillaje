export const siteConfig = {
  nombre: "Amour Bloom",
  nombreCompleto: "Amour Bloom",
  descripcion: "Tienda en línea de maquillaje 100% original. Brilla con suavidad, florece con estilo.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50200000000",
  whatsappSaludo: "Hola, deseo realizar el siguiente pedido.",
  emailNotificaciones: process.env.STORE_NOTIFICATION_EMAIL ?? "",
  // Cambia a false para ocultar el filtro de "Marcas" en el catálogo sin borrar la funcionalidad.
  mostrarFiltroMarcas: true,
};

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  nombre: "Èclat",
  nombreCompleto: "Èclat Maquillaje",
  descripcion: "Catálogo premium de maquillaje y skincare de lujo.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumero: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "50200000000",
  whatsappSaludo: "Hola, deseo realizar el siguiente pedido.",
};

export type SiteConfig = typeof siteConfig;

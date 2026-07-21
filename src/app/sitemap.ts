import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getTodosLosProductosAdmin } from "@/server/services/producto.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productos = await getTodosLosProductosAdmin();

  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/contacto`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteConfig.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terminos`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const paginasProductos: MetadataRoute.Sitemap = productos
    .filter((p) => p.activo)
    .map((p) => ({
      url: `${siteConfig.url}/producto/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...paginasEstaticas, ...paginasProductos];
}

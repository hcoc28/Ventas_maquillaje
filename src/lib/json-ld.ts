/** Serializa datos para un <script type="application/ld+json">, escapando "</" para evitar que el contenido cierre la etiqueta anfitriona. */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

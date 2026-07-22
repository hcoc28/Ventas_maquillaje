import type { Metadata } from "next";
import { Gem, HeartHandshake, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce la historia y los valores detrás de Amour Bloom Maquillaje.",
  alternates: { canonical: "/nosotros" },
};

const valores = [
  { icon: Gem, titulo: "Calidad Premium", texto: "Seleccionamos solo marcas de alta cosmética que cumplen nuestro estándar de calidad." },
  { icon: Truck, titulo: "Entrega Rápida", texto: "Coordinamos cada pedido directamente por WhatsApp para una experiencia ágil y personal." },
  { icon: ShieldCheck, titulo: "Compra Segura", texto: "Atención personalizada en cada paso, desde la elección hasta la entrega de tu pedido." },
  { icon: HeartHandshake, titulo: "Hecho con Amor", texto: "Cada producto de nuestro catálogo es elegido pensando en realzar tu belleza natural." },
];

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Nuestra historia</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">Sobre Amour Bloom</h1>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-text-muted sm:text-base">
        <p>
          Amour Bloom nació de una idea simple: la alta cosmética debería sentirse cercana, no intimidante. Reunimos
          maquillaje y skincare de marcas de lujo cuidadosamente seleccionadas, y transformamos la experiencia de
          compra en algo tan personal como una recomendación de una amiga de confianza.
        </p>
        <p>
          Cada producto en nuestro catálogo pasa por un proceso de curaduría: buscamos fórmulas de alto desempeño,
          empaques que se sienten especiales y marcas que comparten nuestro compromiso con la calidad. No vendemos
          todo lo que existe en el mercado — vendemos lo que realmente vale la pena tener en tu tocador.
        </p>
        <p>
          Coordinamos cada pedido directamente por WhatsApp porque creemos que comprar productos de belleza debería
          sentirse como una conversación, no como un formulario. Así podemos resolver tus dudas sobre tono, textura
          o ingredientes antes de que tu pedido esté en camino.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
        {valores.map((item) => (
          <div key={item.titulo}>
            <item.icon className="mx-auto mb-2 text-accent-strong" size={28} />
            <h3 className="mb-1 text-sm font-semibold">{item.titulo}</h3>
            <p className="text-xs text-text-muted">{item.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

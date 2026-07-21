import type { Metadata } from "next";
import { FaqAccordion } from "./faq-accordion";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description: "Resuelve tus dudas sobre pedidos, envíos, pagos y devoluciones en Èclat Maquillaje.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const preguntas = [
  {
    pregunta: "¿Cómo realizo un pedido?",
    respuesta:
      "Agrega los productos que deseas a tu carrito y completa el formulario de checkout. Al confirmar, se abrirá WhatsApp con un mensaje ya redactado con el detalle de tu pedido para coordinar el pago y la entrega.",
  },
  {
    pregunta: "¿Qué métodos de pago aceptan?",
    respuesta:
      "Coordinamos el método de pago directamente por WhatsApp: transferencia bancaria, depósito o pago contra entrega según tu ubicación.",
  },
  {
    pregunta: "¿Cuánto tarda la entrega?",
    respuesta:
      "En la Ciudad de Guatemala, los pedidos se entregan generalmente en 1 a 2 días hábiles. Para el resto del país, el tiempo de entrega depende de la paquetería y se confirma al coordinar tu pedido.",
  },
  {
    pregunta: "¿Puedo devolver un producto?",
    respuesta:
      "Aceptamos cambios y devoluciones dentro de los 7 días posteriores a la entrega, siempre que el producto no haya sido usado y conserve su empaque original. Escríbenos por WhatsApp o en nuestro formulario de contacto para iniciar el proceso.",
  },
  {
    pregunta: "¿Los productos son originales?",
    respuesta:
      "Sí. Trabajamos únicamente con marcas y distribuidores autorizados, por lo que todos nuestros productos son 100% originales.",
  },
  {
    pregunta: "¿Cómo sé qué tono o tipo de piel me conviene?",
    respuesta:
      "Escríbenos por WhatsApp antes de tu compra: te ayudamos a elegir el tono o la fórmula ideal según tu tipo de piel y tono natural.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <div className="mb-12 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-strong">Ayuda</span>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl">Preguntas Frecuentes</h1>
      </div>

      <FaqAccordion preguntas={preguntas} />
    </div>
  );
}

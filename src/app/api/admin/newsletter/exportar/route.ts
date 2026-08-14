import { NextResponse } from "next/server";
import { getTodosLosSuscriptoresAdmin } from "@/server/services/newsletter.service";

function escaparCsv(valor: string): string {
  if (/[",\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

export async function GET() {
  const suscriptores = await getTodosLosSuscriptoresAdmin();

  const filas = [
    ["Correo", "Estado", "Fecha de suscripción"].join(","),
    ...suscriptores.map((s) =>
      [escaparCsv(s.email), s.activo ? "Activo" : "Inactivo", s.createdAt.toISOString().slice(0, 10)].join(",")
    ),
  ];

  return new NextResponse(filas.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-suscriptores.csv"',
    },
  });
}

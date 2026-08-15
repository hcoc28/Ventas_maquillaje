import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTodosLosSuscriptoresAdmin } from "@/server/services/newsletter.service";
import { registrarAuditoria } from "@/server/services/log.service";

function escaparCsv(valor: string): string {
  if (/[",\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "Administrador") {
    return NextResponse.json({ mensaje: "Solo un Administrador puede exportar la lista de suscriptores." }, { status: 403 });
  }

  const suscriptores = await getTodosLosSuscriptoresAdmin();

  await registrarAuditoria({
    entidad: "NewsletterSubscriber",
    entidadId: 0,
    accion: "exportar",
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

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

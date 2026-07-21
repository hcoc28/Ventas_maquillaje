import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { categoriaAdminSchema } from "@/validators/admin";
import { crearCategoria, getTodasLasCategoriasAdmin } from "@/services/categoria.service";
import { registrarAuditoria } from "@/services/log.service";

export async function GET() {
  const categorias = await getTodasLasCategoriasAdmin();
  return NextResponse.json(categorias);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = categoriaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const categoria = await crearCategoria(parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Categoria",
    entidadId: categoria.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(categoria, { status: 201 });
}

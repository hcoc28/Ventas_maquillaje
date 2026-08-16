import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { categoriaAdminSchema } from "@/validators/admin";
import { crearCategoria } from "@/server/services/categoria.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = categoriaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let categoria;
  try {
    categoria = await crearCategoria(parsed.data);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo crear la categoría.");
  }

  await registrarAuditoria({
    entidad: "Categoria",
    entidadId: categoria.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(categoria, { status: 201 });
}

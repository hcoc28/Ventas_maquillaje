import { NextRequest, NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin-auth";
import { respuestaErrorAdmin } from "@/lib/api-errors";
import { revalidarCatalogoPublico } from "@/lib/public-cache";
import { productoAdminSchema } from "@/validators/admin";
import { crearProductoAdmin } from "@/server/services/producto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const acceso = await requerirAdmin();
  if (acceso.error) return acceso.error;

  const body = await request.json().catch(() => null);
  const parsed = productoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  let producto;
  try {
    producto = await crearProductoAdmin(parsed.data);
  } catch (error) {
    return respuestaErrorAdmin(error, "No se pudo crear el producto.");
  }

  await registrarAuditoria({
    entidad: "Producto",
    entidadId: producto.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidarCatalogoPublico();

  return NextResponse.json(producto, { status: 201 });
}

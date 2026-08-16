import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin-auth";
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

  const producto = await crearProductoAdmin(parsed.data);

  await registrarAuditoria({
    entidad: "Producto",
    entidadId: producto.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: Number(acceso.session.user.id),
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(producto, { status: 201 });
}

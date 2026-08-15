import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { productoAdminSchema } from "@/validators/admin";
import { crearProductoAdmin } from "@/server/services/producto.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = productoAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const producto = await crearProductoAdmin(parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Producto",
    entidadId: producto.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(producto, { status: 201 });
}

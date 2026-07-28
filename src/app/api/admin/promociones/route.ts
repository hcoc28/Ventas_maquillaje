import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { promocionAdminSchema } from "@/validators/admin";
import { crearPromocion, getTodasLasPromocionesAdmin } from "@/server/services/promocion.service";
import { registrarAuditoria } from "@/server/services/log.service";

export async function GET() {
  const promociones = await getTodasLasPromocionesAdmin();
  return NextResponse.json(promociones);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = promocionAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const promocion = await crearPromocion(parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Promocion",
    entidadId: promocion.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  revalidatePath("/");
  revalidatePath("/producto/[slug]", "page");

  return NextResponse.json(promocion, { status: 201 });
}

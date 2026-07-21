import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { marcaAdminSchema } from "@/validators/admin";
import { crearMarca, getTodasLasMarcasAdmin } from "@/services/marca.service";
import { registrarAuditoria } from "@/services/log.service";

export async function GET() {
  const marcas = await getTodasLasMarcasAdmin();
  return NextResponse.json(marcas);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = marcaAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ mensaje: parsed.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const marca = await crearMarca(parsed.data);

  const session = await auth();
  await registrarAuditoria({
    entidad: "Marca",
    entidadId: marca.id,
    accion: "crear",
    valoresNuevos: parsed.data,
    userId: session?.user?.id ? Number(session.user.id) : null,
  });

  return NextResponse.json(marca, { status: 201 });
}

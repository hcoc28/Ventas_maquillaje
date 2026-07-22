import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "Administrador" && session.user.role !== "Empleado")) {
    return NextResponse.json({ mensaje: "No autorizado." }, { status: 403 });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { mensaje: "Cloudinary no está configurado en el servidor. Pega una URL de imagen mientras tanto." },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const archivo = formData?.get("file");
  if (!archivo || !(archivo instanceof Blob)) {
    return NextResponse.json({ mensaje: "No se recibió ningún archivo." }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json({ mensaje: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." }, { status: 400 });
  }

  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json({ mensaje: "La imagen no puede pesar más de 5MB." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await archivo.arrayBuffer());
    const dataUri = `data:${archivo.type};base64,${bytes.toString("base64")}`;
    const resultado = await cloudinary.uploader.upload(dataUri, { folder: "amourbloom" });
    return NextResponse.json({ url: resultado.secure_url });
  } catch (error) {
    console.error("[cloudinary] Error al subir imagen:", error);
    return NextResponse.json({ mensaje: "No se pudo subir la imagen." }, { status: 500 });
  }
}

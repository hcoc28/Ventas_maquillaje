import { revalidatePath } from "next/cache";

export function revalidarCatalogoPublico() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/producto/[slug]", "page");
}

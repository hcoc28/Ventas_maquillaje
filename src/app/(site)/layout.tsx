import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { NavbarThemeProvider } from "@/components/layout/navbar-theme-context";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FavoritosProvider } from "@/components/favoritos/favoritos-context";
import { getCategoriasActivas } from "@/server/services/categoria.service";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categorias = await getCategoriasActivas();

  return (
    <NavbarThemeProvider>
      <ToastProvider>
        <FavoritosProvider>
          <CartProvider>
            <Navbar categorias={categorias} />
            <main id="contenido-principal" className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </FavoritosProvider>
      </ToastProvider>
    </NavbarThemeProvider>
  );
}

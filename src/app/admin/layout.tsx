import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { ToastProvider } from "@/components/ui/toast-provider";

// El panel administrativo depende de la sesión y del rol en cada solicitud; nunca debe prerenderizarse.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "Administrador" && session.user.role !== "Empleado")) {
    redirect("/");
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <AdminSidebar rol={session.user.role} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <AdminTopbar nombre={session.user.name ?? ""} email={session.user.email ?? ""} />
          <main id="contenido-principal" className="flex-1 p-6 sm:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}

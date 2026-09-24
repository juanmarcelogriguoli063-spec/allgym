import { redirect } from "next/navigation";
import Link from "next/link";
import { ScanLine, Users, CreditCard } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import MobileNav from "@/components/mobile-nav";
import PageTransition from "@/components/page-transition";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCuotaAlertLevel } from "@/lib/cuotas";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/ingreso");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["dueno", "recepcionista", "super_admin"].includes(profile.role)) {
    redirect("/login?next=/admin/ingreso");
  }

  // Cuotas vencidas o por vencer, para el numerito de alerta junto a "Cuotas".
  const { data: cuotas } = await supabase.from("cuotas").select("estado, fecha_vencimiento").neq("estado", "pagado");
  const alertas = (cuotas ?? []).filter((c) => {
    const nivel = getCuotaAlertLevel(c.estado, c.fecha_vencimiento);
    return nivel === "vencida" || nivel === "por_vencer";
  }).length;

  const NAV = [
    { href: "/admin/ingreso", label: "Ingreso", icon: ScanLine, iconName: "ingreso" as const },
    { href: "/admin/clientes", label: "Clientes", icon: Users, iconName: "clientes" as const },
    { href: "/admin/cuotas", label: "Cuotas", icon: CreditCard, iconName: "cuotas" as const, badge: alertas },
  ];

  // Para el menu mobile (Client Component) solo se pueden pasar datos simples,
  // no los componentes de icono: se manda el nombre y el resuelve el icono.
  const mobileItems = NAV.map(({ href, label, iconName, badge }) => ({ href, label, icon: iconName, badge }));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 py-3 lg:hidden">
        <MobileNav items={mobileItems} />
        <span className="text-sm font-bold uppercase tracking-widest">
          Griguoli <span className="text-primary">Gym</span>
        </span>
      </header>

      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-sidebar-border bg-sidebar p-4 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.5)] lg:flex lg:flex-col">
          <div className="mb-6 border-b border-sidebar-border px-2 pb-4">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest">
              Griguoli <span className="text-primary">Gym</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-sidebar-border px-2 pt-4">
            <p className="mb-2 truncate text-xs text-muted-foreground">{user.email}</p>
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

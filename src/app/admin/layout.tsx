import Link from "next/link";
import { ScanLine, Users, CreditCard } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import MobileNav from "@/components/mobile-nav";
import { Badge } from "@/components/ui/badge";
import { getSesion, esGestion, ROL_LABEL } from "@/lib/auth";
import { infoCuota } from "@/lib/cuotas";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, rol } = await getSesion();
  const gestion = esGestion(rol);

  // Cuotas que piden atencion (vencidas o por vencer): numerito junto a "Cuotas".
  // Solo el dueño las ve (recepcion no tiene acceso a esa tabla).
  let alertas = 0;
  if (gestion) {
    const { data: cuotas } = await supabase.from("cuotas").select("estado, fecha_vencimiento").neq("estado", "pagado");
    alertas = (cuotas ?? []).filter((c) => {
      const e = infoCuota(c.estado, c.fecha_vencimiento).estado;
      return e === "vencida" || e === "vence_hoy" || e === "vence_pronto";
    }).length;
  }

  // Recepcion ve UNA sola cosa: el mostrador. El dueño ve todo.
  const NAV = [
    { href: "/admin/ingreso", label: "Control de acceso", icon: ScanLine, iconName: "acceso" as const },
    ...(gestion
      ? [
          { href: "/admin/clientes", label: "Clientes", icon: Users, iconName: "clientes" as const },
          { href: "/admin/cuotas", label: "Cuotas", icon: CreditCard, iconName: "cuotas" as const, badge: alertas },
        ]
      : []),
  ];

  // Para el menu mobile (Client Component) solo se pueden pasar datos simples,
  // no componentes: se manda el nombre del icono y el lo resuelve.
  const mobileItems = NAV.map((item) => ({
    href: item.href,
    label: item.label,
    icon: item.iconName,
    badge: "badge" in item ? item.badge : undefined,
  }));

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
            <Link href="/admin/ingreso" className="text-sm font-bold uppercase tracking-widest">
              Griguoli <span className="text-primary">Gym</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1" aria-label="Principal">
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
                  {"badge" in item && !!item.badge && (
                    <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-primary-foreground">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-sidebar-border px-2 pt-4">
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
              {ROL_LABEL[rol] ?? rol}
            </Badge>
            <p className="mb-2 truncate text-xs text-muted-foreground">{user.email}</p>
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Wallet, ScanLine, Inbox, Clock, UsersRound } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import GymLogo from "@/components/gym-logo";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

const OPERACION = [
  { href: "/admin/ingreso", label: "Control de acceso", icon: ScanLine },
  { href: "/admin/fichaje", label: "Mi turno", icon: Clock },
];

const GESTION = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/socios", label: "Socios", icon: Users },
  { href: "/admin/cuotas", label: "Vencimientos", icon: CreditCard },
  { href: "/admin/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/equipo", label: "Equipo", icon: UsersRound },
];

const ROL_LABEL: Record<string, string> = { dueno: "Dueño", recepcionista: "Recepción" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "recepcionista")) {
    redirect("/login?next=/admin");
  }
  const esDueno = profile.role === "dueno";

  const { count: solicitudesPendientes } = esDueno
    ? await supabase.from("solicitudes").select("id", { count: "exact", head: true }).eq("estado", "pendiente")
    : { count: 0 };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:flex lg:flex-col">
          <div className="mb-6 border-b border-sidebar-border px-2 pb-4">
            <Link href="/">
              <GymLogo size="sm" />
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">Panel admin</p>
          </div>

          <nav className="flex flex-1 flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Día a día
              </p>
              {OPERACION.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            {esDueno && (
              <div className="flex flex-col gap-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Gestión
                </p>
                {GESTION.map((item) => (
                  <NavLink key={item.href} {...item} badge={item.href === "/admin/solicitudes" ? solicitudesPendientes : undefined} />
                ))}
              </div>
            )}
          </nav>

          <div className="mt-6 border-t border-sidebar-border px-2 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                {ROL_LABEL[profile.role] ?? profile.role}
              </Badge>
            </div>
            <p className="mb-2 truncate text-xs text-muted-foreground">{user.email}</p>
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, label, icon: Icon, badge }: { href: string; label: string; icon: typeof ScanLine; badge?: number | null }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {!!badge && (
        <Badge className="h-5 min-w-5 justify-center rounded-full bg-primary px-1.5 text-primary-foreground">
          {badge}
        </Badge>
      )}
    </Link>
  );
}

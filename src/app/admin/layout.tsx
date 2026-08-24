import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Wallet, ScanLine, Inbox } from "lucide-react";
import LogoutButton from "@/components/logout-button";
import GymLogo from "@/components/gym-logo";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/ingreso", label: "Ingreso", icon: ScanLine },
  { href: "/admin/socios", label: "Socios", icon: Users },
  { href: "/admin/cuotas", label: "Cuotas", icon: CreditCard },
  { href: "/admin/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "recepcionista")) {
    redirect("/login?next=/admin");
  }

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
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-sidebar-border px-2 pt-4">
            <p className="mb-2 truncate text-xs text-muted-foreground">{user.email}</p>
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

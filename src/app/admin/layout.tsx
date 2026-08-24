import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/socios", label: "Socios" },
  { href: "/admin/cuotas", label: "Cuotas" },
  { href: "/admin/finanzas", label: "Finanzas" },
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 border-b border-zinc-200 px-2 pb-4 dark:border-zinc-800">
            <Link href="/" className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Griguoli Gym
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Panel admin</p>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 px-2">
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

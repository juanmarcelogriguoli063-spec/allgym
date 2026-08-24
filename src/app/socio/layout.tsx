import { redirect } from "next/navigation";
import GymLogo from "@/components/gym-logo";
import LogoutButton from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";

export default async function SocioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/socio");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "socio") redirect("/login?next=/socio");

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <GymLogo size="sm" />
        <div className="w-36">
          <LogoutButton />
        </div>
      </header>
      <main className="p-4 lg:p-8">{children}</main>
    </div>
  );
}

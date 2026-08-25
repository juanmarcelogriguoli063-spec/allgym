import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ROLES_GESTION = ["dueno", "super_admin"];

/** Guard de página: si el usuario logueado no es "dueno" (o "super_admin",
 * que hereda el mismo acceso), lo manda al control de acceso (la pantalla
 * del recepcionista) en vez de mostrar la sección de gestión. El layout de
 * /admin ya valida que hay sesión y que el rol es staff; esto agrega la
 * restricción más fina "gestión completa". */
export async function requireDuenoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !ROLES_GESTION.includes(profile.role)) redirect("/admin/ingreso");

  return { supabase, user, role: profile.role };
}

/** Guard de página: solo "super_admin" (el dueño de la empresa All Gym,
 * distinto de "dueno" que es dueño de un gimnasio cliente). */
export async function requireSuperAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "super_admin") redirect("/admin");

  return { supabase, user };
}

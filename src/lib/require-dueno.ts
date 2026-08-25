import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Guard de página: si el usuario logueado no es "dueno", lo manda al
 * control de acceso (la pantalla del recepcionista) en vez de mostrar la
 * sección de gestión. El layout de /admin ya valida que hay sesión y que
 * el rol es staff; esto agrega la restricción más fina "solo dueño". */
export async function requireDuenoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "dueno") redirect("/admin/ingreso");

  return { supabase, user };
}

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "dueno" | "recepcionista" | "super_admin" | "socio";

export const ROL_LABEL: Record<string, string> = {
  dueno: "Dueño",
  super_admin: "Dueño",
  recepcionista: "Recepción",
};

/** Puede ver y gestionar clientes, cuotas y precios (no solo el mostrador). */
export function esGestion(rol: string): boolean {
  return rol === "dueno" || rol === "super_admin";
}

/**
 * Sesion + rol del usuario. `cache` hace que el layout y la pagina compartan
 * la misma consulta dentro de un request en vez de repetirla.
 */
export const getSesion = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/ingreso");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["dueno", "recepcionista", "super_admin"].includes(profile.role)) {
    redirect("/login?next=/admin/ingreso");
  }

  return { supabase, user, rol: profile.role as Rol };
});

/**
 * Para las paginas de gestion (Clientes, Cuotas). Recepcion solo opera el
 * Control de acceso: si entra por URL a una de estas, se la lleva a su
 * pantalla en vez de mostrar una tabla vacia (la base no le deja ver clientes).
 */
export async function requireGestion() {
  const sesion = await getSesion();
  if (!esGestion(sesion.rol)) redirect("/admin/ingreso");
  return sesion;
}

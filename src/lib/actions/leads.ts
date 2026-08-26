"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function crearLeadComercial(formData: FormData): Promise<ActionResult> {
  try {
    if (String(formData.get("website") ?? "").trim() !== "") {
      return { success: true }; // honeypot
    }

    const nombre = String(formData.get("nombre") ?? "").trim();
    const gimnasio = String(formData.get("gimnasio") ?? "").trim() || null;
    const telefono = String(formData.get("telefono") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const cantidadSocios = String(formData.get("cantidad_socios") ?? "").trim() || null;
    const mensaje = String(formData.get("mensaje") ?? "").trim() || null;

    if (!nombre) return { error: "El nombre es obligatorio" };
    if (nombre.length > 200) return { error: "Nombre demasiado largo" };
    if (!telefono && !email) return { error: "Dejanos un teléfono o un email para contactarte" };

    const supabase = await createClient();
    const { error } = await supabase.from("leads_comerciales").insert({
      nombre,
      gimnasio,
      telefono,
      email,
      cantidad_socios: cantidadSocios,
      mensaje,
    });

    if (error) return { error: "No se pudo enviar. Probá de nuevo en un momento." };
    return { success: true };
  } catch {
    return { error: "No se pudo enviar. Probá de nuevo en un momento." };
  }
}

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "super_admin") throw new Error("Solo para el dueño de All Gym");
  return supabase;
}

export async function marcarLeadContactado(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireSuperAdmin();
    const { error } = await supabase.from("leads_comerciales").update({ estado: "contactado" }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/plataforma");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function descartarLead(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireSuperAdmin();
    const { error } = await supabase.from("leads_comerciales").update({ estado: "descartado" }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/plataforma");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

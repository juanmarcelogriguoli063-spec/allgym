"use server";

import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function crearLeadComercial(formData: FormData): Promise<ActionResult> {
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
}

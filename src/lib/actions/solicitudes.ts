"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function crearSolicitud(formData: FormData): Promise<ActionResult> {
  // Honeypot anti-spam: campo oculto que solo un bot completaria.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { success: true }; // fingimos exito para no delatar el honeypot
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const mensaje = String(formData.get("mensaje") ?? "").trim() || null;

  if (!nombre) return { error: "El nombre es obligatorio" };
  if (nombre.length > 200) return { error: "Nombre demasiado largo" };
  if (!telefono && !email) return { error: "Dejanos un teléfono o un email para contactarte" };

  const supabase = await createClient();
  const { error } = await supabase.from("solicitudes").insert({ nombre, telefono, email, mensaje });

  if (error) return { error: "No se pudo enviar. Probá de nuevo en un momento." };
  return { success: true };
}

async function requireDueno() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "dueno") {
    throw new Error("Esta acción es solo para el dueño");
  }
  return supabase;
}

export async function descartarSolicitud(id: string): Promise<ActionResult> {
  const supabase = await requireDueno();
  const { error } = await supabase.from("solicitudes").update({ estado: "descartada" }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/solicitudes");
  return { success: true };
}

export async function convertirSolicitudEnSocio(id: string): Promise<ActionResult> {
  const supabase = await requireDueno();

  const { data: sol } = await supabase.from("solicitudes").select("*").eq("id", id).single();
  if (!sol) return { error: "Solicitud no encontrada" };

  const { error: errSocio } = await supabase.from("socios").insert({
    nombre: sol.nombre,
    telefono: sol.telefono,
    email: sol.email,
  });
  if (errSocio) return { error: errSocio.message };

  await supabase.from("solicitudes").update({ estado: "convertida" }).eq("id", id);

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin/socios");
  return { success: true };
}

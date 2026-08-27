"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

async function requireDueno() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "super_admin")) {
    throw new Error("Esta acción es solo para el dueño");
  }
  return { supabase, user };
}

/** Pide al bot que arranque una nueva conexión: pone la sesión en
 * "esperando_qr". El servicio whatsapp-bot (fuera de Vercel) hace polling
 * de esta tabla, ve el pedido, genera el QR real y lo escribe acá. */
export async function pedirConexionWhatsapp(): Promise<ActionResult> {
  try {
    const { supabase } = await requireDueno();
    const { error } = await supabase
      .from("whatsapp_sesiones")
      .update({ estado: "esperando_qr", qr_actual: null, auth_state: null, updated_at: new Date().toISOString() })
      .eq("gym_id", true);
    if (error) return { error: error.message };
    revalidatePath("/admin/whatsapp");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function desconectarWhatsapp(): Promise<ActionResult> {
  try {
    const { supabase } = await requireDueno();
    const { error } = await supabase
      .from("whatsapp_sesiones")
      .update({ estado: "desconectado", numero_conectado: null, qr_actual: null, auth_state: null, updated_at: new Date().toISOString() })
      .eq("gym_id", true);
    if (error) return { error: error.message };
    revalidatePath("/admin/whatsapp");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function guardarConfigWhatsapp(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireDueno();

    const plantilla = String(formData.get("plantilla_recordatorio") ?? "").trim();
    const dias = Number(formData.get("dias_anticipacion"));
    const activo = formData.get("activo") === "on";

    if (!plantilla) return { error: "La plantilla no puede estar vacía" };
    if (!Number.isFinite(dias) || dias < 0 || dias > 30) return { error: "Días de anticipación inválido (0-30)" };

    const { error } = await supabase
      .from("whatsapp_config")
      .update({ plantilla_recordatorio: plantilla, dias_anticipacion: dias, activo })
      .eq("gym_id", true);
    if (error) return { error: error.message };

    revalidatePath("/admin/whatsapp");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function crearBroadcastWhatsapp(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireDueno();

    const mensaje = String(formData.get("mensaje") ?? "").trim();
    const segmento = String(formData.get("segmento") ?? "activos");

    if (!mensaje) return { error: "El mensaje no puede estar vacío" };
    if (mensaje.length > 1000) return { error: "Mensaje demasiado largo (máx. 1000 caracteres)" };
    if (segmento !== "todos" && segmento !== "activos") return { error: "Segmento inválido" };

    const { error } = await supabase.from("whatsapp_broadcasts").insert({
      mensaje,
      segmento,
      creado_por: user.id,
    });
    if (error) return { error: error.message };

    revalidatePath("/admin/whatsapp");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

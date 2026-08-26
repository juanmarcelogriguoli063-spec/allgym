"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true; warning?: string } | { error: string };

export async function crearSolicitud(formData: FormData): Promise<ActionResult> {
  try {
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
  } catch {
    return { error: "No se pudo enviar. Probá de nuevo en un momento." };
  }
}

async function requireDueno() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "super_admin")) {
    throw new Error("Esta acción es solo para el dueño");
  }
  return supabase;
}

export async function descartarSolicitud(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireDueno();
    const { error } = await supabase.from("solicitudes").update({ estado: "descartada" }).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/solicitudes");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function convertirSolicitudEnSocio(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireDueno();

    const { data: sol } = await supabase.from("solicitudes").select("*").eq("id", id).single();
    if (!sol) return { error: "Solicitud no encontrada" };

    const { data: socio, error: errSocio } = await supabase
      .from("socios")
      .insert({
        nombre: sol.nombre,
        telefono: sol.telefono,
        email: sol.email,
      })
      .select("id")
      .single();
    if (errSocio) {
      if (errSocio.code === "23505") return { error: "Ya existe un socio con esos datos" };
      return { error: errSocio.message };
    }

    await supabase.from("solicitudes").update({ estado: "convertida" }).eq("id", id);

    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin/socios");
    revalidatePath("/admin");

    // Sin esto, el socio queda sin plan y sin ninguna cuota — y no hay forma
    // de cargarle una primera cuota desde la UI (SocioDialog solo edita, no
    // genera cuotas). Igual que en crearSocio: cuota inicial pendiente,
    // vence hoy, sin plan asignado hasta que el dueño se lo asigne editando.
    if (socio) {
      const { error: cuotaError } = await supabase.from("cuotas").insert({
        socio_id: socio.id,
        plan_id: null,
        periodo: new Date().toISOString().slice(0, 7),
        monto: 0,
        estado: "pendiente",
        fecha_vencimiento: new Date().toISOString().slice(0, 10),
      });
      if (cuotaError) {
        return {
          success: true,
          warning: `Solicitud convertida, pero no se pudo generar la primera cuota: ${cuotaError.message}. Asigná un plan desde la ficha del socio.`,
        };
      }
    }

    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

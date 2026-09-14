"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCuotaAlertLevel } from "@/lib/cuotas";

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "recepcionista" && profile.role !== "super_admin")) {
    throw new Error("No autorizado");
  }
  return { supabase, user };
}

type ActionResult = { success: true; warning?: string } | { error: string };

export async function crearCliente(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const nombre = String(formData.get("nombre") ?? "").trim();
    const dni = String(formData.get("dni") ?? "").trim() || null;
    const telefono = String(formData.get("telefono") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const planId = String(formData.get("plan_id") ?? "").trim() || null;

    if (!nombre) return { error: "El nombre es obligatorio" };

    const { data: socio, error } = await supabase
      .from("socios")
      .insert({ nombre, dni, telefono, email, plan_id: planId })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un cliente con ese DNI" };
      return { error: error.message };
    }
    if (!socio) return { error: "No se pudo crear el cliente" };

    let monto = 0;
    if (planId) {
      const { data: plan } = await supabase.from("planes").select("precio").eq("id", planId).single();
      monto = plan?.precio ?? 0;
    }

    // Primera cuota: pendiente, vence hoy — se cobra al momento del alta y,
    // al marcarla pagada, el trigger de la base genera la proxima sola.
    const { error: cuotaError } = await supabase.from("cuotas").insert({
      socio_id: socio.id,
      plan_id: planId,
      periodo: new Date().toISOString().slice(0, 7),
      monto,
      estado: "pendiente",
      fecha_vencimiento: new Date().toISOString().slice(0, 10),
    });

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/cuotas");

    if (cuotaError) {
      return { success: true, warning: `Cliente creado, pero no se pudo generar la primera cuota: ${cuotaError.message}` };
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function actualizarCliente(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const nombre = String(formData.get("nombre") ?? "").trim();
    const dni = String(formData.get("dni") ?? "").trim() || null;
    const telefono = String(formData.get("telefono") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const planId = String(formData.get("plan_id") ?? "").trim() || null;
    const estado = String(formData.get("estado") ?? "activo");

    if (!nombre) return { error: "El nombre es obligatorio" };

    const { error } = await supabase
      .from("socios")
      .update({ nombre, dni, telefono, email, plan_id: planId, estado })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un cliente con ese DNI" };
      return { error: error.message };
    }

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/cuotas");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function marcarCuotaPagada(cuotaId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();
    const { error } = await supabase.rpc("marcar_cuota_pagada_staff", { p_cuota_id: cuotaId });
    if (error) return { error: error.message };

    revalidatePath("/admin/cuotas");
    revalidatePath("/admin/clientes");
    revalidatePath("/admin/ingreso");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export type IngresoResultado = {
  nombre: string;
  estado: string;
  cuotaId: string | null;
  fechaVencimiento: string | null;
  nivel: ReturnType<typeof getCuotaAlertLevel>;
  diasRestantes: number | null;
} | { error: string };

export async function buscarClientePorDni(dni: string): Promise<IngresoResultado> {
  try {
    if (!dni.trim()) return { error: "Ingresá un DNI" };

    const { supabase } = await requireStaff();
    const { data, error } = await supabase
      .rpc("buscar_socio_por_dni", { p_dni: dni })
      .returns<
        {
          socio_id: string;
          nombre: string;
          estado_socio: string;
          cuota_id: string | null;
          cuota_estado: string | null;
          cuota_fecha_vencimiento: string | null;
        }[]
      >()
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: "No se encontró ningún cliente con ese DNI" };

    const nivel = getCuotaAlertLevel(data.cuota_estado ?? "pendiente", data.cuota_fecha_vencimiento ?? null);
    let diasRestantes: number | null = null;
    if (data.cuota_fecha_vencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diasRestantes = Math.ceil((new Date(data.cuota_fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);
    }

    return {
      nombre: data.nombre,
      estado: data.estado_socio,
      cuotaId: data.cuota_id,
      fechaVencimiento: data.cuota_fecha_vencimiento,
      nivel,
      diasRestantes,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

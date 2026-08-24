"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCuotaAlertLevel } from "@/lib/cuotas";

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || (profile.role !== "dueno" && profile.role !== "recepcionista")) {
    throw new Error("No autorizado");
  }
  return { supabase, user };
}

type ActionResult = { success: true; warning?: string } | { error: string };

export async function crearSocio(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const nombre = String(formData.get("nombre") ?? "").trim();
    const telefono = String(formData.get("telefono") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const dni = String(formData.get("dni") ?? "").trim() || null;
    const planId = String(formData.get("plan_id") ?? "").trim() || null;

    if (!nombre) return { error: "El nombre es obligatorio" };

    const { data: socio, error } = await supabase
      .from("socios")
      .insert({ nombre, telefono, email, dni, plan_id: planId })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un socio con ese DNI" };
      return { error: error.message };
    }
    if (!socio) return { error: "No se pudo crear el socio" };

    let monto = 0;
    if (planId) {
      const { data: plan } = await supabase.from("planes").select("precio").eq("id", planId).single();
      monto = plan?.precio ?? 0;
    }

    // Primera cuota: pendiente, vence hoy — el staff la cobra al momento del alta
    // y al marcarla pagada se dispara la renovacion automatica (trigger en DB).
    const { error: cuotaError } = await supabase.from("cuotas").insert({
      socio_id: socio.id,
      plan_id: planId,
      periodo: new Date().toISOString().slice(0, 7),
      monto,
      estado: "pendiente",
      fecha_vencimiento: new Date().toISOString().slice(0, 10),
    });

    revalidatePath("/admin/socios");
    revalidatePath("/admin");

    if (cuotaError) {
      // El socio SÍ se creó; que la staff sepa que tiene que cargar la
      // primera cuota a mano en vez de creer que quedó todo listo.
      return { success: true, warning: `Socio creado, pero no se pudo generar la primera cuota: ${cuotaError.message}` };
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function actualizarSocio(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const nombre = String(formData.get("nombre") ?? "").trim();
    const telefono = String(formData.get("telefono") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const dni = String(formData.get("dni") ?? "").trim() || null;
    const planId = String(formData.get("plan_id") ?? "").trim() || null;
    const estado = String(formData.get("estado") ?? "activo");

    if (!nombre) return { error: "El nombre es obligatorio" };

    const { error } = await supabase
      .from("socios")
      .update({ nombre, telefono, email, dni, plan_id: planId, estado })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un socio con ese DNI" };
      return { error: error.message };
    }

    revalidatePath("/admin/socios");
    revalidatePath(`/admin/socios/${id}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function marcarCuotaPagada(cuotaId: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const { error } = await supabase
      .from("cuotas")
      .update({ estado: "pagado", fecha_pago: new Date().toISOString().slice(0, 10) })
      .eq("id", cuotaId);

    if (error) return { error: error.message };

    revalidatePath("/admin/cuotas");
    revalidatePath("/admin/socios");
    revalidatePath("/admin");
    revalidatePath("/admin/ingreso");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function crearMovimiento(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireStaff();

    const tipo = String(formData.get("tipo") ?? "ingreso");
    const categoria = String(formData.get("categoria") ?? "").trim() || null;
    const descripcion = String(formData.get("descripcion") ?? "").trim() || null;
    const monto = Number(formData.get("monto"));
    const fecha = String(formData.get("fecha") ?? new Date().toISOString().slice(0, 10));

    if (!Number.isFinite(monto) || monto <= 0) return { error: "El monto debe ser mayor a 0" };
    if (tipo !== "ingreso" && tipo !== "egreso") return { error: "Tipo de movimiento inválido" };

    const { error } = await supabase.from("finanzas_movimientos").insert({
      tipo,
      categoria,
      descripcion,
      monto,
      fecha,
      origen: "manual",
    });

    if (error) return { error: error.message };

    revalidatePath("/admin/finanzas");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function crearSeguimiento(socioId: string, nota: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireStaff();

    if (!nota.trim()) return { error: "La nota no puede estar vacía" };

    const { error } = await supabase.from("seguimientos").insert({
      socio_id: socioId,
      autor_id: user.id,
      nota: nota.trim(),
    });

    if (error) return { error: error.message };

    revalidatePath(`/admin/socios/${socioId}`);
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

export async function buscarSocioPorDni(dni: string): Promise<IngresoResultado> {
  try {
    if (!dni.trim()) return { error: "Ingresá un DNI" };

    const { supabase } = await requireStaff();

    const { data: socio, error } = await supabase
      .from("socios")
      .select("id, nombre, estado")
      .eq("dni", dni.trim())
      .maybeSingle();

    if (error) return { error: error.message };
    if (!socio) return { error: "No se encontró ningún socio con ese DNI" };

    const { data: cuota, error: cuotaError } = await supabase
      .from("cuotas")
      .select("id, estado, fecha_vencimiento")
      .eq("socio_id", socio.id)
      .order("fecha_vencimiento", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cuotaError) return { error: cuotaError.message };

    const nivel = getCuotaAlertLevel(cuota?.estado ?? "pendiente", cuota?.fecha_vencimiento ?? null);
    let diasRestantes: number | null = null;
    if (cuota?.fecha_vencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diasRestantes = Math.ceil((new Date(cuota.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);
    }

    return {
      nombre: socio.nombre,
      estado: socio.estado,
      cuotaId: cuota?.id ?? null,
      fechaVencimiento: cuota?.fecha_vencimiento ?? null,
      nivel,
      diasRestantes,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

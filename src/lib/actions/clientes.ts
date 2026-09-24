"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { infoCuota, type EstadoCuota } from "@/lib/cuotas";
import { hoyAR, periodoActualAR } from "@/lib/fechas";
import { dniValido, normalizarDni } from "@/lib/datos";

const BUCKET_FOTOS = "fotos-socios";
const MAX_FOTO_BYTES = 900 * 1024; // el body de una Server Action tiene tope de 1 MB

async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Tu sesión venció. Volvé a iniciar sesión.");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["dueno", "recepcionista", "super_admin"].includes(profile.role)) {
    throw new Error("No tenés permiso para esta acción");
  }
  return { supabase, user, rol: profile.role as string };
}

// Alta/edicion de clientes y de fotos: solo el dueño (recepcion solo opera el
// control de acceso). La base lo exige igual (RLS); esto da un mensaje claro.
async function requireDueno() {
  const sesion = await requireStaff();
  if (sesion.rol !== "dueno" && sesion.rol !== "super_admin") {
    throw new Error("Esta acción es solo para el dueño");
  }
  return sesion;
}

type ActionResult = { success: true; warning?: string } | { error: string };

function leerCampos(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    dni: normalizarDni(String(formData.get("dni") ?? "")),
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    planId: String(formData.get("plan_id") ?? "").trim() || null,
  };
}

function leerFoto(formData: FormData): File | null {
  const f = formData.get("foto");
  if (f && typeof f === "object" && "arrayBuffer" in f && f.size > 0) return f as File;
  return null;
}

async function guardarFoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  socioId: string,
  foto: File
): Promise<string | null> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(foto.type)) return "La foto debe ser JPG, PNG o WEBP.";
  if (foto.size > MAX_FOTO_BYTES) return "La foto pesa demasiado. Sacá otra.";

  const path = `${socioId}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_FOTOS)
    .upload(path, await foto.arrayBuffer(), { contentType: foto.type, upsert: true });
  if (error) return error.message;

  const { error: errUpdate } = await supabase.from("socios").update({ foto_path: path }).eq("id", socioId);
  return errUpdate ? errUpdate.message : null;
}

export async function crearCliente(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireDueno();
    const { nombre, dni, telefono, email, planId } = leerCampos(formData);
    const foto = leerFoto(formData);

    if (!nombre) return { error: "El nombre es obligatorio" };
    if (dni && !dniValido(dni)) return { error: "El DNI debe tener entre 6 y 9 números" };

    const { data: socio, error } = await supabase
      .from("socios")
      .insert({ nombre, dni: dni || null, telefono, email, plan_id: planId })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un cliente con ese DNI" };
      return { error: error.message };
    }
    if (!socio) return { error: "No se pudo crear el cliente" };

    const avisos: string[] = [];

    let monto = 0;
    if (planId) {
      const { data: plan } = await supabase.from("planes").select("precio").eq("id", planId).single();
      monto = plan?.precio ?? 0;
    }

    // Primera cuota: pendiente, vence hoy. Se cobra al momento del alta y, al
    // marcarla pagada, la base genera sola la próxima.
    const hoy = hoyAR();
    const { error: cuotaError } = await supabase.from("cuotas").insert({
      socio_id: socio.id,
      plan_id: planId,
      periodo: periodoActualAR(),
      monto,
      estado: "pendiente",
      fecha_vencimiento: hoy,
    });
    if (cuotaError) avisos.push(`no se pudo generar la primera cuota (${cuotaError.message})`);

    if (foto) {
      const errFoto = await guardarFoto(supabase, socio.id, foto);
      if (errFoto) avisos.push(`no se pudo guardar la foto (${errFoto})`);
    }

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/cuotas");

    if (avisos.length) return { success: true, warning: `Cliente creado, pero ${avisos.join(" y ")}.` };
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

export async function actualizarCliente(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await requireDueno();
    const { nombre, dni, telefono, email, planId } = leerCampos(formData);
    const estado = String(formData.get("estado") ?? "activo");
    const foto = leerFoto(formData);

    if (!nombre) return { error: "El nombre es obligatorio" };
    if (dni && !dniValido(dni)) return { error: "El DNI debe tener entre 6 y 9 números" };
    if (!["activo", "pausado", "baja"].includes(estado)) return { error: "Estado inválido" };

    const { error } = await supabase
      .from("socios")
      .update({ nombre, dni: dni || null, telefono, email, plan_id: planId, estado })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") return { error: "Ya existe un cliente con ese DNI" };
      return { error: error.message };
    }

    let warning: string | undefined;
    if (foto) {
      const errFoto = await guardarFoto(supabase, id, foto);
      if (errFoto) warning = `Cliente actualizado, pero no se pudo guardar la foto (${errFoto}).`;
    }

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/cuotas");
    return warning ? { success: true, warning } : { success: true };
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

export type IngresoResultado =
  | {
      nombre: string;
      estadoCliente: string;
      fotoUrl: string | null;
      cuotaId: string | null;
      monto: number | null;
      fechaVencimiento: string | null;
      estadoCuota: EstadoCuota;
      dias: number | null;
    }
  | { error: string };

type FilaIngreso = {
  socio_id: string;
  nombre: string;
  estado_socio: string;
  foto_path: string | null;
  cuota_id: string | null;
  cuota_estado: string | null;
  cuota_fecha_vencimiento: string | null;
  cuota_monto: number | null;
};

export async function buscarClientePorDni(dniCrudo: string): Promise<IngresoResultado> {
  try {
    const dni = normalizarDni(dniCrudo);
    if (!dni) return { error: "Ingresá un DNI" };

    const { supabase } = await requireStaff();
    const { data, error } = await supabase
      .rpc("buscar_socio_por_dni", { p_dni: dni })
      .returns<FilaIngreso[]>()
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data) return { error: `No hay ningún cliente registrado con el DNI ${dni}` };

    const info = infoCuota(data.cuota_estado, data.cuota_fecha_vencimiento);

    // Foto: URL firmada que vence en 5 minutos (el bucket es privado).
    let fotoUrl: string | null = null;
    if (data.foto_path) {
      const { data: firmada } = await supabase.storage.from(BUCKET_FOTOS).createSignedUrl(data.foto_path, 300);
      fotoUrl = firmada?.signedUrl ?? null;
    }

    return {
      nombre: data.nombre,
      estadoCliente: data.estado_socio,
      fotoUrl,
      cuotaId: data.cuota_id,
      monto: data.cuota_monto === null ? null : Number(data.cuota_monto),
      fechaVencimiento: data.cuota_fecha_vencimiento,
      estadoCuota: info.estado,
      dias: info.dias,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

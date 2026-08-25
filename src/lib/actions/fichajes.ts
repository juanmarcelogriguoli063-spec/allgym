"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { success: true } | { error: string };

export async function marcarFichaje(tipo: "entrada" | "salida"): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { error } = await supabase.from("fichajes").insert({ profile_id: user.id, tipo });
    if (error) return { error: error.message };

    revalidatePath("/admin/fichaje");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error inesperado" };
  }
}

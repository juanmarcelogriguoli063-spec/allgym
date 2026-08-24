import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import CuotaBadge from "@/components/cuota-badge";
import { getCuotaAlertLevel } from "@/lib/cuotas";

export default async function SocioHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: socio } = await supabase
    .from("socios")
    .select("nombre, planes(nombre), cuotas(id, estado, fecha_vencimiento, monto)")
    .eq("profile_id", user!.id)
    .maybeSingle();

  if (!socio) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi cuenta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Todavía no tenés una ficha de socio vinculada. Pedile al staff que la vincule desde el panel.
        </p>
      </div>
    );
  }

  const cuotas = (socio.cuotas ?? []) as { id: string; estado: string; fecha_vencimiento: string | null; monto: number }[];
  const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
  const nivel = ultima ? getCuotaAlertLevel(ultima.estado, ultima.fecha_vencimiento) : "pendiente";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-foreground">Hola, {socio.nombre}</h1>

      {(nivel === "vencida" || nivel === "por_vencer") && (
        <Card className={nivel === "vencida" ? "border-destructive/40 bg-destructive/5" : "border-primary/40 bg-primary/5"}>
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className={nivel === "vencida" ? "size-5 text-destructive" : "size-5 text-primary"} />
            <p className="text-sm">
              {nivel === "vencida" ? "Tu cuota está vencida." : "Tu cuota está por vencer."} Acercate a recepción para renovarla.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-2 pt-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
          <p className="font-medium">{(socio.planes as unknown as { nombre: string } | null)?.nombre ?? "Sin plan"}</p>
          {ultima && (
            <>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Estado de cuota</p>
              <div className="flex items-center gap-2">
                <CuotaBadge estado={ultima.estado} fechaVencimiento={ultima.fecha_vencimiento} />
                <span className="text-sm text-muted-foreground">Vence {ultima.fecha_vencimiento ?? "—"}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

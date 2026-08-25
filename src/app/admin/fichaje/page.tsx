import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FichajeButton from "./fichaje-button";

export default async function FichajePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: fichajes } = await supabase
    .from("fichajes")
    .select("tipo, fecha_hora")
    .eq("profile_id", user!.id)
    .order("fecha_hora", { ascending: false })
    .limit(14);

  const ultimo = fichajes?.[0];
  const proximoTipo: "entrada" | "salida" = ultimo?.tipo === "entrada" ? "salida" : "entrada";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Mi turno</h1>
        <p className="text-sm text-muted-foreground">
          {ultimo
            ? `Último registro: ${ultimo.tipo} el ${new Date(ultimo.fecha_hora).toLocaleString("es-AR")}`
            : "Todavía no marcaste ningún turno."}
        </p>
      </div>

      <FichajeButton proximoTipo={proximoTipo} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos registros</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col divide-y divide-border">
            {(fichajes ?? []).map((f, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="capitalize text-foreground">{f.tipo}</span>
                <span className="text-muted-foreground">{new Date(f.fecha_hora).toLocaleString("es-AR")}</span>
              </li>
            ))}
            {(fichajes ?? []).length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">Sin registros todavía.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

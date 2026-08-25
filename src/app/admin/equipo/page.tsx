import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireDuenoPage } from "@/lib/require-dueno";

export default async function EquipoPage() {
  const { supabase } = await requireDuenoPage();

  const { data: fichajes } = await supabase
    .from("fichajes")
    .select("id, tipo, fecha_hora, profiles(full_name, email)")
    .order("fecha_hora", { ascending: false })
    .limit(150);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
        <p className="text-sm text-muted-foreground">Fichaje de entrada y salida de tu staff.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha y hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(fichajes ?? []).map((f) => {
                const persona = f.profiles as unknown as { full_name: string | null; email: string | null } | null;
                return (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{persona?.full_name ?? persona?.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={f.tipo === "entrada" ? "border-emerald-500/30 text-emerald-400" : "border-destructive/30 text-destructive"}
                      >
                        {f.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(f.fecha_hora).toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(fichajes ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    Sin fichajes registrados todavía.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

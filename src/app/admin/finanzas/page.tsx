import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MovimientoDialog from "./movimiento-dialog";

export default async function FinanzasPage() {
  const supabase = await createClient();

  const { data: movimientos } = await supabase
    .from("finanzas_movimientos")
    .select("*")
    .order("fecha", { ascending: false })
    .limit(200);

  const rows = movimientos ?? [];
  const totalIngresos = rows.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0);
  const totalEgresos = rows.filter((m) => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
          <p className="text-sm text-muted-foreground">Movimientos manuales y de cuotas cobradas.</p>
        </div>
        <MovimientoDialog />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingresos</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">${totalIngresos.toLocaleString("es-AR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Egresos</p>
            <p className="mt-1 text-2xl font-bold text-destructive">${totalEgresos.toLocaleString("es-AR")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              ${(totalIngresos - totalEgresos).toLocaleString("es-AR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-muted-foreground">{m.fecha}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={m.tipo === "ingreso" ? "border-emerald-500/30 text-emerald-400" : "border-destructive/30 text-destructive"}>
                      {m.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.categoria ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{m.descripcion ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{m.origen}</TableCell>
                  <TableCell className="text-right font-medium">
                    {m.tipo === "egreso" ? "-" : ""}${Number(m.monto).toLocaleString("es-AR")}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Sin movimientos registrados.
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

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SolicitudActions from "./solicitud-actions";

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const { data: solicitudes } = await supabase
    .from("solicitudes")
    .select("*")
    .order("created_at", { ascending: false });

  const pendientes = (solicitudes ?? []).filter((s) => s.estado === "pendiente");
  const resto = (solicitudes ?? []).filter((s) => s.estado !== "pendiente");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Solicitudes</h1>
        <p className="text-sm text-muted-foreground">Gente que dejó sus datos desde la página pública.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendientes.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{s.telefono ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{s.mensaje ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <SolicitudActions id={s.id} />
                  </TableCell>
                </TableRow>
              ))}
              {pendientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Sin solicitudes pendientes.
                  </TableCell>
                </TableRow>
              )}
              {resto.map((s) => (
                <TableRow key={s.id} className="opacity-50">
                  <TableCell className="font-medium">{s.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{s.telefono ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{s.mensaje ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="capitalize">{s.estado}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

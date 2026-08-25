import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireSuperAdminPage } from "@/lib/require-dueno";
import LeadActions from "./lead-actions";

export default async function PlataformaPage() {
  const { supabase } = await requireSuperAdminPage();

  const [{ data: leads }, { count: sociosActivos }] = await Promise.all([
    supabase.from("leads_comerciales").select("*").order("created_at", { ascending: false }),
    supabase.from("socios").select("id", { count: "exact", head: true }).eq("estado", "activo"),
  ]);

  const nuevos = (leads ?? []).filter((l) => l.estado === "nuevo");
  const resto = (leads ?? []).filter((l) => l.estado !== "nuevo");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plataforma All Gym</h1>
        <p className="text-sm text-muted-foreground">
          Vista general del negocio — distinta del panel de Griguoli Gym.
        </p>
      </div>

      <Card className="border-primary/25">
        <CardContent className="flex items-center gap-4 pt-6">
          <Building2 className="size-8 text-primary" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Gimnasios clientes</p>
            <p className="text-2xl font-bold text-foreground">1 activo — Griguoli Gym ({sociosActivos ?? 0} socios)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Todavía mono-tenant: cuando sumes el segundo gimnasio pagando, esta sección pasa a listarlos a todos.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Leads comerciales</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Gimnasio</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Socios aprox.</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nuevos.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{l.gimnasio ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.telefono ?? l.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.cantidad_socios ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{l.mensaje ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <LeadActions id={l.id} />
                    </TableCell>
                  </TableRow>
                ))}
                {nuevos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Sin leads nuevos.
                    </TableCell>
                  </TableRow>
                )}
                {resto.map((l) => (
                  <TableRow key={l.id} className="opacity-50">
                    <TableCell className="font-medium">{l.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{l.gimnasio ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.telefono ?? l.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{l.cantidad_socios ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{l.mensaje ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(l.created_at).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="capitalize">{l.estado}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import ClienteDialog from "./cliente-dialog";
import { UserRoundPlus } from "lucide-react";

export default async function ClientesPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: planes }] = await Promise.all([
    supabase
      .from("socios")
      .select("id, nombre, telefono, email, dni, estado, plan_id, planes(nombre), cuotas(estado, fecha_vencimiento)")
      .order("nombre"),
    supabase.from("planes").select("id, nombre, precio").eq("activo", true).order("precio"),
  ]);

  const rows = (clientes ?? []).map((c) => {
    const cuotas = (c.cuotas ?? []) as { estado: string; fecha_vencimiento: string | null }[];
    const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
    return { ...c, ultimaCuota: ultima };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{rows.length} clientes registrados</p>
        </div>
        <ClienteDialog planes={planes ?? []} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>DNI</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Cuota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">{c.dni ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.telefono ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(c.planes as unknown as { nombre: string } | null)?.nombre ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.ultimaCuota ? (
                      <CuotaBadge estado={c.ultimaCuota.estado} fechaVencimiento={c.ultimaCuota.fecha_vencimiento} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">{c.estado}</TableCell>
                  <TableCell className="text-right">
                    <ClienteDialog planes={planes ?? []} cliente={c} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserRoundPlus className="size-10 opacity-40" />
                      <p>Todavía no hay clientes cargados.</p>
                      <p className="text-xs">Usá el botón &quot;Nuevo cliente&quot; para empezar.</p>
                    </div>
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

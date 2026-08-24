import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import SocioDialog from "./socio-dialog";

export default async function SociosPage() {
  const supabase = await createClient();

  const [{ data: socios }, { data: planes }] = await Promise.all([
    supabase
      .from("socios")
      .select("id, nombre, telefono, dni, estado, plan_id, planes(nombre), cuotas(estado, fecha_vencimiento)")
      .order("nombre"),
    supabase.from("planes").select("id, nombre, precio").eq("activo", true).order("precio"),
  ]);

  const rows = (socios ?? []).map((s) => {
    const cuotas = (s.cuotas ?? []) as { estado: string; fecha_vencimiento: string | null }[];
    const ultima = [...cuotas].sort((a, b) => (b.fecha_vencimiento ?? "").localeCompare(a.fecha_vencimiento ?? ""))[0];
    return { ...s, ultimaCuota: ultima };
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Socios</h1>
          <p className="text-sm text-muted-foreground">{rows.length} socios registrados</p>
        </div>
        <SocioDialog planes={planes ?? []} />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/socios/${s.id}`} className="hover:text-primary hover:underline">
                      {s.nombre}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.dni ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{s.telefono ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(s.planes as unknown as { nombre: string } | null)?.nombre ?? "—"}
                  </TableCell>
                  <TableCell>
                    {s.ultimaCuota ? (
                      <CuotaBadge estado={s.ultimaCuota.estado} fechaVencimiento={s.ultimaCuota.fecha_vencimiento} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">{s.estado}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Todavía no hay socios cargados.
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

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import MarkPaidButton from "@/components/mark-paid-button";
import SocioDialog from "../socio-dialog";

export default async function SocioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: socio }, { data: planes }, { data: cuotas }] = await Promise.all([
    supabase.from("socios").select("*, planes(nombre)").eq("id", id).single(),
    supabase.from("planes").select("id, nombre, precio").eq("activo", true).order("precio"),
    supabase.from("cuotas").select("*").eq("socio_id", id).order("fecha_vencimiento", { ascending: false }),
  ]);

  if (!socio) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{socio.nombre}</h1>
          <p className="text-sm text-muted-foreground">
            {(socio.planes as unknown as { nombre: string } | null)?.nombre ?? "Sin plan"} · DNI {socio.dni ?? "—"}
          </p>
        </div>
        <SocioDialog planes={planes ?? []} socio={socio} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
            <p className="mt-1 font-medium">{socio.telefono ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
            <p className="mt-1 font-medium">{socio.email ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Estado</p>
            <p className="mt-1 font-medium capitalize">{socio.estado}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de cuotas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(cuotas ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.periodo}</TableCell>
                  <TableCell>${Number(c.monto).toLocaleString("es-AR")}</TableCell>
                  <TableCell className="text-muted-foreground">{c.fecha_vencimiento ?? "—"}</TableCell>
                  <TableCell>
                    <CuotaBadge estado={c.estado} fechaVencimiento={c.fecha_vencimiento} />
                  </TableCell>
                  <TableCell className="text-right">
                    {c.estado !== "pagado" && <MarkPaidButton cuotaId={c.id} />}
                  </TableCell>
                </TableRow>
              ))}
              {(cuotas ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Sin cuotas registradas.
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

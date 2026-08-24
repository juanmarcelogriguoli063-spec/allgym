import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import MarkPaidButton from "@/components/mark-paid-button";
import WhatsappRecordatorioButton from "@/components/whatsapp-recordatorio-button";
import { getCuotaAlertLevel } from "@/lib/cuotas";

const ORDEN: Record<string, number> = { vencida: 0, por_vencer: 1, pendiente: 2, pagado: 3 };

export default async function CuotasPage() {
  const supabase = await createClient();

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("id, periodo, monto, estado, fecha_vencimiento, socios(id, nombre, telefono)")
    .order("fecha_vencimiento", { ascending: true });

  const rows = (cuotas ?? [])
    .map((c) => ({ ...c, nivel: getCuotaAlertLevel(c.estado, c.fecha_vencimiento) }))
    .sort((a, b) => ORDEN[a.nivel] - ORDEN[b.nivel]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Cuotas</h1>
        <p className="text-sm text-muted-foreground">Vencidas y por vencer primero.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Socio</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const socio = c.socios as unknown as { id: string; nombre: string; telefono: string | null } | null;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      {socio ? (
                        <Link href={`/admin/socios/${socio.id}`} className="hover:text-primary hover:underline">
                          {socio.nombre}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{socio?.telefono ?? "—"}</TableCell>
                    <TableCell>{c.periodo}</TableCell>
                    <TableCell>${Number(c.monto).toLocaleString("es-AR")}</TableCell>
                    <TableCell className="text-muted-foreground">{c.fecha_vencimiento ?? "—"}</TableCell>
                    <TableCell>
                      <CuotaBadge estado={c.estado} fechaVencimiento={c.fecha_vencimiento} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {c.estado !== "pagado" && c.nivel !== "pendiente" && (
                          <WhatsappRecordatorioButton
                            telefono={socio?.telefono ?? null}
                            nombre={socio?.nombre ?? ""}
                            estado={c.estado}
                            fechaVencimiento={c.fecha_vencimiento}
                            monto={Number(c.monto)}
                          />
                        )}
                        {c.estado !== "pagado" && <MarkPaidButton cuotaId={c.id} />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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

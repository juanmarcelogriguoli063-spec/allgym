import Link from "next/link";
import { CreditCard, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CuotaBadge from "@/components/cuota-badge";
import ClienteAvatar from "@/components/cliente-avatar";
import MarkPaidButton from "@/components/mark-paid-button";
import { requireGestion } from "@/lib/auth";
import { ORDEN_URGENCIA, infoCuota, type EstadoCuota } from "@/lib/cuotas";
import { formatFecha } from "@/lib/fechas";
import { avisoWhatsappUrl } from "@/lib/whatsapp";

export default async function CuotasPage({ searchParams }: { searchParams: Promise<{ historial?: string }> }) {
  const { historial } = await searchParams;
  const verHistorial = historial === "1";
  const { supabase } = await requireGestion();

  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("id, periodo, monto, descuento, estado, fecha_vencimiento, fecha_pago, socios(id, nombre, telefono)")
    .order("fecha_vencimiento", { ascending: true });

  const todas = (cuotas ?? []).map((c) => ({ ...c, info: infoCuota(c.estado, c.fecha_vencimiento) }));

  // Por defecto: solo lo que hay que cobrar. Las pagadas son historial y mezclarlas
  // hacia que un mismo cliente aparezca varias veces.
  const visibles = (verHistorial ? todas : todas.filter((c) => c.estado !== "pagado")).sort(
    (a, b) => ORDEN_URGENCIA[a.info.estado] - ORDEN_URGENCIA[b.info.estado] || (a.info.dias ?? 0) - (b.info.dias ?? 0)
  );

  const pendientes = todas.filter((c) => c.estado !== "pagado");
  const cuenta = (...estados: EstadoCuota[]) => pendientes.filter((c) => estados.includes(c.info.estado)).length;

  const resumen = [
    { label: "Vencidas", valor: cuenta("vencida"), clase: "text-destructive" },
    { label: "Vencen hoy o pronto", valor: cuenta("vence_hoy", "vence_pronto"), clase: "text-primary" },
    { label: "Al día", valor: cuenta("al_dia"), clase: "text-emerald-400" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuotas</h1>
          <p className="text-sm text-muted-foreground">
            {verHistorial ? "Todas las cuotas, incluidas las ya pagadas." : "Lo que hay que cobrar, lo más urgente primero."}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={verHistorial ? "/admin/cuotas" : "/admin/cuotas?historial=1"}>
            {verHistorial ? "Ver solo pendientes" : "Ver también las pagadas"}
          </Link>
        </Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {resumen.map((r) => (
          <Card key={r.label}>
            <CardContent className="flex items-baseline justify-between pt-4">
              <span className="text-sm text-muted-foreground">{r.label}</span>
              <span className={`text-3xl font-bold ${r.clase}`}>{r.valor}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibles.map((c) => {
                const cliente = c.socios as unknown as { id: string; nombre: string; telefono: string | null } | null;
                const monto = Number(c.monto) - Number(c.descuento ?? 0);
                const pendiente = c.estado !== "pagado";
                const aviso =
                  pendiente && c.info.estado !== "al_dia" && cliente
                    ? avisoWhatsappUrl({
                        telefono: cliente.telefono,
                        nombre: cliente.nombre,
                        cuotaEstado: c.estado,
                        fechaVencimiento: c.fecha_vencimiento,
                        monto,
                      })
                    : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ClienteAvatar nombre={cliente?.nombre ?? "?"} />
                        <div className="flex flex-col">
                          <span className="font-medium">{cliente?.nombre ?? "—"}</span>
                          <span className="text-xs text-muted-foreground">{cliente?.telefono ?? "sin teléfono"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{c.periodo}</TableCell>
                    <TableCell>${monto.toLocaleString("es-AR")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {pendiente ? formatFecha(c.fecha_vencimiento) : `Pagada el ${formatFecha(c.fecha_pago)}`}
                    </TableCell>
                    <TableCell>
                      {pendiente ? (
                        <CuotaBadge estado={c.estado} fechaVencimiento={c.fecha_vencimiento} conDias />
                      ) : (
                        <span className="text-sm text-muted-foreground">Pagada</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {aviso && (
                          <Button asChild size="sm" variant="outline" className="gap-1.5 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                            <a href={aviso} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="size-3.5" /> Avisar
                            </a>
                          </Button>
                        )}
                        {pendiente && <MarkPaidButton cuotaId={c.id} />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visibles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CreditCard className="size-10 opacity-40" />
                      <p>{verHistorial ? "Sin cuotas registradas." : "No hay cuotas pendientes. ¡Todo cobrado!"}</p>
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

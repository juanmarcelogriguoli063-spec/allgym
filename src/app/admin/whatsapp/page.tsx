import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireDuenoPage } from "@/lib/require-dueno";
import WhatsappStatusCard from "./status-card";
import WhatsappConfigForm from "./config-form";
import WhatsappBroadcastForm from "./broadcast-form";

export default async function WhatsappPage() {
  const { supabase } = await requireDuenoPage();

  const [{ data: sesion }, { data: config }, { data: log }] = await Promise.all([
    supabase.from("whatsapp_sesiones").select("*").eq("gym_id", true).single(),
    supabase.from("whatsapp_config").select("*").eq("gym_id", true).single(),
    supabase.from("whatsapp_mensajes_log").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const conectado = sesion?.estado === "conectado";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp</h1>
        <p className="text-sm text-muted-foreground">
          Recordatorios automáticos de cuota y envío de promociones, con tu propio número.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WhatsappStatusCard
          estado={sesion?.estado ?? "desconectado"}
          numeroConectado={sesion?.numero_conectado ?? null}
          qrActual={sesion?.qr_actual ?? null}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recordatorio de vencimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <WhatsappConfigForm
              plantilla={config?.plantilla_recordatorio ?? ""}
              diasAnticipacion={config?.dias_anticipacion ?? 5}
              activo={config?.activo ?? true}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar promoción</CardTitle>
        </CardHeader>
        <CardContent>
          <WhatsappBroadcastForm conectado={conectado} />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Últimos mensajes</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(log ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="capitalize">{m.tipo}</TableCell>
                    <TableCell className="max-w-md truncate text-muted-foreground">{m.mensaje}</TableCell>
                    <TableCell>
                      <Badge variant={m.estado === "enviado" ? "outline" : "destructive"} className="capitalize">
                        {m.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.created_at).toLocaleString("es-AR")}
                    </TableCell>
                  </TableRow>
                ))}
                {(log ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      Todavía no se envió ningún mensaje.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

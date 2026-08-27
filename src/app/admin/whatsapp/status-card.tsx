"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QrCode, CheckCircle2, Loader2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { pedirConexionWhatsapp, desconectarWhatsapp } from "@/lib/actions/whatsapp";

type Estado = "desconectado" | "esperando_qr" | "conectado";

export default function WhatsappStatusCard({
  estado,
  numeroConectado,
  qrActual,
}: {
  estado: Estado;
  numeroConectado: string | null;
  qrActual: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mientras se espera el escaneo, el bot service (fuera de Vercel) va
  // actualizando la fila en Supabase — refrescamos la página cada 3s para
  // mostrar el QR apenas esté listo, o el "conectado" apenas se escanee.
  useEffect(() => {
    if (estado !== "esperando_qr") return;
    const id = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(id);
  }, [estado, router]);

  async function conectar() {
    setLoading(true);
    try {
      const result = await pedirConexionWhatsapp();
      if ("error" in result) toast.error(result.error);
      else router.refresh();
    } catch {
      toast.error("No se pudo iniciar la conexión");
    } finally {
      setLoading(false);
    }
  }

  async function desconectar() {
    setLoading(true);
    try {
      const result = await desconectarWhatsapp();
      if ("error" in result) toast.error(result.error);
      else {
        toast.success("Desconectado");
        router.refresh();
      }
    } catch {
      toast.error("No se pudo desconectar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={estado === "conectado" ? "border-emerald-500/40" : undefined}>
      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        {estado === "conectado" && (
          <>
            <CheckCircle2 className="size-10 text-emerald-400" />
            <div>
              <p className="font-heading font-semibold uppercase tracking-wide text-emerald-400">Conectado</p>
              <p className="text-sm text-muted-foreground">{numeroConectado ?? "Número no disponible"}</p>
            </div>
            <Button variant="outline" disabled={loading} onClick={desconectar} className="gap-2">
              <Unplug className="size-4" /> Desconectar
            </Button>
          </>
        )}

        {estado === "esperando_qr" && (
          <>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
              Escaneá el código
            </p>
            {qrActual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrActual} alt="Código QR de WhatsApp" className="size-56 rounded-lg border border-border" />
            ) : (
              <div className="flex size-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                Generando código...
              </div>
            )}
            <p className="max-w-xs text-xs text-muted-foreground">
              Abrí WhatsApp en tu celular → Dispositivos vinculados → Vincular dispositivo, y escaneá este código.
            </p>
          </>
        )}

        {estado === "desconectado" && (
          <>
            <QrCode className="size-10 text-muted-foreground" />
            <div>
              <p className="font-heading font-semibold uppercase tracking-wide">Sin conectar</p>
              <p className="text-sm text-muted-foreground">Conectá tu WhatsApp para activar los recordatorios automáticos.</p>
            </div>
            <Button disabled={loading} onClick={conectar} className="gap-2">
              <QrCode className="size-4" /> Conectar WhatsApp
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

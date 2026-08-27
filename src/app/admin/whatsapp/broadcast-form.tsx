"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crearBroadcastWhatsapp } from "@/lib/actions/whatsapp";

export default function WhatsappBroadcastForm({ conectado }: { conectado: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    try {
      const result = await crearBroadcastWhatsapp(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Promoción en cola de envío");
      (document.getElementById("wa-broadcast-form") as HTMLFormElement | null)?.reset();
      router.refresh();
    } catch {
      toast.error("No se pudo enviar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="wa-broadcast-form" action={handleSubmit} className="flex flex-col gap-4">
      {!conectado && (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          Conectá tu WhatsApp arriba para poder enviar promociones.
        </p>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="wa-segmento">Destinatarios</Label>
        <Select name="segmento" defaultValue="activos">
          <SelectTrigger id="wa-segmento" className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activos">Solo socios activos</SelectItem>
            <SelectItem value="todos">Todos los socios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wa-mensaje">Mensaje</Label>
        <Textarea id="wa-mensaje" name="mensaje" rows={3} maxLength={1000} placeholder="Ej: 2x1 en clases de funcional todos los martes de agosto 💪" required />
      </div>

      <Button type="submit" disabled={loading || !conectado} className="gap-2 self-start">
        <Send className="size-4" /> {loading ? "Enviando..." : "Enviar promoción"}
      </Button>
    </form>
  );
}

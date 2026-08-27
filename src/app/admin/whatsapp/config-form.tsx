"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { guardarConfigWhatsapp } from "@/lib/actions/whatsapp";

export default function WhatsappConfigForm({
  plantilla,
  diasAnticipacion,
  activo,
}: {
  plantilla: string;
  diasAnticipacion: number;
  activo: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activoState, setActivoState] = useState(activo);

  async function handleSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    formData.set("activo", activoState ? "on" : "off");
    try {
      const result = await guardarConfigWhatsapp(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Configuración guardada");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
        <Label htmlFor="wa-activo" className="cursor-pointer">
          Recordatorios automáticos activos
        </Label>
        <Switch id="wa-activo" checked={activoState} onCheckedChange={setActivoState} />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wa-dias">Días de anticipación</Label>
        <Input id="wa-dias" name="dias_anticipacion" type="number" min={0} max={30} defaultValue={diasAnticipacion} className="max-w-[120px]" />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="wa-plantilla">Mensaje (usá {"{nombre}"}, {"{monto}"}, {"{fecha}"})</Label>
        <Textarea id="wa-plantilla" name="plantilla_recordatorio" defaultValue={plantilla} rows={3} />
      </div>

      <Button type="submit" disabled={loading} className="self-start">
        {loading ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}

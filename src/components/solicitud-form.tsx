"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearSolicitud } from "@/lib/actions/solicitudes";

export default function SolicitudForm() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (loading) return;
    setLoading(true);
    try {
      const result = await crearSolicitud(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setEnviado(true);
    } catch {
      toast.error("No se pudo enviar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="font-heading text-lg font-bold uppercase tracking-wide text-primary">¡Listo!</p>
        <p className="mt-1 text-sm text-muted-foreground">Te vamos a contactar a la brevedad.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot anti-spam, invisible para personas */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-1.5">
        <Label htmlFor="nombre">Nombre y apellido</Label>
        <Input id="nombre" name="nombre" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input id="telefono" name="telefono" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mensaje">Mensaje (opcional)</Label>
        <Textarea id="mensaje" name="mensaje" rows={3} placeholder="¿Algo que quieras contarnos?" />
      </div>
      <Button type="submit" disabled={loading} size="lg" className="font-heading uppercase tracking-wide">
        {loading ? "Enviando..." : "Quiero ser socio"}
      </Button>
    </form>
  );
}

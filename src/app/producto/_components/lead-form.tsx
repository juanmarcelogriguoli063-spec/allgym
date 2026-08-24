"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearLeadComercial } from "@/lib/actions/leads";

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await crearLeadComercial(formData);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-8 text-center">
        <p className="font-heading text-lg font-bold uppercase tracking-wide text-primary">¡Recibido!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Te contactamos en breve para coordinar una charla de 15 minutos.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:p-8">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="lead-nombre">Nombre</Label>
          <Input id="lead-nombre" name="nombre" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-gimnasio">Nombre del gimnasio</Label>
          <Input id="lead-gimnasio" name="gimnasio" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="lead-telefono">Teléfono</Label>
          <Input id="lead-telefono" name="telefono" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" name="email" type="email" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-socios">¿Cuántos socios tenés aproximadamente?</Label>
        <Input id="lead-socios" name="cantidad_socios" placeholder="Ej: 80" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lead-mensaje">Contanos un poco de tu gimnasio (opcional)</Label>
        <Textarea id="lead-mensaje" name="mensaje" rows={3} />
      </div>
      <Button type="submit" disabled={loading} size="lg" className="font-heading uppercase tracking-wide">
        {loading ? "Enviando..." : "Solicitar una demo"}
      </Button>
    </form>
  );
}

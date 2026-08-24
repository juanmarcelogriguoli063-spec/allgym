"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crearSeguimiento } from "@/lib/actions/socios";

type Seguimiento = { id: string; nota: string; created_at: string; autor: string | null };

export default function SeguimientosSection({ socioId, seguimientos }: { socioId: string; seguimientos: Seguimiento[] }) {
  const router = useRouter();
  const notaId = useId();
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nota.trim() || loading) return;
    setLoading(true);
    try {
      const result = await crearSeguimiento(socioId, nota);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setNota("");
      toast.success("Seguimiento agregado");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar el seguimiento. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Label htmlFor={notaId} className="sr-only">
          Nota de seguimiento
        </Label>
        <Textarea
          id={notaId}
          placeholder="Ej: llamado, dijo que paga el viernes / quiere pausar la membresía..."
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          rows={2}
        />
        <Button type="submit" size="sm" disabled={loading} className="w-fit gap-1.5">
          <MessageSquarePlus className="size-3.5" />
          {loading ? "Guardando..." : "Agregar seguimiento"}
        </Button>
      </form>

      <ul className="flex flex-col gap-3">
        {seguimientos.map((s) => (
          <li key={s.id} className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            <p className="text-foreground">{s.nota}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {s.autor ?? "Staff"} · {new Date(s.created_at).toLocaleString("es-AR")}
            </p>
          </li>
        ))}
        {seguimientos.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Sin seguimientos todavía.</p>
        )}
      </ul>
    </div>
  );
}

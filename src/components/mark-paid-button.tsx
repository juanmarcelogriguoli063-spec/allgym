"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarCuotaPagada } from "@/lib/actions/clientes";

export default function MarkPaidButton({
  cuotaId,
  onDone,
  size = "sm",
}: {
  cuotaId: string;
  /** Se llama despues de marcarla (ej: volver a consultar el DNI en el control de acceso). */
  onDone?: () => void;
  size?: "sm" | "lg";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await marcarCuotaPagada(cuotaId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Pago registrado — se generó la próxima cuota");
      router.refresh();
      onDone?.();
    } catch {
      toast.error("No se pudo completar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size={size} onClick={handleClick} disabled={loading} className="gap-1.5">
      <CheckCircle2 className={size === "lg" ? "size-5" : "size-3.5"} />
      {loading ? "Guardando..." : "Registrar pago"}
    </Button>
  );
}

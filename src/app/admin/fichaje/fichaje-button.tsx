"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarFichaje } from "@/lib/actions/fichajes";

export default function FichajeButton({ proximoTipo }: { proximoTipo: "entrada" | "salida" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await marcarFichaje(proximoTipo);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(proximoTipo === "entrada" ? "Entrada marcada" : "Salida marcada");
      router.refresh();
    } catch {
      toast.error("No se pudo marcar. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const esEntrada = proximoTipo === "entrada";

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={loading}
      className={
        esEntrada
          ? "h-24 w-full gap-3 text-lg font-heading uppercase tracking-wide"
          : "h-24 w-full gap-3 text-lg font-heading uppercase tracking-wide bg-destructive text-white hover:bg-destructive/90"
      }
    >
      {esEntrada ? <LogIn className="size-7" /> : <LogOut className="size-7" />}
      {loading ? "Guardando..." : esEntrada ? "Marcar entrada" : "Marcar salida"}
    </Button>
  );
}

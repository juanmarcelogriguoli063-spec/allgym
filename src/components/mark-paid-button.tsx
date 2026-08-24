"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarCuotaPagada } from "@/lib/actions/socios";

export default function MarkPaidButton({ cuotaId }: { cuotaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await marcarCuotaPagada(cuotaId);
    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Cuota marcada como pagada — se generó la próxima");
    router.refresh();
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={loading} className="gap-1.5">
      <CheckCircle2 className="size-3.5" />
      {loading ? "Guardando..." : "Marcar pagada"}
    </Button>
  );
}

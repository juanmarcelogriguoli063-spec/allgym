"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PhoneCall, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarLeadContactado, descartarLead } from "@/lib/actions/leads";

export default function LeadActions({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function run(action: (id: string) => Promise<{ success: true } | { error: string }>, okMsg: string) {
    if (loading) return;
    setLoading(true);
    try {
      const result = await action(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(okMsg);
      router.refresh();
    } catch {
      toast.error("No se pudo completar la acción. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" disabled={loading} onClick={() => run(descartarLead, "Descartado")}>
        <X className="size-3.5" />
      </Button>
      <Button size="sm" disabled={loading} className="gap-1.5" onClick={() => run(marcarLeadContactado, "Marcado como contactado")}>
        <PhoneCall className="size-3.5" /> Contactado
      </Button>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { getCuotaAlertLevel, type CuotaAlertLevel } from "@/lib/cuotas";

const LABELS: Record<CuotaAlertLevel, string> = {
  pagado: "Al día",
  vencida: "Vencida",
  por_vencer: "Por vencer",
  pendiente: "Pendiente",
};

const STYLES: Record<CuotaAlertLevel, string> = {
  pagado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  vencida: "bg-destructive/15 text-destructive border-destructive/30 animate-pulse",
  por_vencer: "bg-primary/15 text-primary border-primary/30",
  pendiente: "bg-muted text-muted-foreground border-transparent",
};

export default function CuotaBadge({ estado, fechaVencimiento }: { estado: string; fechaVencimiento: string | null }) {
  const nivel = getCuotaAlertLevel(estado, fechaVencimiento);
  return (
    <Badge variant="outline" className={STYLES[nivel]}>
      {LABELS[nivel]}
    </Badge>
  );
}

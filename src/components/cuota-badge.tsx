import { Badge } from "@/components/ui/badge";
import { ESTADO_LABEL, infoCuota, textoDias, type EstadoCuota } from "@/lib/cuotas";

// Colores con UN solo significado en todo el sistema:
// verde = al dia · dorado = atencion (vence hoy / pronto) · rojo = vencida · gris = sin dato.
export const ESTADO_STYLE: Record<EstadoCuota, string> = {
  al_dia: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  vence_hoy: "bg-primary/15 text-primary border-primary/30",
  vence_pronto: "bg-primary/15 text-primary border-primary/30",
  vencida: "bg-destructive/15 text-destructive border-destructive/30",
  sin_cuota: "bg-muted text-muted-foreground border-transparent",
};

export default function CuotaBadge({
  estado,
  fechaVencimiento,
  conDias = false,
}: {
  estado: string | null | undefined;
  fechaVencimiento: string | null | undefined;
  /** Agrega debajo el detalle en dias ("Faltan 12 días"). */
  conDias?: boolean;
}) {
  const info = infoCuota(estado, fechaVencimiento);
  return (
    <div className="flex flex-col items-start gap-0.5">
      <Badge variant="outline" className={ESTADO_STYLE[info.estado]}>
        {ESTADO_LABEL[info.estado]}
      </Badge>
      {conDias && <span className="text-xs text-muted-foreground">{textoDias(info)}</span>}
    </div>
  );
}

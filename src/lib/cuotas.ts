import { diasHasta } from "@/lib/fechas";

// UNA sola definición del estado de una cuota, usada igual en Control de
// acceso, Clientes y Cuotas. Antes cada pantalla lo interpretaba a su manera
// (la misma cuota decía "Pendiente" en una tabla y "Al día" en el ingreso).
export type EstadoCuota = "al_dia" | "vence_hoy" | "vence_pronto" | "vencida" | "sin_cuota";

/** Desde cuántos días antes se considera "vence pronto". */
export const DIAS_AVISO = 3;

export type InfoCuota = { estado: EstadoCuota; dias: number | null };

export function infoCuota(
  cuotaEstado: string | null | undefined,
  fechaVencimiento: string | null | undefined
): InfoCuota {
  if (!cuotaEstado) return { estado: "sin_cuota", dias: null };

  const dias = fechaVencimiento ? diasHasta(fechaVencimiento) : null;

  if (cuotaEstado === "pagado") return { estado: "al_dia", dias };
  if (dias === null) return { estado: "sin_cuota", dias: null };

  if (dias < 0) return { estado: "vencida", dias };
  if (dias === 0) return { estado: "vence_hoy", dias };
  if (dias <= DIAS_AVISO) return { estado: "vence_pronto", dias };
  return { estado: "al_dia", dias };
}

export const ESTADO_LABEL: Record<EstadoCuota, string> = {
  al_dia: "Al día",
  vence_hoy: "Vence hoy",
  vence_pronto: "Vence pronto",
  vencida: "Vencida",
  sin_cuota: "Sin cuota",
};

/** Más urgente primero. */
export const ORDEN_URGENCIA: Record<EstadoCuota, number> = {
  vencida: 0,
  vence_hoy: 1,
  vence_pronto: 2,
  sin_cuota: 3,
  al_dia: 4,
};

/** "Faltan 12 días" / "Vence mañana" / "Vence hoy" / "Vencida hace 3 días" */
export function textoDias(info: InfoCuota): string {
  const { estado, dias } = info;
  if (estado === "sin_cuota" || dias === null) return "Sin fecha de vencimiento";
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Faltan ${dias} días`;
}

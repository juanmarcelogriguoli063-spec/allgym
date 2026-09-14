export type CuotaAlertLevel = "pagado" | "vencida" | "por_vencer" | "pendiente";

export function getCuotaAlertLevel(estado: string, fechaVencimiento: string | null): CuotaAlertLevel {
  if (estado === "pagado") return "pagado";
  if (!fechaVencimiento) return "pendiente";

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  const diasRestantes = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);

  if (diasRestantes < 0) return "vencida";
  if (diasRestantes <= 3) return "por_vencer";
  return "pendiente";
}

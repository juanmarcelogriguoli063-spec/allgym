// Fechas SIEMPRE en hora de Argentina. El servidor (Vercel) y la base de datos
// corren en UTC: de 21:00 a 24:00 hs argentinas "hoy" ya es "mañana" para ellos,
// y una cuota que vence hoy aparecía como vencida. Todo el sistema usa estas
// funciones en vez de `new Date()` suelto.
export const TZ = "America/Argentina/Buenos_Aires";

/** Fecha de hoy en Argentina, formato "YYYY-MM-DD". */
export function hoyAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Días desde hoy (hora argentina) hasta una fecha "YYYY-MM-DD". Negativo si ya pasó. */
export function diasHasta(fecha: string): number {
  const [y1, m1, d1] = hoyAR().split("-").map(Number);
  const [y2, m2, d2] = fecha.slice(0, 10).split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

/** "2026-09-24" -> "24/09/2026" */
export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "—";
  const [y, m, d] = fecha.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Mes actual en Argentina, "YYYY-MM". */
export function periodoActualAR(): string {
  return hoyAR().slice(0, 7);
}

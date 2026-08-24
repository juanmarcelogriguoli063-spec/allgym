import { getCuotaAlertLevel } from "@/lib/cuotas";

/** Arma el link wa.me con un mensaje de recordatorio de pago prellenado. */
export function buildRecordatorioWhatsappUrl(params: {
  telefono: string;
  nombre: string;
  estado: string;
  fechaVencimiento: string | null;
  monto: number;
}): string | null {
  const { telefono, nombre, estado, fechaVencimiento, monto } = params;
  const tel = telefono.replace(/\D/g, "");
  if (!tel) return null;

  const nivel = getCuotaAlertLevel(estado, fechaVencimiento);
  const primerNombre = nombre.trim().split(/\s+/)[0];
  const montoFmt = `$${monto.toLocaleString("es-AR")}`;

  const mensaje =
    nivel === "vencida"
      ? `Hola ${primerNombre}! Te escribimos de Griguoli Gym: tu cuota (${montoFmt}) está vencida desde el ${fechaVencimiento}. ¿Podés pasar a renovarla? 💪`
      : `Hola ${primerNombre}! Te recordamos de Griguoli Gym que tu cuota (${montoFmt}) vence el ${fechaVencimiento}. ¡Te esperamos! 💪`;

  // Numero argentino sin 549 -> anteponerlo (mismo patron usado en JG Barberia)
  const telNorm = tel.startsWith("549") ? tel : tel.startsWith("54") ? `549${tel.slice(2)}` : `549${tel}`;

  return `https://wa.me/${telNorm}?text=${encodeURIComponent(mensaje)}`;
}

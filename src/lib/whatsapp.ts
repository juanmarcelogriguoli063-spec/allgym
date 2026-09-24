import { infoCuota, textoDias } from "@/lib/cuotas";
import { formatFecha } from "@/lib/fechas";
import { telefonoWhatsapp } from "@/lib/datos";

/** Link de WhatsApp (wa.me) con el aviso de cuota ya escrito. Un clic y se envía. */
export function avisoWhatsappUrl(params: {
  telefono: string | null | undefined;
  nombre: string;
  cuotaEstado: string;
  fechaVencimiento: string | null;
  monto: number;
}): string | null {
  const tel = telefonoWhatsapp(params.telefono);
  if (!tel) return null;

  const info = infoCuota(params.cuotaEstado, params.fechaVencimiento);
  const primerNombre = params.nombre.trim().split(/\s+/)[0];
  const monto = `$${params.monto.toLocaleString("es-AR")}`;
  const fecha = formatFecha(params.fechaVencimiento);

  const mensaje =
    info.estado === "vencida"
      ? `Hola ${primerNombre}! Te escribimos de Griguoli Gym: tu cuota (${monto}) venció el ${fecha}. ¿Podés pasar a renovarla? 💪`
      : info.estado === "vence_hoy"
        ? `Hola ${primerNombre}! Te recordamos de Griguoli Gym que tu cuota (${monto}) vence hoy. ¡Te esperamos! 💪`
        : `Hola ${primerNombre}! Te recordamos de Griguoli Gym que tu cuota (${monto}) vence el ${fecha} (${textoDias(info).toLowerCase()}). ¡Te esperamos! 💪`;

  return `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`;
}

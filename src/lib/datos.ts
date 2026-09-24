/** Solo digitos: "30.111.222" -> "30111222". */
export function normalizarDni(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Un DNI argentino tiene 7 u 8 digitos; damos margen (6 a 9) para extranjeros/antiguos. */
export function dniValido(dni: string): boolean {
  return dni.length >= 6 && dni.length <= 9;
}

/** Telefono argentino -> formato internacional para wa.me ("549" + area + numero). */
export function telefonoWhatsapp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let t = raw.replace(/\D/g, "");
  if (!t) return null;
  if (t.startsWith("549")) return t;
  if (t.startsWith("54")) return "549" + t.slice(2);
  if (t.startsWith("0")) t = t.slice(1);
  return "549" + t;
}

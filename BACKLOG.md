# Backlog — mejoras identificadas (investigación de mercado + seguridad)

No implementadas todavía por alcance/tiempo. Ordenadas por lo que más conviene
hacer primero.

## Seguridad

- [ ] **2FA/TOTP para el rol dueño** — Supabase Auth ya lo trae nativo
  (`supabase.auth.mfa.enroll/challenge/verify`), no requiere integrar nada
  externo. Prioridad alta: es la cuenta de mayor privilegio del sistema.
- [ ] **Rate limiting** en login y en los Server Actions sensibles
  (`crearSolicitud`, `buscarSocioPorDni`) — hoy no hay ninguno. Requiere
  Upstash Redis (tier gratis) porque Vercel serverless no persiste estado
  entre invocaciones.
- [ ] **"Leaked password protection"** de Supabase — es un toggle, no código:
  Authentication → Policies → Password Security, en
  https://supabase.com/dashboard/project/kqvreavsyvhgpstcwoxh/auth/providers
- [ ] Logging de auditoría básico: tabla `auditoria` (quién cambió qué, cuándo)
  para cuota marcada pagada, socio dado de baja, cambios de rol.

## Producto (para diferenciarse de Mindbody/Glofox — ver hallazgos de Reddit)

- [ ] **Congelamiento de membresía con fecha de reactivación** — ya existe el
  estado `pausado` en `socios`, falta: que el trigger de renovación no genere
  cuotas nuevas mientras está pausado, y un campo `fecha_reactivacion`.
- [ ] **Referidos con descuento** — columna `referido_por` en `socios` +
  descuento automático en la próxima cuota de ambos.
- [ ] **Firma digital en el alta** — checkbox + nombre tipeado + timestamp + IP
  guardados en una tabla `firmas`. Legalmente válido en la mayoría de
  jurisdicciones, no requiere DocuSign.
- [ ] **Medición de progreso físico** — tabla `mediciones` (peso, medidas,
  fecha, foto opcional en Supabase Storage privado) + gráfico de evolución.
- [ ] Reserva de clases grupales con cupo + lista de espera.
- [ ] Rutinas de entrenamiento asignadas por el profe (tipo TrueCoach).

## Estética

- [ ] Revisar `--radius` en `globals.css` — hoy usa el valor por defecto de
  shadcn; definir uno propio (más recto o más redondeado, pero intencional)
  para que se note menos la base shadcn.
- [ ] Usar el dorado (`--primary`) de forma más contenida: solo en el número
  que importa y el CTA, no como acento decorativo repetido.

## Posicionamiento de venta (para la landing comercial)

Lo que la gente odia de Mindbody/Glofox en Reddit — usar como contraste directo:
precios que suben sin aviso, soporte que desaparece después de firmar,
contratos difíciles de cancelar, cobro por exportar los propios datos.
Nuestra propuesta: precio fijo, soporte directo, sin contrato atado, datos
siempre exportables.

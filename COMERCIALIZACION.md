# Checklist para vender All Gym a otros gimnasios

Hoy el sistema es **mono-tenant**: una sola base de datos, un solo gimnasio
(Griguoli Gym). Esto fue una decisión deliberada para llegar rápido al MVP.
Cuando aparezca el primer gimnasio interesado en comprarlo, falta:

## 1. Multi-tenant

- Agregar tabla `gyms` (reemplaza el singleton `gym_info`) y columna `gym_id`
  a: `profiles`, `socios`, `planes`, `cuotas`, `finanzas_movimientos`,
  `seguimientos`, `solicitudes`.
- Reescribir cada policy RLS para filtrar también por `gym_id = auth_gym_id()`
  (una función `security definer` análoga a `auth_is_staff()`).
- El primer gimnasio (Griguoli Gym) se migra con un `gym_id` fijo — no se
  pierde nada, es un `alter table ... add column ... default '<uuid>'`.

## 2. Branding configurable

- `gyms.nombre`, `gyms.logo_url`, `gyms.color_primario` — hoy "Griguoli Gym"
  y la paleta dorado/negro están hardcodeados en el código
  (`gym-logo.tsx`, `globals.css`). Pasarlo a datos de la tabla `gyms`.
- Subdominio o dominio propio por gimnasio (`griguoli.allgym.app`, o dominio
  custom vía Vercel).

## 3. Onboarding de un gimnasio nuevo

- Flujo de alta: crear `gyms`, crear el usuario `dueno`, planes por defecto.
- Sería el equivalente a lo que yo hice a mano por CLI para Griguoli Gym.

## 4. Planes de precio del SaaS

- Definir cuánto cobrar (por socio, por mes fijo, etc.) — todavía no decidido.
- Facturación: Mercado Pago recurrente o similar (mismo patrón que club-manager
  dejó para el final).

## 5. Bot de WhatsApp por gimnasio

- Si en el futuro se pasa a Baileys automático (Paso 4, hoy semi-automático
  con wa.me), cada gimnasio necesita su propio número + sesión conectada.

## Ya resuelto y reutilizable tal cual

- Auth + roles (`dueno` / `recepcionista` / `socio`) — el patrón ya soporta
  varios roles por gimnasio, solo falta el filtro por `gym_id`.
- Todo el código de UI (dashboard, socios, cuotas, ingreso, solicitudes) no
  necesita cambios de lógica, solo que las queries incluyan `gym_id`.

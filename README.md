# All Gym

Sistema de gestión para gimnasios — dashboard de finanzas, socios, vencimiento de cuotas,
seguimientos y recordatorios automáticos por WhatsApp. Primer cliente en producción:
**Griguoli Gym**.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres + Auth, con Row Level Security)
- Vercel (deploy automático desde `main`)

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completar con las keys reales de Supabase
npm run dev
```

## Base de datos

Las migraciones SQL viven en `supabase/migrations/`. Para aplicarlas contra el proyecto
de Supabase linkeado:

```bash
npx supabase db push
```

## Roles

- `dueno` / `recepcionista`: acceso al panel `/admin` (staff).
- `socio`: acceso a `/socio` (self-service, solo ve sus propios datos).

## Estado del proyecto

Ver el plan de 5 pasos en desarrollo. Progreso actual: Paso 1 (fundación técnica) completo.

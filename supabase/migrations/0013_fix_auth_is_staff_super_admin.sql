-- =========================================================
-- FIX (QA): "auth_is_staff()" (definida en 0001_init.sql como
-- role in ('dueno','recepcionista')) nunca se actualizo cuando se agrego
-- el rol "super_admin" (migraciones 0011/0012). auth_is_dueno() SI se
-- actualizo para incluir super_admin, pero auth_is_staff() no.
--
-- Consecuencia real: el usuario que hoy es super_admin (Marcelo, ver
-- 0012_super_admin_setup.sql) NO puede usar el Control de acceso
-- (/admin/ingreso) ni marcar cuotas pagadas desde ahi, porque las RPCs
-- buscar_socio_por_dni() y marcar_cuota_pagada_staff() (0008) llaman
-- "auth_is_staff()" y esa funcion sigue devolviendo false para
-- super_admin. Tambien afecta profiles_select_staff, gym_info_update_staff
-- y planes_write_staff (0001_init.sql): un super_admin no puede leer los
-- profiles de otros miembros del staff (por eso en /admin/equipo, viendo
-- como super_admin, la columna "Persona" saldria en blanco para fichajes
-- de otras personas), ni tocar planes/gym_info.
--
-- El codigo (src/lib/actions/socios.ts, requireStaff()) ya se corrigio en
-- esta ronda de QA para aceptar "super_admin" del lado de la app, pero sin
-- este fix a nivel de base la RPC lo va a seguir rechazando igual (con el
-- mismo mensaje "No autorizado"), asi que ambos fixes son necesarios.
--
-- Se deja como migracion nueva, SIN aplicar (no se corrio "supabase db
-- push") -- Jorge decide cuando aplicarla.
-- =========================================================

create or replace function auth_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('dueno', 'recepcionista', 'super_admin') from profiles where id = auth.uid()),
    false
  );
$$;

-- =========================================================
-- FIX (QA): la policy "leads_comerciales_dueno_all" (0009_solicitudes_dueno.sql)
-- usa auth_is_dueno(), que desde 0012 tambien es verdadero para "dueno" (no
-- solo super_admin). Pero tanto el guard de pagina (requireSuperAdminPage()
-- en /admin/plataforma) como los Server Actions (requireSuperAdmin() en
-- src/lib/actions/leads.ts) restringen esta seccion a super_admin
-- estrictamente. La policy quedo mas permisiva que el resto del sistema:
-- hoy no importa porque el unico "dueno" tambien es el unico super_admin,
-- pero el dia que haya un segundo gimnasio cliente con su propio "dueno",
-- esa cuenta podria leer/escribir los leads comerciales de la plataforma
-- pegando directo contra la API de Supabase, sin pasar por la UI ni los
-- Server Actions. Se ajusta la policy para que coincida con la intencion
-- real (solo super_admin).
-- =========================================================

drop policy if exists "leads_comerciales_dueno_all" on leads_comerciales;
create policy "leads_comerciales_super_admin_all" on leads_comerciales for all
  using (auth_is_super_admin()) with check (auth_is_super_admin());

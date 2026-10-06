-- Optimizacion de RLS (hallazgo de performance de Supabase): estas 7
-- politicas llaman "auth.uid()" directo, lo que Postgres re-evalua POR
-- FILA. Envueltas en "(select auth.uid())" se resuelve UNA sola vez por
-- consulta (mismo resultado, mejor plan de ejecucion a medida que crecen
-- las tablas). No se aplico solo: el sistema pide confirmacion explicita
-- antes de reescribir politicas de seguridad de "profiles".
--
-- Probado en una conexion de prueba (login real, RLS de dueno/recepcion,
-- busqueda por DNI) sin encontrar ninguna diferencia de comportamiento.

drop policy if exists "profiles_select_self" on profiles;
create policy "profiles_select_self" on profiles for select using (id = (select auth.uid()));

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles for update using (id = (select auth.uid()));

drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles for insert with check (id = (select auth.uid()));

drop policy if exists "socios_select_self" on socios;
create policy "socios_select_self" on socios for select using (profile_id = (select auth.uid()));

drop policy if exists "cuotas_select_self" on cuotas;
create policy "cuotas_select_self" on cuotas for select using (
  exists (select 1 from socios s where s.id = cuotas.socio_id and s.profile_id = (select auth.uid()))
);

drop policy if exists "fichajes_insert_self" on fichajes;
create policy "fichajes_insert_self" on fichajes for insert with check (profile_id = (select auth.uid()));

drop policy if exists "fichajes_select_self" on fichajes;
create policy "fichajes_select_self" on fichajes for select using (profile_id = (select auth.uid()));

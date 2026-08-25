-- =========================================================
-- Separacion real de permisos: dueno vs recepcionista.
--
-- Hasta ahora "auth_is_staff()" trataba a dueno y recepcionista igual
-- (acceso total a socios/cuotas/finanzas/seguimientos). El dueño pidio que
-- el recepcionista NO vea la ficha de los socios ni las finanzas — solo
-- administre el control de acceso y fiche su propio turno. Esto se aplica
-- en RLS (no solo ocultando botones en la UI), para que sea real incluso
-- si alguien pega directo contra la API de Supabase.
-- =========================================================

create or replace function auth_is_dueno()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'dueno' from profiles where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------
-- socios / cuotas / finanzas_movimientos / seguimientos:
-- de "cualquier staff" a "solo dueno".
-- ---------------------------------------------------------
drop policy if exists "socios_staff_all" on socios;
create policy "socios_dueno_all" on socios for all
  using (auth_is_dueno()) with check (auth_is_dueno());

drop policy if exists "cuotas_staff_all" on cuotas;
create policy "cuotas_dueno_all" on cuotas for all
  using (auth_is_dueno()) with check (auth_is_dueno());

drop policy if exists "finanzas_staff_all" on finanzas_movimientos;
create policy "finanzas_dueno_all" on finanzas_movimientos for all
  using (auth_is_dueno()) with check (auth_is_dueno());

drop policy if exists "seguimientos_staff_all" on seguimientos;
create policy "seguimientos_dueno_all" on seguimientos for all
  using (auth_is_dueno()) with check (auth_is_dueno());

-- ---------------------------------------------------------
-- Control de acceso (recepcion): funciones puntuales que
-- cualquier staff puede ejecutar SIN necesitar acceso directo
-- a la tabla socios/cuotas. Devuelven solo lo minimo (nombre y
-- estado de cuota), nunca telefono/email/DNI de otros socios.
-- ---------------------------------------------------------
create or replace function buscar_socio_por_dni(p_dni text)
returns table (
  socio_id uuid,
  nombre text,
  estado_socio text,
  cuota_id uuid,
  cuota_estado text,
  cuota_fecha_vencimiento date
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not auth_is_staff() then
    raise exception 'No autorizado';
  end if;

  return query
    select s.id, s.nombre, s.estado, c.id, c.estado, c.fecha_vencimiento
    from socios s
    left join lateral (
      select * from cuotas where cuotas.socio_id = s.id
      order by fecha_vencimiento desc nulls last limit 1
    ) c on true
    where s.dni = trim(p_dni)
    limit 1;
end;
$$;

create or replace function marcar_cuota_pagada_staff(p_cuota_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not auth_is_staff() then
    raise exception 'No autorizado';
  end if;

  update cuotas set estado = 'pagado', fecha_pago = current_date where id = p_cuota_id;
end;
$$;

-- ---------------------------------------------------------
-- Fichaje de turno del staff (entrada/salida propia).
-- ---------------------------------------------------------
create table fichajes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'salida')),
  fecha_hora timestamptz not null default now()
);

create index fichajes_profile_id_idx on fichajes (profile_id);

alter table fichajes enable row level security;
alter table fichajes force row level security;

create policy "fichajes_insert_self" on fichajes for insert with check (profile_id = auth.uid());
create policy "fichajes_select_self" on fichajes for select using (profile_id = auth.uid());
create policy "fichajes_select_dueno" on fichajes for select using (auth_is_dueno());

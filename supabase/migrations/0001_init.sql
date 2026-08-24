-- =========================================================
-- ALL GYM - esquema inicial (mono-tenant: Griguoli Gym)
-- =========================================================

create extension if not exists "pgcrypto";

create type user_role as enum (
  'dueno',
  'recepcionista',
  'socio'
);

-- ---------------------------------------------------------
-- Datos del gimnasio (fila unica). Pensado para que, el dia
-- que esto se vuelva multi-tenant, esta tabla se reemplace
-- por una fila por gimnasio (tabla "gyms").
-- ---------------------------------------------------------
create table gym_info (
  id boolean primary key default true,
  nombre text not null default 'Griguoli Gym',
  logo_url text,
  direccion text,
  telefono text,
  email text,
  constraint gym_info_singleton check (id)
);

insert into gym_info (id, nombre) values (true, 'Griguoli Gym');

-- ---------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role user_role not null default 'socio',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Planes de membresia (Mensual, Trimestral, etc.)
-- ---------------------------------------------------------
create table planes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric(12, 2) not null,
  duracion_dias integer not null default 30,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Socios
-- ---------------------------------------------------------
create table socios (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete cascade,
  plan_id uuid references planes (id) on delete set null,
  nombre text not null,
  telefono text,
  email text,
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'baja')),
  fecha_alta date not null default current_date,
  fecha_baja date,
  notas text,
  unique (profile_id)
);

create index socios_plan_id_idx on socios (plan_id);

-- ---------------------------------------------------------
-- Cuotas
-- ---------------------------------------------------------
create table cuotas (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references socios (id) on delete cascade,
  plan_id uuid references planes (id) on delete set null,
  periodo text not null,
  monto numeric(12, 2) not null,
  descuento numeric(12, 2) not null default 0,
  recargo_pct numeric(5, 2) not null default 10,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado')),
  fecha_vencimiento date,
  fecha_pago date,
  created_at timestamptz not null default now()
);

create index cuotas_socio_id_idx on cuotas (socio_id);

-- ---------------------------------------------------------
-- Finanzas (ingresos / egresos generales del gimnasio)
-- ---------------------------------------------------------
create table finanzas_movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('ingreso', 'egreso')),
  categoria text,
  monto numeric(12, 2) not null,
  descripcion text,
  origen text not null default 'manual' check (origen in ('manual', 'cuota')),
  cuota_id uuid references cuotas (id) on delete set null,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create index finanzas_movimientos_cuota_id_idx on finanzas_movimientos (cuota_id);

-- ---------------------------------------------------------
-- Seguimientos (CRM simple: notas por socio)
-- ---------------------------------------------------------
create table seguimientos (
  id uuid primary key default gen_random_uuid(),
  socio_id uuid not null references socios (id) on delete cascade,
  autor_id uuid references profiles (id) on delete set null,
  nota text not null,
  created_at timestamptz not null default now()
);

create index seguimientos_socio_id_idx on seguimientos (socio_id);

-- =========================================================
-- Helper: rol del usuario autenticado
-- =========================================================
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('dueno', 'recepcionista') from profiles where id = auth.uid()),
    false
  );
$$;

-- =========================================================
-- RLS
-- =========================================================
alter table gym_info enable row level security;
alter table profiles enable row level security;
alter table planes enable row level security;
alter table socios enable row level security;
alter table cuotas enable row level security;
alter table finanzas_movimientos enable row level security;
alter table seguimientos enable row level security;

-- Datos del gimnasio: lectura publica, edicion solo staff
create policy "gym_info_select_public" on gym_info for select using (true);
create policy "gym_info_update_staff" on gym_info for update using (auth_is_staff());

-- Profiles: el propio usuario se ve y se edita; el staff ve a todos
create policy "profiles_select_self" on profiles for select using (id = auth.uid());
create policy "profiles_select_staff" on profiles for select using (auth_is_staff());
create policy "profiles_update_self" on profiles for update using (id = auth.uid());
create policy "profiles_insert_self" on profiles for insert with check (id = auth.uid());

-- Planes: lectura publica, escritura staff
create policy "planes_select_public" on planes for select using (true);
create policy "planes_write_staff" on planes for all
  using (auth_is_staff()) with check (auth_is_staff());

-- Socios: staff gestiona todo; el propio socio ve su propia fila
create policy "socios_staff_all" on socios for all
  using (auth_is_staff()) with check (auth_is_staff());
create policy "socios_select_self" on socios for select using (profile_id = auth.uid());

-- Cuotas: staff gestiona todo; el propio socio ve solo las suyas
create policy "cuotas_staff_all" on cuotas for all
  using (auth_is_staff()) with check (auth_is_staff());
create policy "cuotas_select_self" on cuotas for select using (
  exists (select 1 from socios s where s.id = cuotas.socio_id and s.profile_id = auth.uid())
);

-- Finanzas: solo staff
create policy "finanzas_staff_all" on finanzas_movimientos for all
  using (auth_is_staff()) with check (auth_is_staff());

-- Seguimientos: solo staff (notas internas, el socio no las ve)
create policy "seguimientos_staff_all" on seguimientos for all
  using (auth_is_staff()) with check (auth_is_staff());

-- =========================================================
-- Trigger: crear profile automaticamente al registrarse
-- =========================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- Trigger: renovacion automatica de cuotas. Al marcar una
-- cuota como pagada, se genera la siguiente usando la
-- duracion del plan (o 30 dias si no tiene plan asignado).
-- =========================================================
create or replace function generar_proxima_cuota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dias integer;
begin
  if new.estado = 'pagado' and (old.estado is distinct from 'pagado') then
    select coalesce(p.duracion_dias, 30) into dias from planes p where p.id = new.plan_id;
    dias := coalesce(dias, 30);

    insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento)
    values (
      new.socio_id,
      new.plan_id,
      to_char((coalesce(new.fecha_pago, current_date) + (dias || ' days')::interval), 'YYYY-MM'),
      new.monto,
      'pendiente',
      coalesce(new.fecha_pago, current_date) + (dias || ' days')::interval
    );

    insert into finanzas_movimientos (tipo, categoria, monto, descripcion, origen, cuota_id, fecha)
    values ('ingreso', 'cuota', new.monto - coalesce(new.descuento, 0), 'Pago de cuota - ' || new.periodo, 'cuota', new.id, coalesce(new.fecha_pago, current_date));
  end if;
  return new;
end;
$$;

create trigger on_cuota_pagada
  after update on cuotas
  for each row execute function generar_proxima_cuota();

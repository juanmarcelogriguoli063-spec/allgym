-- =========================================================
-- Bot de WhatsApp real (Baileys), conectado por QR desde el
-- dashboard de cada gimnasio. Todas las tablas llevan gym_id
-- desde ya (referenciando el singleton gym_info por ahora) para
-- no tener que migrar de nuevo cuando haya multi-tenant real.
-- =========================================================

create table whatsapp_sesiones (
  gym_id boolean primary key references gym_info (id) on delete cascade,
  estado text not null default 'desconectado' check (estado in ('desconectado', 'esperando_qr', 'conectado')),
  numero_conectado text,
  qr_actual text,
  auth_state jsonb,
  updated_at timestamptz not null default now()
);

insert into whatsapp_sesiones (gym_id) values (true);

create table whatsapp_config (
  gym_id boolean primary key references gym_info (id) on delete cascade,
  plantilla_recordatorio text not null default 'Hola {nombre}! Te recordamos que tu cuota de ${monto} vence el {fecha}. ¡Te esperamos! 💪',
  dias_anticipacion integer not null default 5,
  activo boolean not null default true
);

insert into whatsapp_config (gym_id) values (true);

create table whatsapp_mensajes_log (
  id uuid primary key default gen_random_uuid(),
  gym_id boolean not null references gym_info (id) on delete cascade,
  socio_id uuid references socios (id) on delete set null,
  tipo text not null check (tipo in ('recordatorio', 'promocion')),
  mensaje text not null,
  estado text not null default 'enviado' check (estado in ('enviado', 'error')),
  detalle_error text,
  created_at timestamptz not null default now()
);

create index whatsapp_mensajes_log_gym_id_idx on whatsapp_mensajes_log (gym_id, created_at desc);

create table whatsapp_broadcasts (
  id uuid primary key default gen_random_uuid(),
  gym_id boolean not null references gym_info (id) on delete cascade,
  mensaje text not null,
  segmento text not null default 'activos' check (segmento in ('todos', 'activos')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'procesando', 'completado', 'error')),
  creado_por uuid references profiles (id) on delete set null,
  enviados_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table whatsapp_sesiones enable row level security;
alter table whatsapp_sesiones force row level security;
alter table whatsapp_config enable row level security;
alter table whatsapp_config force row level security;
alter table whatsapp_mensajes_log enable row level security;
alter table whatsapp_mensajes_log force row level security;
alter table whatsapp_broadcasts enable row level security;
alter table whatsapp_broadcasts force row level security;

-- Dueño/super_admin: control total. El bot service usa la service_role key
-- (bypassa RLS), no necesita policies propias.
create policy "whatsapp_sesiones_dueno_all" on whatsapp_sesiones for all
  using (auth_is_dueno()) with check (auth_is_dueno());
create policy "whatsapp_config_dueno_all" on whatsapp_config for all
  using (auth_is_dueno()) with check (auth_is_dueno());
create policy "whatsapp_mensajes_log_dueno_select" on whatsapp_mensajes_log for select
  using (auth_is_dueno());
create policy "whatsapp_broadcasts_dueno_all" on whatsapp_broadcasts for all
  using (auth_is_dueno()) with check (auth_is_dueno());

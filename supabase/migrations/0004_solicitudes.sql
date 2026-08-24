-- Solicitudes de alta desde la landing publica ("Quiero ser socio").
-- Cualquiera (sin login) puede insertar; solo el staff puede verlas/gestionarlas.
create table solicitudes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  mensaje text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'convertida', 'descartada')),
  created_at timestamptz not null default now()
);

alter table solicitudes enable row level security;

create policy "solicitudes_insert_public" on solicitudes for insert with check (true);
create policy "solicitudes_staff_all" on solicitudes for all
  using (auth_is_staff()) with check (auth_is_staff());

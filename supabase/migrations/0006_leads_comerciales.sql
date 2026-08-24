-- Leads de la landing COMERCIAL (/producto) — duenos de otros gimnasios
-- interesados en contratar All Gym. Distinto de "solicitudes" (que son
-- personas queriendo ser socias de Griguoli Gym).
create table leads_comerciales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  gimnasio text,
  telefono text,
  email text,
  cantidad_socios text,
  mensaje text,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'contactado', 'descartado')),
  created_at timestamptz not null default now()
);

alter table leads_comerciales enable row level security;
alter table leads_comerciales force row level security;

create policy "leads_comerciales_insert_public" on leads_comerciales for insert with check (true);
create policy "leads_comerciales_staff_all" on leads_comerciales for all
  using (auth_is_staff()) with check (auth_is_staff());

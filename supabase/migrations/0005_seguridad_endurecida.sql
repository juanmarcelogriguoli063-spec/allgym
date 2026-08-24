-- Endurecimiento de seguridad (a raiz de investigacion de mejores practicas
-- Supabase RLS 2026): FORCE hace que las politicas se apliquen incluso a
-- roles con privilegios elevados que corran queries directas (por ejemplo,
-- el propio owner de la migracion), no solo a `anon`/`authenticated`.
alter table gym_info force row level security;
alter table profiles force row level security;
alter table planes force row level security;
alter table socios force row level security;
alter table cuotas force row level security;
alter table finanzas_movimientos force row level security;
alter table seguimientos force row level security;
alter table solicitudes force row level security;

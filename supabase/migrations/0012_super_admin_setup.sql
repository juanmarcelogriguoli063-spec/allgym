-- auth_is_dueno() ahora tambien es verdadero para super_admin: la misma
-- persona que dirige la empresa All Gym tambien opera el panel de su propio
-- gimnasio (Griguoli Gym), asi que hereda el mismo acceso que "dueno".
create or replace function auth_is_dueno()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('dueno', 'super_admin') from profiles where id = auth.uid()), false);
$$;

create or replace function auth_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'super_admin' from profiles where id = auth.uid()), false);
$$;

-- Promovemos al dueño actual (Marcelo, unico usuario del sistema hasta
-- ahora) a super_admin: el mismo login que ya usa para Griguoli Gym pasa a
-- ver tambien el panel general de la plataforma All Gym.
-- (El trigger anti-escalacion de 0007 exige que quien cambia el rol ya sea
-- staff via auth.uid() -- no aplica a una migracion corrida por el owner
-- de la base, asi que lo desactivamos solo para este UPDATE puntual.)
alter table profiles disable trigger profiles_prevent_role_escalation;
update profiles set role = 'super_admin'
where email = 'juanmarcelogriguoli063@gmail.com';
alter table profiles enable trigger profiles_prevent_role_escalation;

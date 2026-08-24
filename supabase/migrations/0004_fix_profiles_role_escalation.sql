-- =========================================================
-- FIX (QA): la policy "profiles_update_self" (0001_init.sql) no tiene
-- WITH CHECK, asi que Postgres reusa el USING ("id = auth.uid()") como
-- check tambien. Ese check solo valida el id de la fila, NO el valor de
-- "role" -> cualquier usuario autenticado (incluido un "socio") puede
-- hacer, con su propia sesion:
--
--   update profiles set role = 'dueno' where id = auth.uid();
--
-- y auto-promoverse a dueno/recepcionista, entrando despues a /admin
-- (el layout de /admin solo confia en profiles.role). Privilege
-- escalation real via API/PostgREST, no requiere tocar la UI.
--
-- Fix: un trigger BEFORE UPDATE que bloquea cambios de "role" salvo que
-- quien ejecuta el update ya sea staff (dueno/recepcionista). Se deja
-- como migracion nueva, sin aplicar (no se corrio "supabase db push").
-- =========================================================

create or replace function prevent_profiles_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not auth_is_staff() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on profiles;

create trigger profiles_prevent_role_escalation
  before update on profiles
  for each row execute function prevent_profiles_role_self_escalation();

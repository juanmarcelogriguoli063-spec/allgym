-- =========================================================
-- Endurecer permisos de funciones SECURITY DEFINER (hallazgo del
-- linter de seguridad de Supabase, 2026-10-06): funciones internas
-- quedaban ejecutables directamente via /rest/v1/rpc/... por
-- cualquiera, incluso sin iniciar sesion.
--
-- auth_is_dueno/auth_is_staff/auth_is_super_admin/auth_role: se usan
-- DENTRO de las politicas RLS para usuarios autenticados -> hay que
-- conservar EXECUTE para "authenticated" (si se lo saco, el staff
-- queda sin poder ver nada). Solo se le saca a "anon", que no lo
-- necesita para ninguna politica real.
--
-- Las trigger functions (generar_proxima_cuota, handle_new_user,
-- prevent_profiles_role_self_escalation) nunca deben invocarse
-- directo via API: se sacan de los dos roles.
--
-- marcar_cuota_pagada_staff ya valida auth_is_staff() adentro, pero
-- igual se le saca el permiso a "anon" (nunca deberia ni intentarlo).
-- =========================================================

revoke execute on function public.auth_is_dueno() from anon;
revoke execute on function public.auth_is_staff() from anon;
revoke execute on function public.auth_is_super_admin() from anon;
revoke execute on function public.auth_role() from anon;
revoke execute on function public.marcar_cuota_pagada_staff(uuid) from anon;

revoke execute on function public.generar_proxima_cuota() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.prevent_profiles_role_self_escalation() from anon, authenticated;

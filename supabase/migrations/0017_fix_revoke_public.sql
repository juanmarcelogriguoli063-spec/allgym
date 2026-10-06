-- Correccion del fix anterior: `revoke ... from anon` no alcanza porque
-- Postgres le da EXECUTE a PUBLIC (todos los roles) por defecto al crear
-- una funcion, y ese grant general sigue vigente aunque se revoque uno
-- especifico. Hay que revocar de PUBLIC y re-otorgar explicitamente solo
-- a quien de verdad lo necesita.

revoke execute on function public.auth_is_dueno() from public;
revoke execute on function public.auth_is_staff() from public;
revoke execute on function public.auth_is_super_admin() from public;
revoke execute on function public.auth_role() from public;
revoke execute on function public.marcar_cuota_pagada_staff(uuid) from public;
revoke execute on function public.generar_proxima_cuota() from public;
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.prevent_profiles_role_self_escalation() from public;

grant execute on function public.auth_is_dueno() to authenticated;
grant execute on function public.auth_is_staff() to authenticated;
grant execute on function public.auth_is_super_admin() to authenticated;
grant execute on function public.auth_role() to authenticated;
grant execute on function public.marcar_cuota_pagada_staff(uuid) to authenticated;

notify pgrst, 'reload schema';

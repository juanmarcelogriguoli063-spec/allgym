-- =========================================================
-- Foto del cliente (se saca al registrarlo, se muestra en Ingreso) +
-- fechas en hora de Argentina + DNI normalizado (solo digitos).
-- Idempotente: se puede correr mas de una vez sin efectos raros.
-- =========================================================

-- --- Foto -------------------------------------------------
alter table socios add column if not exists foto_path text;

-- Bucket PRIVADO (son fotos de personas): se muestran con URLs firmadas que
-- expiran, nunca con un link publico.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-socios', 'fotos-socios', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = 1048576,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "fotos_socios_select_staff" on storage.objects;
create policy "fotos_socios_select_staff" on storage.objects for select to authenticated
  using (bucket_id = 'fotos-socios' and public.auth_is_staff());

drop policy if exists "fotos_socios_insert_dueno" on storage.objects;
create policy "fotos_socios_insert_dueno" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos-socios' and public.auth_is_dueno());

drop policy if exists "fotos_socios_update_dueno" on storage.objects;
create policy "fotos_socios_update_dueno" on storage.objects for update to authenticated
  using (bucket_id = 'fotos-socios' and public.auth_is_dueno())
  with check (bucket_id = 'fotos-socios' and public.auth_is_dueno());

drop policy if exists "fotos_socios_delete_dueno" on storage.objects;
create policy "fotos_socios_delete_dueno" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos-socios' and public.auth_is_dueno());

-- --- DNI: guardar solo digitos ("30.111.222" == "30111222") ----------
update socios
set dni = nullif(regexp_replace(dni, '\D', '', 'g'), '')
where dni is not null and dni ~ '\D';

-- --- Fechas en hora de Argentina (el servidor esta en UTC: de 21 a 24 hs
--     "hoy" ya era "manana" y las cuotas que vencen hoy se veian vencidas) --
alter table socios alter column fecha_alta
  set default ((now() at time zone 'America/Argentina/Buenos_Aires')::date);

create or replace function public.marcar_cuota_pagada_staff(p_cuota_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  filas integer;
begin
  if not auth_is_staff() then
    raise exception 'No autorizado';
  end if;

  update cuotas
  set estado = 'pagado',
      fecha_pago = (now() at time zone 'America/Argentina/Buenos_Aires')::date
  where id = p_cuota_id and estado <> 'pagado';

  get diagnostics filas = row_count;
  if filas = 0 then
    raise exception 'La cuota no existe o ya estaba pagada';
  end if;
end;
$$;

-- --- Ingreso por DNI: ahora devuelve tambien la foto ----------------
drop function if exists public.buscar_socio_por_dni(text);

create function public.buscar_socio_por_dni(p_dni text)
returns table (
  socio_id uuid,
  nombre text,
  estado_socio text,
  foto_path text,
  cuota_id uuid,
  cuota_estado text,
  cuota_fecha_vencimiento date,
  cuota_monto numeric
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
    select s.id, s.nombre, s.estado, s.foto_path, c.id, c.estado, c.fecha_vencimiento,
           (c.monto - coalesce(c.descuento, 0))
    from socios s
    left join lateral (
      select * from cuotas where cuotas.socio_id = s.id
      order by fecha_vencimiento desc nulls last limit 1
    ) c on true
    where regexp_replace(coalesce(s.dni, ''), '\D', '', 'g') = regexp_replace(coalesce(p_dni, ''), '\D', '', 'g')
      and regexp_replace(coalesce(p_dni, ''), '\D', '', 'g') <> ''
    limit 1;
end;
$$;

revoke execute on function public.buscar_socio_por_dni(text) from public, anon;
grant execute on function public.buscar_socio_por_dni(text) to authenticated;

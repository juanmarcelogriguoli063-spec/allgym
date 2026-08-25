-- Solicitudes y leads comerciales tambien son gestion (no operacion diaria
-- del recepcionista) — mismo criterio que 0008.
drop policy if exists "solicitudes_staff_all" on solicitudes;
create policy "solicitudes_dueno_all" on solicitudes for all
  using (auth_is_dueno()) with check (auth_is_dueno());

drop policy if exists "leads_comerciales_staff_all" on leads_comerciales;
create policy "leads_comerciales_dueno_all" on leads_comerciales for all
  using (auth_is_dueno()) with check (auth_is_dueno());

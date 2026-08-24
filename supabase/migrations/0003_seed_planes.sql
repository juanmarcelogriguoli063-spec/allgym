-- Planes iniciales de ejemplo. Los precios son un placeholder — se editan
-- despues desde el panel (Paso 2: gestion de planes) o directo en Supabase.
insert into planes (nombre, precio, duracion_dias) values
  ('Mensual', 15000, 30),
  ('Trimestral', 40000, 90)
on conflict do nothing;

-- DNI del socio, para el control de ingreso rapido en recepcion.
alter table socios add column if not exists dni text;
create unique index if not exists socios_dni_unique_idx on socios (dni) where dni is not null;
create index if not exists socios_dni_idx on socios (dni);

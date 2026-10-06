-- Indices en foreign keys que no tenian cobertura (hallazgo del linter de
-- performance de Supabase, 2026-10-06). Operacion puramente aditiva, ya
-- aplicada.
create index if not exists cuotas_plan_id_idx on cuotas (plan_id);
create index if not exists seguimientos_autor_id_idx on seguimientos (autor_id);
create index if not exists whatsapp_broadcasts_creado_por_idx on whatsapp_broadcasts (creado_por);
create index if not exists whatsapp_broadcasts_gym_id_idx on whatsapp_broadcasts (gym_id);
create index if not exists whatsapp_mensajes_log_socio_id_idx on whatsapp_mensajes_log (socio_id);

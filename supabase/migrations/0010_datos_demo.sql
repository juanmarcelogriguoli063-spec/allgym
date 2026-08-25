-- =========================================================
-- Datos de DEMO (5 de cada cosa) para ver el panel poblado.
-- Todos identificables por el prefijo "[DEMO]" en el nombre o la
-- categoria/descripcion, para poder borrarlos facil despues:
--
--   delete from socios where nombre like '[DEMO]%';
--   delete from finanzas_movimientos where categoria = 'demo';
--   delete from solicitudes where mensaje like '[DEMO]%';
--
-- (cuotas y seguimientos de los socios demo se borran solos por el
-- "on delete cascade" al borrar el socio)
-- =========================================================

do $$
declare
  v_plan_mensual uuid;
  v_plan_trimestral uuid;
  v_socio1 uuid;
  v_socio2 uuid;
  v_socio3 uuid;
  v_socio4 uuid;
  v_socio5 uuid;
begin
  select id into v_plan_mensual from planes where nombre = 'Mensual' limit 1;
  select id into v_plan_trimestral from planes where nombre = 'Trimestral' limit 1;

  -- Socio 1: al dia, cuota pagada hace poco, proxima vence en 25 dias
  insert into socios (nombre, dni, telefono, email, plan_id, estado)
  values ('[DEMO] Lucas Fernández', '30111222', '3854123456', 'lucas.fernandez@example.com', v_plan_mensual, 'activo')
  returning id into v_socio1;
  insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento, fecha_pago)
  values (v_socio1, v_plan_mensual, to_char(current_date, 'YYYY-MM'), 15000, 'pagado', current_date + 25, current_date - 5);

  -- Socio 2: por vencer en 2 dias
  insert into socios (nombre, dni, telefono, email, plan_id, estado)
  values ('[DEMO] Martina Gómez', '31222333', '3854234567', 'martina.gomez@example.com', v_plan_mensual, 'activo')
  returning id into v_socio2;
  insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento)
  values (v_socio2, v_plan_mensual, to_char(current_date, 'YYYY-MM'), 15000, 'pendiente', current_date + 2);

  -- Socio 3: vencida hace 3 dias (recien vencida, no todavia "en riesgo")
  insert into socios (nombre, dni, telefono, email, plan_id, estado)
  values ('[DEMO] Nicolás Rodríguez', '32333444', '3854345678', 'nicolas.rodriguez@example.com', v_plan_trimestral, 'activo')
  returning id into v_socio3;
  insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento)
  values (v_socio3, v_plan_trimestral, to_char(current_date, 'YYYY-MM'), 40000, 'pendiente', current_date - 3);

  -- Socio 4: vencida hace 12 dias -> aparece en "socios en riesgo de baja"
  insert into socios (nombre, dni, telefono, email, plan_id, estado)
  values ('[DEMO] Camila Sosa', '33444555', '3854456789', 'camila.sosa@example.com', v_plan_mensual, 'activo')
  returning id into v_socio4;
  insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento)
  values (v_socio4, v_plan_mensual, to_char(current_date, 'YYYY-MM'), 15000, 'pendiente', current_date - 12);
  insert into seguimientos (socio_id, nota) values
    (v_socio4, '[DEMO] La llamamos, dijo que pasa a pagar esta semana.');

  -- Socio 5: pagada hoy mismo
  insert into socios (nombre, dni, telefono, email, plan_id, estado)
  values ('[DEMO] Franco Díaz', '34555666', '3854567890', 'franco.diaz@example.com', v_plan_mensual, 'activo')
  returning id into v_socio5;
  insert into cuotas (socio_id, plan_id, periodo, monto, estado, fecha_vencimiento, fecha_pago)
  values (v_socio5, v_plan_mensual, to_char(current_date, 'YYYY-MM'), 15000, 'pagado', current_date + 30, current_date);

  -- 5 movimientos financieros manuales, en distintos meses (para el grafico)
  insert into finanzas_movimientos (tipo, categoria, descripcion, monto, fecha, origen) values
    ('egreso', 'demo', '[DEMO] Alquiler del local', 80000, (current_date - interval '2 months')::date, 'manual'),
    ('egreso', 'demo', '[DEMO] Mantenimiento de máquinas', 25000, (current_date - interval '1 month')::date, 'manual'),
    ('ingreso', 'demo', '[DEMO] Venta de suplementos', 12000, (current_date - interval '1 month')::date, 'manual'),
    ('egreso', 'demo', '[DEMO] Sueldo recepción', 90000, current_date, 'manual'),
    ('ingreso', 'demo', '[DEMO] Venta de indumentaria', 8000, current_date, 'manual');

  -- 5 solicitudes de ejemplo (leads de la landing publica)
  insert into solicitudes (nombre, telefono, email, mensaje, estado) values
    ('[DEMO] Sofía Herrera', '3854678901', 'sofia.herrera@example.com', '[DEMO] Quiero anotarme, ¿tienen clases de funcional?', 'pendiente'),
    ('[DEMO] Matías Acosta', '3854789012', null, '[DEMO] Vi el gimnasio y me interesa el plan trimestral.', 'pendiente'),
    ('[DEMO] Valentina Ruiz', null, 'valentina.ruiz@example.com', '[DEMO] ¿Hacen descuento para estudiantes?', 'pendiente'),
    ('[DEMO] Ezequiel Paz', '3854890123', 'ezequiel.paz@example.com', null, 'convertida'),
    ('[DEMO] Agustina Luna', '3854901234', null, '[DEMO] Consulto horarios de atención.', 'descartada');
end $$;

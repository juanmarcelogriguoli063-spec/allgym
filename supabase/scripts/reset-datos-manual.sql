delete from whatsapp_mensajes_log;
delete from whatsapp_broadcasts;
delete from seguimientos;
delete from cuotas;
delete from solicitudes;
delete from leads_comerciales;
delete from fichajes;
delete from socios;
delete from finanzas_movimientos;

update whatsapp_sesiones set estado = 'desconectado', numero_conectado = null, qr_actual = null, auth_state = null;
update whatsapp_config set plantilla_recordatorio = default, dias_anticipacion = default, activo = true;
update gym_info set nombre = 'Griguoli Gym', logo_url = null, direccion = null, telefono = null, email = null;

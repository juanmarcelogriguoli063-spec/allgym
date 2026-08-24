// Contenido de la landing comercial. Textos, precios y pasos viven acá para
// poder editarlos sin tocar los componentes.

export const BENEFICIOS = [
  {
    titulo: "Sabé cuánto factura tu gimnasio sin abrir una planilla",
    descripcion:
      "Dashboard financiero en tiempo real: ingresos, egresos y balance del mes de un vistazo, sin armar un Excel a mano cada semana.",
  },
  {
    titulo: "Dejá de perseguir socios para que paguen",
    descripcion:
      "El sistema arma el recordatorio de WhatsApp personalizado antes de que venza la cuota. Un clic y listo — no más planillas de \"quién debe\".",
  },
  {
    titulo: "Sabé quién puede entrar, sin depender de la memoria de nadie",
    descripcion:
      "Control de acceso por DNI: tipeás o escaneás, y el sistema te dice al instante si esa persona está al día o no.",
  },
  {
    titulo: "Todo tu gimnasio en un solo lugar",
    descripcion:
      "Socios, cuotas, finanzas y seguimientos — no más datos repartidos entre un cuaderno, un grupo de WhatsApp y la memoria del recepcionista.",
  },
  {
    titulo: "Tu gimnasio se ve profesional desde el primer clic",
    descripcion:
      "Página web propia con tu marca, tus planes y un formulario de contacto que te manda los interesados directo al panel.",
  },
  {
    titulo: "Detectá quién está por darse de baja antes de que pase",
    descripcion:
      "Alerta automática de socios con cuota vencida hace varios días — la señal más temprana de que alguien dejó de venir.",
  },
];

export const PASOS = [
  { titulo: "Nos contactás", descripcion: "Nos contás cómo es tu gimnasio: cantidad de socios, planes, cómo cobrás hoy." },
  { titulo: "Analizamos tu necesidad", descripcion: "Vemos qué de todo lo que ya tenemos te sirve tal cual, y qué hay que ajustar." },
  { titulo: "Configuramos tu sistema", descripcion: "Tu marca, tus planes, tus precios — no una plantilla genérica con tu logo pegado." },
  { titulo: "Capacitamos a tu equipo", descripcion: "Un día alcanza. La interfaz está pensada para que la use cualquiera, no hace falta curso." },
  { titulo: "Empezás a usarlo", descripcion: "Y desde el primer mes ves los números reales de tu gimnasio, sin planillas." },
];

export const DIFERENCIALES = [
  {
    titulo: "Precio fijo, sin sorpresas",
    descripcion: "Nada de \"actualizaciones\" anuales que suben la factura sin avisar. Sabés lo que pagás desde el día uno.",
  },
  {
    titulo: "Soporte directo, no un bot",
    descripcion: "Hablás con la persona que construyó tu sistema, no con un chatbot que te redirige a un artículo genérico.",
  },
  {
    titulo: "Sin contrato atado",
    descripcion: "Te vas cuando quieras. No creemos en retener clientes con letra chica.",
  },
  {
    titulo: "Tus datos son tuyos",
    descripcion: "Exportables cuando quieras, sin costo. No vas a pagar un fee para llevarte la información de tus propios socios.",
  },
];

export const PLANES = [
  {
    nombre: "Básico",
    para: "Gimnasios chicos, hasta 150 socios",
    features: ["Gestión de socios y cuotas", "Dashboard financiero", "Control de acceso por DNI", "Recordatorios de WhatsApp"],
    destacado: false,
  },
  {
    nombre: "Profesional",
    para: "Gimnasios en crecimiento",
    features: ["Todo lo del plan Básico", "Página web propia con tu marca", "Seguimientos y CRM de socios", "Soporte prioritario"],
    destacado: true,
  },
  {
    nombre: "Empresa",
    para: "Cadenas y multi-sede",
    features: ["Todo lo del plan Profesional", "Múltiples sedes", "Reportes avanzados", "Onboarding asistido"],
    destacado: false,
  },
];

export const FAQ = [
  {
    pregunta: "¿Para quién está pensado All Gym?",
    respuesta:
      "Para dueños de gimnasios chicos y medianos que hoy gestionan todo a mano (Excel, cuadernos, WhatsApp) o pagan de más por un software genérico que no entiende su negocio.",
  },
  {
    pregunta: "¿Cuánto demora la implementación?",
    respuesta:
      "Depende de la cantidad de socios a cargar, pero el sistema queda funcionando y tu equipo capacitado en cuestión de días, no de meses.",
  },
  {
    pregunta: "¿Necesito conocimientos técnicos?",
    respuesta: "No. Si sabés usar WhatsApp, sabés usar el panel. Está pensado para que lo use el recepcionista del día a día.",
  },
  {
    pregunta: "¿Qué incluye el servicio?",
    respuesta:
      "Gestión de socios, cuotas y finanzas, control de acceso, recordatorios de WhatsApp, y tu propia página web — según el plan que elijas.",
  },
  {
    pregunta: "¿Puedo cancelar cuando quiera?",
    respuesta: "Sí. No hay contrato atado ni penalidad por irte. Tus datos siguen siendo tuyos y son exportables en cualquier momento.",
  },
  {
    pregunta: "¿Qué soporte recibo?",
    respuesta: "Soporte directo con quien desarrolla el sistema — no una mesa de ayuda tercerizada ni un bot.",
  },
  {
    pregunta: "¿Cómo empiezo?",
    respuesta: "Dejanos tus datos más abajo y coordinamos una charla de 15 minutos para entender tu gimnasio.",
  },
];

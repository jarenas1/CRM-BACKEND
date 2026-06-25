require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },

  db: {
    url: process.env.DATABASE_URL || '',
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'VGrand2026*',
    name: process.env.ADMIN_NAME || 'Administrador V Grand',
    email: process.env.ADMIN_EMAIL || 'admin@v-grandhotels.com',
    cargo: process.env.ADMIN_CARGO || 'Director de Trade Marketing',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // STARTTLS en 587
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
    fromName: process.env.SMTP_FROM_NAME || 'V Grand Hotel Medellín',
    replyTo: process.env.SMTP_REPLY_TO || 'no-reply@v-grandhotels.com',
    ccFijo: process.env.EMAIL_CC_FIJO || 'juanjoarenas1218@gmail.com',
  },

  hotel: {
    nombre: 'V Grand Hotel Medellín',
    nombreLargo: 'V Grand Hotel by Radisson Individuals Medellín',
    miembro: 'Member of Radisson Individuals',
    razonSocial: process.env.HOTEL_RAZON_SOCIAL || 'Hacer y Servis SAS',
    nit: process.env.HOTEL_NIT || '901166587',
    direccion: process.env.HOTEL_DIRECCION || 'Cra. 43A # 14-81, El Poblado, Medellín, Antioquia, Colombia',
    web: process.env.HOTEL_WEB || 'https://www.v-grandhotels.com/es',
    slogan: 'FEEL WELL COME IN',
    emailVentas: process.env.HOTEL_EMAIL_VENTAS || 'trademarketing@v-grandhotels.com',
    emailReservas: process.env.HOTEL_EMAIL_RESERVAS || 'reservas@v-grandhotels.com',
    whatsapp: process.env.HOTEL_WHATSAPP || '+57 311 876 83 25',
    horario: 'Lunes a Viernes, 8:00 a.m. – 6:00 p.m.',
    checkIn: '3:00 p.m.',
    checkOut: '1:00 p.m.',
    linkPago: process.env.HOTEL_LINK_PAGO || 'https://checkout.wompi.co/l/VPOS_0DIY66',
  },

  colores: {
    verde: '#21392E',
    verdeOscuro: '#16271F',
    crema: '#F7F4ED',
    dorado: '#C0A06A',
    grisTexto: '#3D4540',
    linea: '#DDD8CC',
  },

  iva: 0.19,
  impuestoServicio: 0.10,

  prefijos: {
    cotizacion: 'COT-VG',
    convenio: 'CNV-VG',
    reserva: 'RES-VG',
  },

  catalogos: {
    estadosDoc: ['Borrador', 'Enviada', 'En negociación', 'Ganada', 'Perdida'],
    estadosLead: ['Nuevo', 'Contactado', 'Calificado', 'Propuesta enviada', 'Negociación', 'Ganado', 'Perdido'],
    origenes: ['Sitio web', 'Referido', 'Llamada entrante', 'WhatsApp', 'Redes sociales', 'Walk-in', 'OTA / Agencia', 'Evento', 'Otro'],
    intereses: ['Hospedaje', 'Evento / Salón', 'Convenio corporativo', 'Grupo', 'Boda / Social', 'Otro'],
    tiposInteraccion: ['Llamada', 'Correo', 'WhatsApp', 'Reunión', 'Visita', 'Nota'],
    estadosReserva: ['Pendiente', 'Confirmada', 'Check-in', 'Check-out', 'Cancelada', 'No-show'],
  },

  itemsConServicio: [
    'Desayuno adicional', 'Almuerzo', 'Cena',
    'Coffee Break (Mañana)', 'Coffee Break (Tarde)',
    'Estación permanente de café, té y agua', 'Bocadillos', 'Cóctel de bienvenida',
  ],
};

module.exports = env;

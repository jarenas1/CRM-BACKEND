const nodemailer = require('nodemailer');
const env = require('../config/env');
const tplEmail = require('../templates/emailTemplates');
const { fmtMoneda, esc } = require('../utils/format');
const userRepo = require('../repositories/userRepository');
const quotationService = require('./quotationService');
const agreementService = require('./agreementService');
const reservationService = require('./reservationService');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.user || !env.smtp.pass) {
    throw new Error('SMTP no configurado: define SMTP_USER y SMTP_PASS en .env');
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    tls: { ciphers: 'TLSv1.2', rejectUnauthorized: false },
  });
  return transporter;
}

async function verify() {
  const t = getTransporter();
  await t.verify();
  return { ok: true, host: env.smtp.host, port: env.smtp.port, user: env.smtp.user };
}

function buildCcList(senderEmail, extraCc) {
  const list = [];
  if (env.smtp.ccFijo) list.push(env.smtp.ccFijo);
  if (senderEmail) list.push(senderEmail);
  if (extraCc) {
    String(extraCc).split(/[,;]/).map(s => s.trim()).filter(Boolean).forEach(e => list.push(e));
  }
  // únicos
  return [...new Set(list.map(s => s.toLowerCase()))];
}

function noReplyBanner() {
  const C = env.colores;
  return `
  <div style="margin-top:18px;padding:12px 14px;background:#f1ede0;border-left:3px solid ${C.dorado};font-size:11.5px;color:#7d7060;line-height:1.5;border-radius:6px;">
    <strong>⚠ Este correo es informativo y no requiere respuesta.</strong><br>
    Para cualquier consulta puede escribir a <a href="mailto:${env.hotel.emailVentas}" style="color:${C.verde};">${env.hotel.emailVentas}</a> o por WhatsApp al <strong>${env.hotel.whatsapp}</strong>.
  </div>`;
}

function saludo(senderName, contactName, intro) {
  return `<p style="margin-top:0;">Hola${contactName ? ' <strong>' + esc(contactName) + '</strong>' : ''},</p>
          <p>Soy <strong>${esc(senderName || 'el equipo comercial')}</strong> de <strong>${env.hotel.nombreLargo}</strong> y ${intro}</p>`;
}

async function getSender(userId) {
  const u = await userRepo.findById(userId);
  if (!u) throw new Error('Usuario no encontrado');
  if (!u.email) throw new Error('Tu usuario no tiene email configurado. Actualízalo en Mi perfil.');
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    cargo: u.cargo,
    firma: u.firma,
  };
}

async function sendQuotation({ numero, user, extraCc, mensajePersonalizado }) {
  const sender = await getSender(user.id);
  const q = await quotationService.load(numero);
  if (!q.email) throw new Error('La cotización no tiene email destinatario');

  const pdfBuffer = await quotationService.renderPdf(numero);
  const totales = {
    subtotal: parseFloat(q.subtotal), servicio: parseFloat(q.impuestoServicio),
    iva: parseFloat(q.iva), total: parseFloat(q.total),
  };
  const firmante = { nombre: sender.name, cargo: sender.cargo, firmaDataUri: sender.firma };

  const intro = mensajePersonalizado
    ? `<p>${esc(mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `te envío la <strong>cotización N° ${esc(numero)}</strong> que preparamos para <strong>${esc(q.empresa)}</strong>. En el PDF adjunto encontrarás el detalle completo de servicios, tarifas y condiciones.`;

  const contenido =
    saludo(sender.name, q.contacto, intro) +
    tplEmailBoxCotizacion(q, totales) +
    botonPagar() +
    noReplyBanner();

  const html = tplEmail.shell(`COTIZACIÓN N° ${numero}`, contenido, firmante);

  return enviar({
    to: q.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Cotización ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments: [{
      filename: `${numero} - ${q.empresa || 'cotizacion'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}

async function sendAgreement({ numero, user, extraCc, mensajePersonalizado }) {
  const sender = await getSender(user.id);
  const a = await agreementService.load(numero);
  if (!a.email) throw new Error('El convenio no tiene email destinatario');

  const pdfBuffer = await agreementService.renderPdf(numero);
  const firmante = { nombre: sender.name, cargo: sender.cargo, firmaDataUri: sender.firma };
  const intro = mensajePersonalizado
    ? `<p>${esc(mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `te presento nuestra propuesta de <strong>convenio corporativo N° ${esc(numero)}</strong> para <strong>${esc(a.empresa)}</strong>, con tarifas preferenciales para tus colaboradores.`;

  const contenido =
    saludo(sender.name, a.contacto, intro) +
    tplEmailBoxConvenio(a) +
    botonPagar() +
    noReplyBanner();

  const html = tplEmail.shell(`CONVENIO CORPORATIVO N° ${numero}`, contenido, firmante);

  return enviar({
    to: a.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Convenio Corporativo ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments: [{
      filename: `${numero} - Convenio - ${a.empresa || 'corporativo'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}

async function sendReservation({ numero, user, extraCc, mensajePersonalizado }) {
  const sender = await getSender(user.id);
  const r = await reservationService.load(numero);
  if (!r.email) throw new Error('La reserva no tiene email destinatario');

  const pdfBuffer = await reservationService.renderPdf(numero);
  const firmante = { nombre: sender.name, cargo: sender.cargo, firmaDataUri: sender.firma };
  const intro = mensajePersonalizado
    ? `<p>${esc(mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `te confirmo tu reserva <strong>N° ${esc(r.codigoReserva || numero)}</strong> en <strong>${env.hotel.nombreLargo}</strong>. En el PDF adjunto está toda la información: fechas, valor, acomodaciones y políticas.`;

  const contenido =
    saludo(sender.name, r.titular, intro) +
    tplEmailBoxReserva(r) +
    botonPagar() +
    noReplyBanner();

  const html = tplEmail.shell(`CONFIRMACIÓN DE RESERVA N° ${numero}`, contenido, firmante);

  return enviar({
    to: r.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Confirmación de reserva ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments: [{
      filename: `${numero} - Reserva - ${r.titular || 'huesped'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }],
  });
}

async function enviar({ to, cc, subject, html, attachments, senderName }) {
  const t = getTransporter();
  const fromName = senderName ? `${senderName} · ${env.hotel.nombre}` : env.smtp.fromName;
  const info = await t.sendMail({
    from: { name: fromName, address: env.smtp.from },
    to,
    cc,
    replyTo: env.smtp.replyTo,
    subject,
    html,
    attachments,
    headers: {
      'X-Auto-Response-Suppress': 'All',
      'Auto-Submitted': 'auto-generated',
    },
  });
  return { ok: true, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected, cc };
}

// ─── helpers de plantillas ───
function botonPagar() {
  const C = env.colores;
  return `
  <table style="width:100%;margin:18px 0;border-collapse:collapse;"><tr><td style="text-align:center;">
    <a href="${env.hotel.linkPago}" target="_blank" style="display:inline-block;background:${C.dorado};color:${C.verdeOscuro};font-weight:bold;text-decoration:none;padding:13px 34px;border-radius:8px;font-size:15px;letter-spacing:.5px;">Pagar ahora en línea</a>
    <div style="font-size:11px;color:#999;margin-top:7px;">Pago seguro vía Wompi · tarjeta, PSE o link</div>
  </td></tr></table>`;
}

function tplEmailBoxCotizacion(q, totales) {
  const C = env.colores;
  const m = q.moneda || 'COP';
  return `
  <table style="width:100%;background:${C.crema};border-left:4px solid ${C.dorado};margin:18px 0;border-collapse:collapse;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:11px;color:${C.dorado};letter-spacing:1px;">TOTAL COTIZACIÓN ${m}</div>
      <div style="font-size:24px;color:${C.verde};font-weight:bold;margin-top:2px;">${fmtMoneda(totales.total, m)}</div>
      <div style="font-size:12.5px;color:${C.grisTexto};margin-top:6px;">
        Tipo: <strong>${esc(q.tipoCotizacion || 'Hospedaje')}</strong>
        ${q.fechaCaducidad ? ` · Válida hasta: <strong>${q.fechaCaducidad}</strong>` : ''}
      </div>
    </td></tr>
  </table>`;
}

function tplEmailBoxConvenio(a) {
  const C = env.colores;
  return `
  <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
    <tr style="background:${C.verde};color:#fff;">
      <td style="padding:9px;text-align:center;">Sencilla</td>
      <td style="padding:9px;text-align:center;">Doble</td>
      <td style="padding:9px;text-align:center;">Junior Suite</td>
    </tr>
    <tr style="background:${C.crema};">
      <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(a.tarifaSencilla, 'COP')}</td>
      <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(a.tarifaDoble, 'COP')}</td>
      <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(a.tarifaSuite, 'COP')}</td>
    </tr>
  </table>`;
}

function tplEmailBoxReserva(r) {
  const C = env.colores;
  return `
  <table style="width:100%;background:${C.crema};border-left:4px solid ${C.dorado};margin:18px 0;border-collapse:collapse;border-radius:8px;overflow:hidden;">
    <tr><td style="padding:16px 18px;">
      <div style="font-size:11px;color:${C.dorado};letter-spacing:1px;">VALOR TOTAL A PAGAR</div>
      <div style="font-size:22px;color:${C.verde};font-weight:bold;margin-top:2px;">${fmtMoneda(r.total, 'COP')}${r.aplicaIva ? ' IVA incluido' : ''}</div>
      <div style="font-size:12.5px;margin-top:6px;">
        Check-in: <strong>${r.fechaLlegada}</strong> · Check-out: <strong>${r.fechaSalida}</strong>
      </div>
    </td></tr>
  </table>`;
}

module.exports = {
  verify,
  sendQuotation,
  sendAgreement,
  sendReservation,
};

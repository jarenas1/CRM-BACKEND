const nodemailer = require('nodemailer');
const env = require('../config/env');
const tplEmail = require('../templates/emailTemplates');
const userRepo = require('../repositories/userRepository');
const { emailLogoAttachments, usePublicEmailLogos } = require('../utils/logo');
const quotationService = require('./quotationService');
const agreementService = require('./agreementService');
const reservationService = require('./reservationService');

// Convierte una firma en data URI (data:image/png;base64,...) en un adjunto
// inline con CID, para que renderice bien en clientes de correo como Gmail.
function firmaInlineAttachment(dataUri, cid) {
  if (!dataUri || typeof dataUri !== 'string') return null;
  const m = dataUri.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!m) return null;
  return {
    filename: `firma.${(m[1].split('/')[1] || 'png').replace('svg+xml', 'svg')}`,
    content: Buffer.from(m[2], 'base64'),
    contentType: m[1],
    cid,
    contentDisposition: 'inline',
  };
}

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.user || !env.smtp.pass) {
    throw new Error('SMTP no configurado: define SMTP_USER (tu Gmail) y SMTP_PASS (App Password de 16 caracteres) en .env');
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    // Fallar rápido y claro en vez de colgarse si el host bloquea el puerto SMTP.
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  return transporter;
}

async function verify() {
  if (env.emailProvider === 'brevo') {
    if (!env.brevoApiKey) throw new Error('Brevo no configurado: define BREVO_API_KEY');
    const resp = await fetch('https://api.brevo.com/v3/account', {
      headers: { accept: 'application/json', 'api-key': env.brevoApiKey },
    });
    if (!resp.ok) throw new Error(`Brevo ${resp.status}: ${await resp.text()}`);
    const acc = await resp.json();
    return { ok: true, provider: 'brevo', email: acc.email, from: env.smtp.from };
  }
  const t = getTransporter();
  await t.verify();
  return { ok: true, provider: 'smtp', host: env.smtp.host, port: env.smtp.port, user: env.smtp.user };
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
  const firmaAtt = usePublicEmailLogos() ? null : firmaInlineAttachment(sender.firma, 'firma-usuario');
  const firmante = { nombre: sender.name, cargo: sender.cargo, firmaCid: firmaAtt ? 'firma-usuario' : null };

  const html = tplEmail.cotizacionEmail(q, numero, totales, firmante, { mensajePersonalizado });

  const attachments = [
    {
      filename: `${numero} - ${q.empresa || 'cotizacion'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
    ...emailLogoAttachments(),
  ];
  if (firmaAtt) attachments.push(firmaAtt);

  return enviar({
    to: q.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Cotización ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments,
  });
}

async function sendAgreement({ numero, user, extraCc, mensajePersonalizado }) {
  const sender = await getSender(user.id);
  const a = await agreementService.load(numero);
  if (!a.email) throw new Error('El convenio no tiene email destinatario');

  const pdfBuffer = await agreementService.renderPdf(numero);
  const firmaAtt = usePublicEmailLogos() ? null : firmaInlineAttachment(sender.firma, 'firma-usuario');
  const firmante = { nombre: sender.name, cargo: sender.cargo, firmaCid: firmaAtt ? 'firma-usuario' : null };

  const html = tplEmail.convenioEmail(a, numero, firmante, { mensajePersonalizado });

  const attachments = [
    {
      filename: `${numero} - Convenio - ${a.empresa || 'corporativo'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
    ...emailLogoAttachments(),
  ];
  if (firmaAtt) attachments.push(firmaAtt);

  return enviar({
    to: a.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Convenio Corporativo ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments,
  });
}

async function sendReservation({ numero, user, extraCc, mensajePersonalizado }) {
  const sender = await getSender(user.id);
  const r = await reservationService.load(numero);
  if (!r.email) throw new Error('La reserva no tiene email destinatario');

  const pdfBuffer = await reservationService.renderPdf(numero);

  // Logos (URL pública o CID inline) + firma inline (CID) según configuración.
  const logoAttachments = emailLogoAttachments();
  const firmaAtt = usePublicEmailLogos() ? null : firmaInlineAttachment(sender.firma, 'firma-usuario');
  const firmante = {
    nombre: sender.name,
    cargo: sender.cargo,
    firmaCid: firmaAtt ? 'firma-usuario' : null,
  };

  const html = tplEmail.reservaEmail(r, numero, firmante, { mensajePersonalizado });

  const attachments = [
    {
      filename: `${numero} - Reserva - ${r.titular || 'huesped'}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
    ...logoAttachments,
  ];
  if (firmaAtt) attachments.push(firmaAtt);

  return enviar({
    to: r.email,
    cc: buildCcList(sender.email, extraCc),
    subject: `Confirmación de reserva ${numero} — ${env.hotel.nombre}`,
    html,
    senderName: sender.name,
    attachments,
  });
}

async function enviar({ to, cc, subject, html, attachments, senderName }) {
  const fromName = senderName ? `${senderName} · ${env.hotel.nombre}` : env.smtp.fromName;
  if (env.emailProvider === 'brevo') {
    return enviarBrevo({ fromName, to, cc, subject, html, attachments });
  }
  const t = getTransporter();
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

// Envío vía API HTTP de Brevo (funciona donde el SMTP saliente está bloqueado, p. ej. Render).
async function enviarBrevo({ fromName, to, cc, subject, html, attachments }) {
  if (!env.brevoApiKey) {
    throw new Error('Brevo no configurado: define BREVO_API_KEY en el entorno');
  }
  const toList = (Array.isArray(to) ? to : [to])
    .filter(Boolean).map((email) => ({ email }));
  const ccList = (cc || []).filter(Boolean).map((email) => ({ email }));

  // Convierte los adjuntos de nodemailer al formato de Brevo ({ name, content(base64) }).
  const brevoAtt = (attachments || []).map((a) => {
    let buf = a.content;
    if (typeof buf === 'string') buf = Buffer.from(buf);
    else if (buf && !Buffer.isBuffer(buf)) buf = Buffer.from(buf);
    else if (!buf && a.path) buf = require('fs').readFileSync(a.path);
    return buf ? { name: a.filename || 'adjunto', content: buf.toString('base64') } : null;
  }).filter(Boolean);

  const body = {
    sender: { name: fromName, email: env.smtp.from },
    to: toList,
    subject,
    htmlContent: html,
    replyTo: { email: env.smtp.replyTo },
    headers: { 'X-Auto-Response-Suppress': 'All', 'Auto-Submitted': 'auto-generated' },
  };
  if (ccList.length) body.cc = ccList;
  if (brevoAtt.length) body.attachment = brevoAtt;

  const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': env.brevoApiKey,
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Brevo ${resp.status}: ${text || resp.statusText}`);
  }
  let data = {};
  try { data = JSON.parse(text); } catch (e) { /* respuesta sin cuerpo JSON */ }
  return { ok: true, messageId: data.messageId, accepted: toList.map((t) => t.email), cc };
}

module.exports = {
  verify,
  sendQuotation,
  sendAgreement,
  sendReservation,
};

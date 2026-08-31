const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');
const {
  getMainLogoDataUri,
  getRadissonLogoDataUri,
  getMainLogoWhiteDataUri,
  getRadissonLogoWhiteDataUri,
} = require('../utils/logo');

// Paleta fiel al generador de confirmaciones V Grand
const CO = {
  green: '#14211d',
  green2: '#173a32',
  brass: '#b08d57',
  ink: '#2c2c2c',
  muted: '#8a857c',
  cream: '#faf6ee',
  creamLine: '#e7dcc6',
  line: '#ece7dd',
  paper: '#ffffff',
};

function nl2br(s) {
  return esc(s).replace(/\n/g, '<br>');
}

module.exports = function buildReservaHtml(data, numero, firmante = {}) {
  const H = env.hotel;
  const logoMain = getMainLogoDataUri();
  const logoRad = getRadissonLogoDataUri();
  const logoMainWhite = getMainLogoWhiteDataUri();
  const logoRadWhite = getRadissonLogoWhiteDataUri();

  const codigo = data.codigoReserva || numero;
  const titular = data.titular || '';
  const empresa = data.empresa || 'Particular';
  const noches = data.noches || 1;
  const habitaciones = data.numeroHabitaciones || 1;
  const valor = parseFloat(data.valorNoche) || 0;
  const subtotal = parseFloat(data.subtotal) || valor * noches * habitaciones;
  const aplicaIva = !!data.aplicaIva;
  const ivaPct = Math.round(env.iva * 100);
  const iva = aplicaIva ? (parseFloat(data.iva) || subtotal * env.iva) : 0;
  const total = parseFloat(data.total) || subtotal + iva;

  // Contenido editorial (fiel al generador de referencia)
  const intro = 'Gracias por elegir V Grand Hotel, a member of Radisson Individuals. De acuerdo con su solicitud, '
    + 'adjuntamos la confirmación de su reserva. A continuación encontrará los detalles:';
  const closing = 'Quedamos atentos a cualquier inquietud. Será un placer atenderle.';
  const ivaNote = 'Aplica para nacionales y residentes en Colombia. Los turistas extranjeros están exentos del IVA '
    + 'en servicios de hotelería, conforme a la normatividad vigente.';
  const bWeek = '6:30 a. m. a 10:30 a. m.';
  const bWeekend = '6:30 a. m. a 11:00 a. m.';
  const ciTime = 'Desde las 3:00 p. m. (los viernes, desde las 4:00 p. m.)';
  const coTime = 'Antes de las 12:00 (mediodía)';
  const cancelPol = 'Deben realizarse con mínimo 48 horas de anticipación. De lo contrario, se cobrará una penalidad '
    + 'equivalente al valor de la primera noche.';
  const noshowPol = 'Si no se presenta el día de la reserva, se cobrará el valor de una noche de alojamiento.';
  const smoke = 'USD 50 por noche';

  const greeting = titular ? `Estimado(a) ${esc(titular)}:` : 'Cordial saludo:';
  const nightWord = noches === 1 ? 'noche' : 'noches';
  const roomWord = habitaciones === 1 ? 'habitación' : 'habitaciones';
  const valLine = `${fmtMoneda(valor, 'COP')} &times; ${noches} ${nightWord} &times; ${habitaciones} ${roomWord}`;

  const detailRow = (label, value, last) => {
    const b = last ? '' : `border-bottom:1px solid ${CO.line};`;
    return '<tr>'
      + `<td width="42%" style="padding:5px 0;${b}color:${CO.muted};font-size:12px;letter-spacing:.5px;text-transform:uppercase;vertical-align:top;">${label}</td>`
      + `<td width="58%" style="padding:5px 0;${b}text-align:right;vertical-align:top;">${value}</td>`
      + '</tr>';
  };

  const infoItem = (label, text) => '<tr>'
    + `<td style="padding:4px 10px 4px 0;color:${CO.brass};vertical-align:top;">&bull;</td>`
    + `<td style="padding:4px 0;vertical-align:top;"><strong>${esc(label)}:</strong> ${esc(text)}</td></tr>`;

  const logoImg = (src, alt, w) => (src
    ? `<img src="${src}" alt="${esc(alt)}" width="${w}" style="display:inline-block;border:0;max-width:100%;height:auto;vertical-align:middle;">`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${CO.brass};letter-spacing:1px;">${esc(alt)}</span>`);

  // Firma guardada en el perfil del usuario (firmante.firmaDataUri)
  const firmaBlock = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" alt="Firma" style="display:block;border:0;margin:8px 0 4px 0;max-height:54px;max-width:260px;height:auto;">`
    : '<div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>';
  const firmaNombre = firmante.nombre || H.razonSocial;
  const firmaCargo = firmante.cargo || 'Líder de Reservas';

  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>body{margin:0;padding:0;background:#e9e5dd;}'
    + '@media only screen and (max-width:620px){.container{width:100%!important;}.px{padding-left:22px!important;padding-right:22px!important;}}'
    + '@media print{body{background:#fff;}}</style></head>'
    + '<body style="margin:0;padding:0;background:#e9e5dd;">'
    + `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#e9e5dd;font-size:1px;">Su reserva en V Grand Hotel está confirmada &middot; Código ${esc(codigo)}</div>`
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e5dd;"><tr><td align="center" style="padding:14px 12px;">'

    + `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${CO.paper};border:1px solid #ddd5c7;">`

    // header (fondo claro, logos oscuros)
    + '<tr><td style="background:#ffffff;padding:16px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMain, 'V Grand Hotel Medellín', 180)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRad, 'Member of Radisson Individuals', 120)}</td>`
    + '</tr></table></td></tr>'
    + `<tr><td style="height:3px;background:${CO.brass};line-height:3px;font-size:0;">&nbsp;</td></tr>`

    // título
    + '<tr><td class="px" style="padding:18px 40px 4px 40px;">'
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${CO.brass};text-transform:uppercase;">Confirmación de reserva</div>`
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${CO.green2};padding-top:5px;">Código N.° ${esc(codigo)}</div>`
    + '</td></tr>'

    // saludo + intro
    + `<tr><td class="px" style="padding:10px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${CO.ink};">`
    + `<p style="margin:0 0 8px 0;">${greeting}</p>`
    + `<p style="margin:0;">${esc(intro)}</p>`
    + '</td></tr>'

    // datos de la reserva
    + '<tr><td class="px" style="padding:14px 40px 0 40px;">'
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;border-bottom:2px solid ${CO.brass};padding-bottom:6px;margin-bottom:8px;">Datos de la reserva</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${CO.ink};">`
    + detailRow('Titular', esc(titular))
    + detailRow('Empresa / Agencia', esc(empresa))
    + detailRow('Tipo de habitación', esc(data.tipoHabitacion))
    + detailRow('N.° de habitaciones', esc(habitaciones))
    + detailRow('N.° de huéspedes', esc(data.numeroHuespedes))
    + detailRow('Llegada (check-in)', fmtFecha(data.fechaLlegada))
    + detailRow('Salida (check-out)', fmtFecha(data.fechaSalida))
    + detailRow('Noches', `${noches} ${nightWord}`)
    + detailRow('Estado', esc(data.estado || 'Pendiente'))
    + detailRow('Ubicación', nl2br(H.direccion), true)
    + '</table></td></tr>'

    // valor de la estadía
    + '<tr><td class="px" style="padding:14px 40px 0 40px;">'
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CO.cream};border:1px solid ${CO.creamLine};"><tr><td style="padding:13px 16px;">`
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;margin-bottom:8px;">Valor de la estadía</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${CO.ink};">`
    + `<tr><td style="padding:4px 0;">Tarifa &middot; ${valLine}</td><td style="padding:4px 0;text-align:right;white-space:nowrap;">${fmtMoneda(subtotal, 'COP')}</td></tr>`
    + (aplicaIva
      ? `<tr><td style="padding:4px 0;">IVA (${ivaPct}%)</td><td style="padding:4px 0;text-align:right;white-space:nowrap;">${fmtMoneda(iva, 'COP')}</td></tr>`
      : '')
    + `<tr><td colspan="2" style="border-top:1px solid ${CO.creamLine};font-size:0;line-height:0;padding-top:8px;">&nbsp;</td></tr>`
    + `<tr><td style="padding:2px 0;font-family:Georgia,serif;font-size:16px;color:${CO.green2};"><strong>Total a pagar</strong></td>`
    + `<td style="padding:2px 0;text-align:right;font-family:Georgia,serif;font-size:18px;color:${CO.green2};white-space:nowrap;"><strong>${fmtMoneda(total, 'COP')}</strong></td></tr>`
    + (aplicaIva ? `<tr><td colspan="2" style="padding-top:2px;font-size:12px;color:${CO.muted};">IVA incluido</td></tr>` : '')
    + '</table></td></tr></table>'
    + `<p style="margin:7px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11.5px;line-height:1.45;color:${CO.muted};"><strong style="color:#6f6a60;">Nota sobre el IVA:</strong> ${esc(ivaNote)}</p>`
    + '</td></tr>'

    // horarios (se omite la sección de capacidad por tipo de habitación)
    + '<tr><td class="px" style="padding:14px 40px 0 40px;">'
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;border-bottom:2px solid ${CO.brass};padding-bottom:5px;margin-bottom:7px;">Horarios</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${CO.ink};">`
    + `<tr><td width="120" style="padding:3px 0;color:${CO.muted};vertical-align:top;">Desayuno</td><td style="padding:3px 0;vertical-align:top;">Lunes a viernes de ${esc(bWeek)}<br>Sábados, domingos y festivos de ${esc(bWeekend)}</td></tr>`
    + `<tr><td style="padding:3px 0;color:${CO.muted};vertical-align:top;">Check-in</td><td style="padding:3px 0;vertical-align:top;">${esc(ciTime)}</td></tr>`
    + `<tr><td style="padding:3px 0;color:${CO.muted};vertical-align:top;">Check-out</td><td style="padding:3px 0;vertical-align:top;">${esc(coTime)}</td></tr>`
    + '</table></td></tr>'

    // plataforma virtual / pago
    + `<tr><td class="px" style="padding:14px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.5;color:${CO.ink};">`
    + '<strong>Plataforma virtual:</strong> puede pagar o gestionar su reserva en línea a través del siguiente enlace: '
    + `<a href="${esc(H.linkPago)}" style="color:${CO.brass};font-weight:bold;text-decoration:underline;">pagar / gestionar mi reserva</a>. `
    + '<span style="color:' + CO.muted + ';">Pago seguro vía Wompi &middot; tarjeta, PSE o link.</span>'
    + '</td></tr>'

    // información importante
    + '<tr><td class="px" style="padding:14px 40px 0 40px;">'
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;border-bottom:2px solid ${CO.brass};padding-bottom:5px;margin-bottom:7px;">Información importante</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13.5px;line-height:1.6;color:${CO.ink};">`
    + infoItem('Cancelaciones', cancelPol)
    + infoItem('No-show', noshowPol)
    + `<tr><td style="padding:4px 10px 4px 0;color:${CO.brass};vertical-align:top;">&bull;</td><td style="padding:4px 0;vertical-align:top;"><strong>Política antitabaco:</strong> en cumplimiento de la Ley 1335 de 2009, está prohibido fumar dentro de las instalaciones. El incumplimiento generará una penalidad de ${esc(smoke)}, cargada a su cuenta.</td></tr>`
    + '</table></td></tr>'

    // observaciones (opcional)
    + (data.observaciones
      ? '<tr><td class="px" style="padding:12px 40px 0 40px;">'
        + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CO.cream};border-left:3px solid ${CO.green2};"><tr><td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${CO.ink};"><strong>Observaciones:</strong> ${nl2br(data.observaciones)}</td></tr></table>`
        + '</td></tr>'
      : '')

    // cierre + firma
    + `<tr><td class="px" style="padding:14px 40px 18px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:${CO.ink};">`
    + `<p style="margin:0 0 10px 0;">${esc(closing)}</p>`
    + `<p style="margin:0;color:${CO.muted};font-size:13px;">Cordialmente,</p>`
    + firmaBlock
    + `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${CO.green2};"><strong>${esc(firmaNombre)}</strong></p>`
    + `<p style="margin:2px 0 0 0;color:${CO.muted};font-size:13px;">${esc(firmaCargo)} &middot; V Grand Hotel</p>`
    + '</td></tr>'

    // footer (verde oscuro, logos en blanco directamente sobre el verde)
    + `<tr><td style="background:${CO.green};padding:16px 40px;">`
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMainWhite, 'V Grand Hotel Medellín', 150)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRadWhite, 'Member of Radisson Individuals', 120)}</td>`
    + '</tr></table>'
    + '<div style="height:1px;background:#2f3e38;margin:12px 0;line-height:1px;font-size:0;">&nbsp;</div>'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#b8c2bd;">'
    + `<tr><td>${nl2br(H.direccion)}</td></tr>`
    + `<tr><td>Tel.: ${esc(H.whatsapp)} &nbsp;&middot;&nbsp; Correo: ${esc(H.emailReservas)} &nbsp;&middot;&nbsp; Web: ${esc(H.web)}</td></tr>`
    + '</table></td></tr>'

    + '</table>'

    + '<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;"><tr>'
    + `<td style="padding:10px 40px;font-family:Arial,Helvetica,sans-serif;font-size:10.5px;line-height:1.4;color:#9a948a;text-align:center;">Este mensaje contiene la confirmación de su reserva. Por favor, conserve el código N.° ${esc(codigo)} para cualquier gestión.</td>`
    + '</tr></table>'

    + '</td></tr></table></body></html>';
};

// Piezas de marca compartidas para los PDF (header, footer, secciones)
// para que reserva, cotización y convenio tengan un formato consistente.
const env = require('../config/env');
const { esc } = require('../utils/format');
const {
  getMainLogoDataUri,
  getRadissonLogoDataUri,
  getMainLogoWhiteDataUri,
  getRadissonLogoWhiteDataUri,
} = require('../utils/logo');

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

function logoImg(src, alt, w, dark) {
  if (src) {
    return `<img src="${src}" alt="${esc(alt)}" width="${w}" style="display:inline-block;border:0;max-width:100%;height:auto;vertical-align:middle;">`;
  }
  const color = dark ? '#e7e2d6' : CO.brass;
  return `<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${color};letter-spacing:1px;">${esc(alt)}</span>`;
}

// Cabecera: fondo blanco, logo V Grand (izq) + Radisson (der), franja dorada
// y banda de título (kicker en dorado, título en verde serif, meta a la derecha).
function pdfHeader({ kicker = '', title = '', metaHtml = '' } = {}) {
  const logoMain = getMainLogoDataUri();
  const logoRad = getRadissonLogoDataUri();
  return '<tr><td style="background:#ffffff;padding:14px 40px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMain, 'V Grand Hotel Medellín', 175)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRad, 'Member of Radisson Individuals', 118)}</td>`
    + '</tr></table></td></tr>'
    + `<tr><td style="height:3px;background:${CO.brass};line-height:3px;font-size:0;">&nbsp;</td></tr>`
    + '<tr><td style="padding:12px 40px 2px 40px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td valign="top">'
    + (kicker ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${CO.brass};text-transform:uppercase;">${esc(kicker)}</div>` : '')
    + (title ? `<div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${CO.green2};padding-top:5px;">${title}</div>` : '')
    + '</td>'
    + (metaHtml ? `<td valign="top" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${CO.muted};line-height:1.6;">${metaHtml}</td>` : '')
    + '</tr></table></td></tr>';
}

// Título de sección con subrayado dorado (estilo Georgia mayúsculas).
function pdfSectionTitle(text) {
  return `<div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;border-bottom:2px solid ${CO.brass};padding-bottom:5px;margin:0 0 8px;">${esc(text)}</div>`;
}

// Pie: verde oscuro con logos en blanco + slogan y datos de contacto.
function pdfFooter() {
  const H = env.hotel;
  const logoMainWhite = getMainLogoWhiteDataUri();
  const logoRadWhite = getRadissonLogoWhiteDataUri();
  return `<tr><td style="background:${CO.green};padding:13px 40px;">`
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMainWhite, 'V Grand Hotel Medellín', 145, true)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRadWhite, 'Member of Radisson Individuals', 115, true)}</td>`
    + '</tr></table>'
    + '<div style="height:1px;background:#2f3e38;margin:10px 0;line-height:1px;font-size:0;">&nbsp;</div>'
    + `<div style="font-family:Georgia,serif;color:${CO.brass};font-size:11px;letter-spacing:3px;">${esc(H.slogan)}</div>`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#b8c2bd;margin-top:5px;">`
    + `<tr><td>${esc(H.direccion)}</td></tr>`
    + `<tr><td>Tel.: ${esc(H.whatsapp)} &nbsp;&middot;&nbsp; ${esc(H.emailVentas)} &nbsp;&middot;&nbsp; ${esc(H.web)}</td></tr>`
    + '</table></td></tr>';
}

// Envoltura de documento: tabla exterior + contenedor 600px.
function pdfWrap(innerRows) {
  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>body{margin:0;padding:0;background:#fff;}</style></head>'
    + '<body style="margin:0;padding:0;background:#e9e5dd;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e5dd;"><tr><td align="center" style="padding:14px 12px;">'
    + `<table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background:${CO.paper};border:1px solid #ddd5c7;">`
    + innerRows
    + '</table></td></tr></table></body></html>';
}

module.exports = { CO, logoImg, pdfHeader, pdfSectionTitle, pdfFooter, pdfWrap };

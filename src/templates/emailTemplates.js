const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');
const { getLogoDataUri, emailLogoSrc, usePublicEmailLogos } = require('../utils/logo');

function botonPago() {
  const C = env.colores;
  return `
  <table style="width:100%;margin:18px 0;border-collapse:collapse;"><tr><td style="text-align:center;">
    <a href="${env.hotel.linkPago}" target="_blank" style="display:inline-block;background:${C.dorado};color:${C.verdeOscuro};font-weight:bold;text-decoration:none;padding:13px 34px;border-radius:8px;font-size:15px;letter-spacing:.5px;">Pagar ahora en línea</a>
    <div style="font-size:11px;color:#999;margin-top:7px;">Pago seguro vía Wompi · tarjeta, PSE o link</div>
  </td></tr></table>`;
}

function shell(titulo, contenido, firmante) {
  const C = env.colores;
  const H = env.hotel;
  const firmaImg = firmante && firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" style="max-height:58px;max-width:220px;margin-bottom:8px;display:block;">`
    : '';
  const nombre = (firmante && firmante.nombre) || H.razonSocial;
  const cargo = (firmante && firmante.cargo) || 'Equipo Comercial';
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid ${C.linea};">
    <div style="background:${C.verde};padding:24px;text-align:center;border-bottom:4px solid ${C.dorado};">
      <img src="${getLogoDataUri()}" alt="V Grand Hotel" style="height:110px;width:auto;background:#fff;padding:10px;border-radius:12px;display:inline-block;" />
    </div>
    <div style="background:${C.crema};padding:11px 24px;border-bottom:1px solid ${C.linea};">
      <div style="font-size:13px;color:${C.verde};font-weight:bold;letter-spacing:1px;">${titulo}</div>
    </div>
    <div style="padding:24px;font-size:14px;color:${C.grisTexto};line-height:1.65;">
      ${contenido}
      <table style="margin-top:22px;border-top:1px solid ${C.linea};width:100%;">
        <tr><td style="padding-top:14px;font-size:12.5px;color:${C.grisTexto};">
          ${firmaImg}
          <strong style="color:${C.verde};">${esc(nombre)}</strong><br>
          ${esc(cargo)}<br>
          Tel: ${H.whatsapp}<br>
          ${H.emailVentas}<br>
          ${H.direccion}
        </td></tr>
      </table>
    </div>
    <div style="background:${C.verde};padding:14px;text-align:center;">
      <span style="font-family:Georgia,serif;color:${C.dorado};font-size:11px;letter-spacing:3px;">${H.slogan}</span><br>
      <span style="color:#cfd8d2;font-size:9px;">${H.nombreLargo} · ${H.web}</span>
    </div>
  </div>`;
}

function cotizacion(data, numero, totales, firmante) {
  const C = env.colores;
  const H = env.hotel;
  const m = data.moneda || 'COP';
  const intro = data.mensajePersonalizado
    ? `<p>${esc(data.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin-top:0;">Estimado/a <strong>${esc(data.contacto) || 'cliente'}</strong>,</p>
       <p>Reciba un cordial saludo de parte de <strong>${H.nombreLargo}</strong>.</p>
       <p>Adjunto encontrará la <strong>cotización N° ${numero}</strong> solicitada para <strong>${esc(data.empresa)}</strong>.</p>`;
  const box = `
    <table style="width:100%;background:${C.crema};border-left:4px solid ${C.dorado};margin:18px 0;border-collapse:collapse;">
      <tr><td style="padding:16px 18px;">
        <div style="font-size:11px;color:${C.dorado};letter-spacing:1px;">TOTAL COTIZACIÓN ${m}</div>
        <div style="font-size:23px;color:${C.verde};font-weight:bold;margin-top:2px;">${fmtMoneda(totales.total, m)}</div>
        <div style="font-size:12.5px;color:${C.grisTexto};margin-top:6px;">
          Tipo: <strong>${esc(data.tipoCotizacion)}</strong>
          ${data.fechaCaducidad ? ` &nbsp;·&nbsp; Válida hasta: <strong>${fmtFecha(data.fechaCaducidad)}</strong>` : ''}
        </div>
      </td></tr>
    </table>` + botonPago() + `
    <p>En el PDF adjunto encontrará el <strong>detalle completo</strong> de los servicios, tarifas y condiciones.</p>`;
  return shell(`COTIZACIÓN N° ${numero}`, intro + box, firmante);
}

function convenio(data, numero, firmante) {
  const C = env.colores;
  const H = env.hotel;
  const vig = fmtFecha(data.vigenciaHasta) || `31/12/${new Date().getFullYear()}`;
  const intro = data.mensajePersonalizado
    ? `<p>${esc(data.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin-top:0;">Estimado/a <strong>${esc(data.contacto) || 'cliente'}</strong>,</p>
       <p>Es un gusto presentar nuestra propuesta de <strong>convenio corporativo</strong> para <strong>${esc(data.empresa)}</strong>.</p>`;
  const tabla = `
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
      <tr style="background:${C.verde};color:#fff;">
        <td style="padding:9px;text-align:center;">Sencilla</td>
        <td style="padding:9px;text-align:center;">Doble</td>
        <td style="padding:9px;text-align:center;">Junior Suite</td>
      </tr>
      <tr style="background:${C.crema};">
        <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(data.tarifaSencilla, 'COP')}</td>
        <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(data.tarifaDoble, 'COP')}</td>
        <td style="padding:12px;text-align:center;font-weight:bold;color:${C.verde};font-size:15px;">${fmtMoneda(data.tarifaSuite, 'COP')}</td>
      </tr>
    </table>
    <p style="font-size:12.5px;"><strong>Vigencia hasta el ${vig}.</strong> Tarifas COP por habitación/noche, no incluyen IVA (19%). Incluyen desayuno buffet, wifi, gimnasio y parqueadero en cortesía.</p>
    ${botonPago()}
    <p>En el PDF adjunto encontrará el detalle completo de beneficios, condiciones y cláusulas.</p>`;
  return shell(`CONVENIO CORPORATIVO N° ${numero}`, intro + tabla, firmante);
}

function reserva(data, numero, firmante) {
  const C = env.colores;
  const H = env.hotel;
  const intro = data.mensajePersonalizado
    ? `<p>${esc(data.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin-top:0;">Estimado/a <strong>${esc(data.titular) || 'huésped'}</strong>,</p>
       <p>De acuerdo a tu solicitud, te confirmamos la reserva <strong>N° ${esc(data.codigoReserva || numero)}</strong> en <strong>${H.nombreLargo}</strong>.</p>`;
  const total = parseFloat(data.total) || 0;
  const box = `
    <table style="width:100%;background:${C.crema};border-left:4px solid ${C.dorado};margin:18px 0;border-collapse:collapse;">
      <tr><td style="padding:16px 18px;">
        <div style="font-size:11px;color:${C.dorado};letter-spacing:1px;">VALOR TOTAL A PAGAR</div>
        <div style="font-size:22px;color:${C.verde};font-weight:bold;margin-top:2px;">${fmtMoneda(total, 'COP')}${data.aplicaIva ? ' IVA incluido' : ''}</div>
        <div style="font-size:12.5px;margin-top:6px;">
          Check-in: <strong>${fmtFecha(data.fechaLlegada)}</strong> · Check-out: <strong>${fmtFecha(data.fechaSalida)}</strong>
        </div>
      </td></tr>
    </table>
    ${botonPago()}
    <p>En el PDF adjunto encontrará todos los detalles de su reserva, acomodaciones, horarios y políticas.</p>`;
  return shell(`CONFIRMACIÓN DE RESERVA N° ${numero}`, intro + box, firmante);
}

// Correo de reserva: cuerpo simple y amable con logos en blanco sobre verde.
// El detalle completo va en el PDF adjunto (descargable).
function reservaEmail(r, numero, firmante = {}, opts = {}) {
  const C = env.colores;
  const H = env.hotel;
  const brass = '#b08d57';
  // Logos: URL pública (prod/Brevo) o CID inline (SMTP local) según configuración.
  const logoMainWhite = emailLogoSrc('vgrandWhite');
  const logoRadWhite = emailLogoSrc('radissonWhite');

  const codigo = r.codigoReserva || numero;
  const titular = r.titular || '';
  const total = parseFloat(r.total) || 0;

  // La firma va por CID (SMTP) o data URI (vista previa). En modo URL pública
  // (Brevo) se omite la imagen de firma, pues no tiene URL pública; queda en el PDF.
  const firmaSrc = usePublicEmailLogos()
    ? ''
    : (firmante && firmante.firmaCid)
      ? `cid:${firmante.firmaCid}`
      : (firmante && firmante.firmaDataUri) || '';
  const firmaImg = firmaSrc
    ? `<img src="${firmaSrc}" alt="Firma" style="display:block;border:0;margin:6px 0;max-height:56px;max-width:220px;height:auto;">`
    : '';
  const nombre = (firmante && firmante.nombre) || H.razonSocial;
  const cargo = (firmante && firmante.cargo) || 'Líder de Reservas';

  const logoImg = (src, alt, w) => (src
    ? `<img src="${src}" alt="${esc(alt)}" width="${w}" style="display:inline-block;border:0;max-width:100%;height:auto;vertical-align:middle;">`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#fff;letter-spacing:1px;">${esc(alt)}</span>`);

  const intro = opts.mensajePersonalizado
    ? `<p style="margin:0 0 14px 0;">${esc(opts.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin:0 0 14px 0;">Aquí encontrarás la confirmación de tu reserva <strong>N.° ${esc(codigo)}</strong> en <strong>${esc(H.nombreLargo)}</strong>. `
      + 'Ha sido un gusto gestionarla para ti.</p>'
      + '<p style="margin:0 0 14px 0;">Adjuntamos el <strong>documento PDF</strong> con todos los detalles: fechas, valor, acomodaciones, horarios y políticas. Puedes descargarlo y conservarlo para cualquier gestión.</p>';

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">`
    + `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    + `<style>body{margin:0;padding:0;background:#e9e5dd;}`
    + `@media only screen and (max-width:620px){.container{width:100%!important;}.px{padding-left:22px!important;padding-right:22px!important;}}</style></head>`
    + `<body style="margin:0;padding:0;background:#e9e5dd;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e5dd;"><tr><td align="center" style="padding:26px 12px;">`

    + `<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #ddd5c7;">`

    // header: logos en blanco sobre verde
    + `<tr><td style="background:${C.verde};padding:24px 34px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMainWhite, 'V Grand Hotel Medellín', 168)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRadWhite, 'Member of Radisson Individuals', 118)}</td>`
    + `</tr></table></td></tr>`
    + `<tr><td style="height:3px;background:${brass};line-height:3px;font-size:0;">&nbsp;</td></tr>`

    // título
    + `<tr><td class="px" style="padding:26px 34px 4px 34px;">`
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${brass};text-transform:uppercase;">Confirmación de reserva</div>`
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;color:${C.verde};padding-top:6px;">Hola${titular ? ' ' + esc(titular) : ''}</div>`
    + `</td></tr>`

    // cuerpo amable
    + `<tr><td class="px" style="padding:12px 34px 0 34px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.grisTexto};">`
    + intro
    + `</td></tr>`

    // callout del PDF adjunto
    + `<tr><td class="px" style="padding:8px 34px 0 34px;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf6ee;border:1px solid #e7dcc6;border-radius:8px;"><tr>`
    + `<td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.grisTexto};line-height:1.5;">`
    + `<span style="color:${brass};font-weight:bold;">&#128206; Documento adjunto</span><br>`
    + `Tu confirmación en PDF &middot; reserva N.° <strong>${esc(codigo)}</strong>`
    + (total ? ` &middot; Total <strong>${fmtMoneda(total, 'COP')}</strong>${r.aplicaIva ? ' IVA incl.' : ''}` : '')
    + `</td></tr></table>`
    + `</td></tr>`

    // botón pagar
    + `<tr><td class="px" style="padding:6px 34px 0 34px;">${botonPago()}</td></tr>`

    // cierre + firma
    + `<tr><td class="px" style="padding:18px 34px 28px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${C.grisTexto};">`
    + `<p style="margin:0 0 12px 0;">Quedamos atentos a cualquier inquietud. &iexcl;Ser&aacute; un placer recibirte!</p>`
    + `<p style="margin:0;color:#8a857c;font-size:13px;">Cordialmente,</p>`
    + firmaImg
    + `<p style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${C.verde};"><strong>${esc(nombre)}</strong></p>`
    + `<p style="margin:2px 0 0 0;color:#8a857c;font-size:13px;">${esc(cargo)} &middot; ${esc(H.nombre)}</p>`
    + `</td></tr>`

    // footer: logos en blanco sobre verde
    + `<tr><td style="background:${C.verdeOscuro};padding:22px 34px;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
    + `<td align="left" valign="middle" style="vertical-align:middle;">${logoImg(logoMainWhite, 'V Grand Hotel Medellín', 140)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${logoImg(logoRadWhite, 'Member of Radisson Individuals', 108)}</td>`
    + `</tr></table>`
    + `<div style="height:1px;background:#2f3e38;margin:14px 0;line-height:1px;font-size:0;">&nbsp;</div>`
    + `<div style="font-family:Georgia,serif;color:${brass};font-size:11px;letter-spacing:3px;">${esc(H.slogan)}</div>`
    + `<div style="font-family:Arial,Helvetica,sans-serif;color:#b8c2bd;font-size:11px;line-height:1.6;margin-top:6px;">${esc(H.direccion)}<br>Tel.: ${esc(H.whatsapp)} &middot; ${esc(H.emailReservas)} &middot; ${esc(H.web)}</div>`
    + `</td></tr>`

    + `</table>`
    + `</td></tr></table></body></html>`;
}

// ─────────────────────────────────────────────────────────────
// Shell de correo con logos en blanco (CID) — formato de marca
// compartido para cotización y convenio (mismo look que la reserva).
// ─────────────────────────────────────────────────────────────
function emailLogoImg(src, alt, w) {
  return `<img src="${src}" alt="${esc(alt)}" width="${w}" style="display:inline-block;border:0;max-width:100%;height:auto;vertical-align:middle;">`;
}

function emailBrandShell({ kicker, greetingTitle, bodyHtml, firmante = {}, closingLine }) {
  const C = env.colores;
  const H = env.hotel;
  const brass = '#b08d57';
  const logoMainWhite = emailLogoSrc('vgrandWhite');
  const logoRadWhite = emailLogoSrc('radissonWhite');

  const firmaSrc = usePublicEmailLogos()
    ? ''
    : (firmante.firmaCid ? `cid:${firmante.firmaCid}` : (firmante.firmaDataUri || ''));
  const firmaImg = firmaSrc
    ? `<img src="${firmaSrc}" alt="Firma" style="display:block;border:0;margin:6px 0;max-height:56px;max-width:220px;height:auto;">`
    : '';
  const nombre = firmante.nombre || H.razonSocial;
  const cargo = firmante.cargo || 'Equipo Comercial';

  return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<style>body{margin:0;padding:0;background:#e9e5dd;}'
    + '@media only screen and (max-width:620px){.container{width:100%!important;}.px{padding-left:22px!important;padding-right:22px!important;}}</style></head>'
    + '<body style="margin:0;padding:0;background:#e9e5dd;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#e9e5dd;"><tr><td align="center" style="padding:26px 12px;">'
    + '<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #ddd5c7;">'

    // header
    + `<tr><td style="background:${C.verde};padding:24px 34px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>`
    + `<td align="left" valign="middle" style="vertical-align:middle;">${emailLogoImg(logoMainWhite, 'V Grand Hotel Medellín', 168)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${emailLogoImg(logoRadWhite, 'Member of Radisson Individuals', 118)}</td>`
    + '</tr></table></td></tr>'
    + `<tr><td style="height:3px;background:${brass};line-height:3px;font-size:0;">&nbsp;</td></tr>`

    // título
    + '<tr><td class="px" style="padding:26px 34px 4px 34px;">'
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${brass};text-transform:uppercase;">${esc(kicker)}</div>`
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:23px;color:${C.verde};padding-top:6px;">${greetingTitle}</div>`
    + '</td></tr>'

    // cuerpo
    + `<tr><td class="px" style="padding:12px 34px 0 34px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${C.grisTexto};">`
    + bodyHtml
    + '</td></tr>'

    // cierre + firma
    + `<tr><td class="px" style="padding:18px 34px 28px 34px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${C.grisTexto};">`
    + `<p style="margin:0 0 12px 0;">${esc(closingLine || 'Quedamos atentos a cualquier inquietud. ¡Será un placer atenderle!')}</p>`
    + '<p style="margin:0;color:#8a857c;font-size:13px;">Cordialmente,</p>'
    + firmaImg
    + `<p style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${C.verde};"><strong>${esc(nombre)}</strong></p>`
    + `<p style="margin:2px 0 0 0;color:#8a857c;font-size:13px;">${esc(cargo)} &middot; ${esc(H.nombre)}</p>`
    + '</td></tr>'

    // footer
    + `<tr><td style="background:${C.verdeOscuro};padding:22px 34px;">`
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + `<td align="left" valign="middle" style="vertical-align:middle;">${emailLogoImg(logoMainWhite, 'V Grand Hotel Medellín', 140)}</td>`
    + `<td align="right" valign="middle" style="vertical-align:middle;">${emailLogoImg(logoRadWhite, 'Member of Radisson Individuals', 108)}</td>`
    + '</tr></table>'
    + '<div style="height:1px;background:#2f3e38;margin:14px 0;line-height:1px;font-size:0;">&nbsp;</div>'
    + `<div style="font-family:Georgia,serif;color:${brass};font-size:11px;letter-spacing:3px;">${esc(H.slogan)}</div>`
    + `<div style="font-family:Arial,Helvetica,sans-serif;color:#b8c2bd;font-size:11px;line-height:1.6;margin-top:6px;">${esc(H.direccion)}<br>Tel.: ${esc(H.whatsapp)} &middot; ${esc(H.emailVentas)} &middot; ${esc(H.web)}</div>`
    + '</td></tr>'

    + '</table></td></tr></table></body></html>';
}

function calloutBox(titulo, lineaHtml) {
  const C = env.colores;
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf6ee;border:1px solid #e7dcc6;border-radius:8px;margin-top:6px;"><tr>'
    + `<td style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${C.grisTexto};line-height:1.5;">`
    + `<span style="color:#b08d57;font-weight:bold;">&#128206; ${esc(titulo)}</span><br>${lineaHtml}`
    + '</td></tr></table>';
}

// Correo de cotización: cuerpo simple + PDF adjunto.
function cotizacionEmail(data, numero, totales, firmante = {}, opts = {}) {
  const H = env.hotel;
  const m = data.moneda || 'COP';
  const contacto = data.contacto || '';
  const intro = opts.mensajePersonalizado
    ? `<p style="margin:0 0 14px 0;">${esc(opts.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin:0 0 14px 0;">Gracias por tu interés en <strong>${esc(H.nombreLargo)}</strong>. Adjuntamos la <strong>cotización N.° ${esc(numero)}</strong> para <strong>${esc(data.empresa || 'tu solicitud')}</strong>.</p>`
      + '<p style="margin:0 0 14px 0;">En el <strong>documento PDF adjunto</strong> encontrarás el detalle completo de servicios, tarifas y condiciones. Puedes descargarlo y conservarlo.</p>';
  const bodyHtml = intro
    + calloutBox('Documento adjunto', `Cotización en PDF &middot; N.° <strong>${esc(numero)}</strong> &middot; Total <strong>${fmtMoneda(totales.total, m)}</strong>`)
    + `<div class="px" style="padding-top:6px;">${botonPago()}</div>`;
  return emailBrandShell({
    kicker: 'Cotización',
    greetingTitle: `Hola${contacto ? ' ' + esc(contacto) : ''}`,
    bodyHtml,
    firmante,
  });
}

// Correo de convenio: cuerpo simple + PDF adjunto.
function convenioEmail(data, numero, firmante = {}, opts = {}) {
  const H = env.hotel;
  const contacto = data.contacto || '';
  const intro = opts.mensajePersonalizado
    ? `<p style="margin:0 0 14px 0;">${esc(opts.mensajePersonalizado).replace(/\n/g, '<br>')}</p>`
    : `<p style="margin:0 0 14px 0;">Es un gusto presentar nuestra propuesta de <strong>convenio corporativo</strong> para <strong>${esc(data.empresa || 'tu empresa')}</strong> con <strong>${esc(H.nombreLargo)}</strong>.</p>`
      + '<p style="margin:0 0 14px 0;">En el <strong>documento PDF adjunto</strong> encontrarás tarifas preferenciales, beneficios, condiciones y cláusulas del convenio.</p>';
  const bodyHtml = intro
    + calloutBox('Documento adjunto', `Convenio corporativo en PDF &middot; N.° <strong>${esc(numero)}</strong>`)
    + `<div class="px" style="padding-top:6px;">${botonPago()}</div>`;
  return emailBrandShell({
    kicker: 'Convenio corporativo',
    greetingTitle: `Hola${contacto ? ' ' + esc(contacto) : ''}`,
    bodyHtml,
    firmante,
  });
}

module.exports = {
  cotizacion, convenio, reserva,
  reservaEmail, cotizacionEmail, convenioEmail,
  shell, botonPago,
};

const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');
const { CO, pdfHeader, pdfSectionTitle, pdfFooter, pdfWrap } = require('./brandLayout');

module.exports = function buildCotizacionHtml(data, numero, totales, firmante = {}) {
  const H = env.hotel;
  const m = data.moneda || 'COP';
  const fecha = fmtFecha(new Date());

  const filas = (data.items || []).map((it, i) => {
    const cant = parseFloat(it.cantidad) || 0;
    const noches = parseFloat(it.noches) || 1;
    const tarifa = parseFloat(it.tarifa) || 0;
    const st = cant * noches * tarifa;
    const bg = i % 2 === 0 ? '#ffffff' : CO.cream;
    const cell = `padding:6px 8px;border-bottom:1px solid ${CO.line};`;
    return `<tr style="background:${bg};">
      <td style="${cell}text-align:center;">${i + 1}</td>
      <td style="${cell}">${esc(it.descripcion || '—')}</td>
      <td style="${cell}text-align:center;">${cant}</td>
      <td style="${cell}text-align:center;">${fmtFecha(it.ingreso) || '–'}</td>
      <td style="${cell}text-align:center;">${fmtFecha(it.salida) || '–'}</td>
      <td style="${cell}text-align:center;">${noches}</td>
      <td style="${cell}text-align:center;">${it.personas || '–'}</td>
      <td style="${cell}text-align:right;">${fmtMoneda(tarifa, m)}</td>
      <td style="${cell}text-align:right;font-weight:bold;">${fmtMoneda(st, m)}</td>
    </tr>`;
  }).join('');

  const filaServ = totales.servicio > 0
    ? `<tr><td style="padding:5px 10px;">Impuesto de servicio (10%)</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.servicio, m)}</td></tr>`
    : '';

  const firmaImg = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" alt="Firma" style="max-height:52px;max-width:220px;display:block;margin:0 0 4px;border:0;">`
    : '';

  const metaHtml = `N.° <strong style="color:${CO.green2};">${esc(numero)}</strong><br>`
    + `Fecha: ${fecha}<br>`
    + `Válida hasta: <strong>${fmtFecha(data.fechaCaducidad) || '–'}</strong><br>`
    + `Moneda: <strong>${esc(m)}</strong>${m === 'USD' && data.trmReferencia ? ` (TRM ref. $${Number(data.trmReferencia).toLocaleString('es-CO')})` : ''}`;

  const box = (accent, kicker, html) => `<td width="50%" valign="top" style="padding:0 7px;">`
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CO.cream};border-left:3px solid ${accent};"><tr><td style="padding:10px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.55;color:${CO.ink};">`
    + `<div style="font-size:9px;letter-spacing:2px;color:${CO.brass};margin-bottom:5px;text-transform:uppercase;">${kicker}</div>${html}`
    + '</td></tr></table></td>';

  const rows =
    pdfHeader({ kicker: 'Propuesta comercial', title: 'Cotización', metaHtml })

    // partes (hotel / cliente)
    + '<tr><td style="padding:12px 33px 0 33px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
    + box(CO.green2, 'El hotel', `<strong>${esc(H.nombreLargo)}</strong><br>Razón social: ${esc(H.razonSocial)}<br>NIT: ${esc(H.nit)}<br>${esc(H.direccion)}`)
    + box(CO.brass, 'El cliente', `<strong>${esc(data.empresa || '')}</strong><br>Contacto: ${esc(data.contacto) || '–'}<br>Email: ${esc(data.email) || '–'}<br>Tel.: ${esc(data.telefono) || '–'}<br>Tipo: ${esc(data.tipoCotizacion)}${data.referencia ? ' · Ref: ' + esc(data.referencia) : ''}`)
    + '</tr></table></td></tr>'

    // disclaimer
    + '<tr><td style="padding:12px 40px 0 40px;">'
    + `<div style="border:1px solid ${CO.creamLine};background:#fbfaf6;padding:9px 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-style:italic;line-height:1.5;color:${CO.muted};">`
    + 'Este documento es únicamente una <strong>cotización</strong> con fines informativos. No representa confirmación de reserva ni compromiso de disponibilidad.'
    + '</div></td></tr>'

    // tabla de ítems
    + '<tr><td style="padding:16px 40px 0 40px;">'
    + pdfSectionTitle('Detalle de la cotización')
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:' + CO.ink + ';border-collapse:collapse;">'
    + `<thead><tr style="background:${CO.green2};color:#fff;">`
    + '<th style="padding:8px 6px;text-align:center;">Ítem</th>'
    + '<th style="padding:8px 6px;text-align:left;">Descripción</th>'
    + '<th style="padding:8px 6px;text-align:center;">Cant.</th>'
    + '<th style="padding:8px 6px;text-align:center;">Ingreso</th>'
    + '<th style="padding:8px 6px;text-align:center;">Salida</th>'
    + '<th style="padding:8px 6px;text-align:center;">Noches</th>'
    + '<th style="padding:8px 6px;text-align:center;">Pers.</th>'
    + '<th style="padding:8px 6px;text-align:right;">Tarifa</th>'
    + '<th style="padding:8px 6px;text-align:right;">Subtotal</th>'
    + `</tr></thead><tbody>${filas}</tbody></table>`
    + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;font-style:italic;margin-top:5px;color:${CO.muted};">* Todas las tarifas de hospedaje incluyen desayuno buffet.</div>`
    + '</td></tr>'

    // totales
    + '<tr><td style="padding:12px 40px 0 40px;">'
    + '<table role="presentation" width="300" align="right" cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:' + CO.ink + ';">'
    + `<tr><td style="padding:5px 10px;">Subtotal ${esc(m)}</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.subtotal, m)}</td></tr>`
    + filaServ
    + `<tr><td style="padding:5px 10px;">IVA (19%)</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.iva, m)}</td></tr>`
    + `<tr style="background:${CO.green2};color:#fff;"><td style="padding:9px 10px;font-family:Georgia,serif;font-weight:bold;">Total ${esc(m)}</td>`
    + `<td style="padding:9px 10px;text-align:right;font-family:Georgia,serif;font-weight:bold;font-size:14px;">${fmtMoneda(totales.total, m)}</td></tr>`
    + '</table></td></tr>'

    // pago en línea
    + '<tr><td style="padding:16px 40px 0 40px;">'
    + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CO.cream};border:1px solid ${CO.creamLine};"><tr><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${CO.ink};">`
    + `<span style="color:${CO.brass};font-weight:bold;letter-spacing:1px;">PAGO EN LÍNEA</span> &nbsp; `
    + `<a href="${esc(H.linkPago)}" style="color:${CO.brass};font-weight:bold;text-decoration:underline;">pagar con Wompi</a> `
    + '<span style="color:' + CO.muted + ';">· tarjeta, PSE o link.</span>'
    + '</td></tr></table></td></tr>'

    // firma
    + '<tr><td style="padding:20px 40px 24px 40px;font-family:Arial,Helvetica,sans-serif;">'
    + firmaImg
    + `<div style="font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${CO.green2};">${esc(firmante.nombre || H.razonSocial)}</div>`
    + `<div style="font-size:12px;color:${CO.muted};margin-top:2px;">${esc(firmante.cargo || 'Equipo Comercial')} &middot; ${esc(H.nombre)}</div>`
    + '</td></tr>'

    + pdfFooter();

  return pdfWrap(rows);
};

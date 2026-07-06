const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');
const { getLogoDataUri } = require('../utils/logo');

module.exports = function buildCotizacionHtml(data, numero, totales, firmante = {}) {
  const C = env.colores;
  const H = env.hotel;
  const logoSrc = getLogoDataUri();
  const m = data.moneda || 'COP';
  const fecha = fmtFecha(new Date());

  const filas = (data.items || []).map((it, i) => {
    const cant = parseFloat(it.cantidad) || 0;
    const noches = parseFloat(it.noches) || 1;
    const tarifa = parseFloat(it.tarifa) || 0;
    const st = cant * noches * tarifa;
    const bg = i % 2 === 0 ? '#FFFFFF' : C.crema;
    return `<tr style="background:${bg};">
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${i + 1}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};">${esc(it.descripcion || '—')}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${cant}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${fmtFecha(it.ingreso) || '–'}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${fmtFecha(it.salida) || '–'}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${noches}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:center;">${it.personas || '–'}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:right;">${fmtMoneda(tarifa, m)}</td>
      <td style="padding:7px 8px;border-bottom:1px solid ${C.linea};text-align:right;font-weight:bold;">${fmtMoneda(st, m)}</td>
    </tr>`;
  }).join('');

  const filaServ = totales.servicio > 0
    ? `<tr><td style="padding:5px 10px;">Impuesto de Servicio (10%):</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.servicio, m)}</td></tr>`
    : '';

  const firmaImg = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" style="max-height:52px;max-width:210px;display:block;margin-bottom:2px;">`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="font-family:Georgia,'Times New Roman',serif;color:${C.grisTexto};margin:0;padding:0;">
  <div style="background:${C.verde};padding:26px 36px;border-bottom:4px solid ${C.dorado};">
    <table style="width:100%;"><tr>
      <td style="vertical-align:middle;">
        <img src="${logoSrc}" alt="V Grand Hotel" style="height:96px;width:auto;display:block;background:#fff;padding:8px;border-radius:10px;" />
      </td>
      <td style="vertical-align:middle;text-align:right;color:#fff;">
        <div style="font-size:22px;letter-spacing:4px;">COTIZACIÓN</div>
        <div style="font-size:13px;color:${C.dorado};margin-top:4px;">N° ${numero}</div>
        <div style="font-size:10px;margin-top:10px;">Fecha: ${fecha}</div>
        <div style="font-size:10px;">Válida hasta: <strong>${fmtFecha(data.fechaCaducidad) || '–'}</strong></div>
        <div style="font-size:10px;">Moneda: <strong>${m}</strong>${m === 'USD' && data.trmReferencia ? ' (TRM ref.: $' + Number(data.trmReferencia).toLocaleString('es-CO') + ')' : ''}</div>
      </td>
    </tr></table>
  </div>
  <div style="padding:22px 36px;">
    <table style="width:100%;font-size:10.5px;border-collapse:collapse;"><tr>
      <td style="width:50%;vertical-align:top;padding-right:14px;">
        <div style="background:${C.crema};border-left:3px solid ${C.verde};padding:10px 14px;">
          <div style="font-size:9px;letter-spacing:2px;color:${C.dorado};margin-bottom:5px;">EL HOTEL</div>
          <strong>${H.nombreLargo}</strong><br>Razón social: ${H.razonSocial}<br>NIT: ${H.nit}<br>${H.direccion}<br>${H.web}
        </div>
      </td>
      <td style="width:50%;vertical-align:top;">
        <div style="background:${C.crema};border-left:3px solid ${C.dorado};padding:10px 14px;">
          <div style="font-size:9px;letter-spacing:2px;color:${C.dorado};margin-bottom:5px;">EL CLIENTE</div>
          <strong>${esc(data.empresa || '')}</strong><br>
          Contacto: ${esc(data.contacto) || '–'}<br>
          Email: ${esc(data.email) || '–'}<br>
          Teléfono: ${esc(data.telefono) || '–'}<br>
          Tipo: ${esc(data.tipoCotizacion)}${data.referencia ? ' · Ref: ' + esc(data.referencia) : ''}
        </div>
      </td>
    </tr></table>
    <div style="margin-top:14px;border:1px solid ${C.linea};background:#FBFAF6;padding:9px 14px;font-size:8.8px;font-style:italic;line-height:1.5;">
      Este documento es únicamente una <strong>COTIZACIÓN</strong> con fines informativos. No representa confirmación de reserva ni compromiso de disponibilidad.
    </div>
    <table style="width:100%;margin-top:16px;border-collapse:collapse;font-size:10px;">
      <thead><tr style="background:${C.verde};color:#fff;">
        <th style="padding:8px 6px;text-align:center;">Item</th>
        <th style="padding:8px 6px;text-align:left;">Descripción</th>
        <th style="padding:8px 6px;text-align:center;">Cant.</th>
        <th style="padding:8px 6px;text-align:center;">Ingreso</th>
        <th style="padding:8px 6px;text-align:center;">Salida</th>
        <th style="padding:8px 6px;text-align:center;">Noches</th>
        <th style="padding:8px 6px;text-align:center;">Personas</th>
        <th style="padding:8px 6px;text-align:right;">Tarifa</th>
        <th style="padding:8px 6px;text-align:right;">Subtotal</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div style="font-size:8.8px;font-style:italic;margin-top:5px;">* Todas las tarifas de hospedaje incluyen desayuno buffet.</div>

    <table style="width:320px;margin-top:14px;margin-left:auto;font-size:11px;border-collapse:collapse;">
      <tr><td style="padding:5px 10px;">Subtotal General ${m}:</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.subtotal, m)}</td></tr>
      ${filaServ}
      <tr><td style="padding:5px 10px;">IVA (19%):</td><td style="padding:5px 10px;text-align:right;">${fmtMoneda(totales.iva, m)}</td></tr>
      <tr style="background:${C.verde};color:#fff;font-weight:bold;font-size:13px;">
        <td style="padding:9px 10px;">TOTAL ${m}:</td>
        <td style="padding:9px 10px;text-align:right;">${fmtMoneda(totales.total, m)}</td>
      </tr>
    </table>

    <div style="margin-top:16px;background:${C.verde};padding:14px 18px;border-radius:6px;text-align:center;">
      <div style="color:${C.dorado};font-size:11px;letter-spacing:3px;margin-bottom:4px;">PAGUE SU RESERVA EN LÍNEA</div>
      <a href="${H.linkPago}" style="color:#ffffff;font-size:12px;text-decoration:underline;font-weight:bold;">${H.linkPago}</a>
      <div style="color:#cfd8d2;font-size:8.5px;margin-top:4px;">Pago seguro vía Wompi · tarjeta, PSE o link</div>
    </div>

    <div style="margin-top:28px;">${firmaImg}</div>
  </div>
  <div style="background:${C.verde};padding:12px;text-align:center;border-top:3px solid ${C.dorado};">
    <span style="color:${C.dorado};font-size:10px;letter-spacing:4px;">${H.slogan}</span><br>
    <span style="color:#cfd8d2;font-size:9px;">${H.direccion}</span>
  </div>
  </body></html>`;
};

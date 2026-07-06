const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');
const { getLogoDataUri } = require('../utils/logo');

module.exports = function buildReservaHtml(data, numero, firmante = {}) {
  const C = env.colores;
  const H = env.hotel;
  const logoSrc = getLogoDataUri();
  const noches = data.noches || 1;
  const habitaciones = data.numeroHabitaciones || 1;
  const valor = parseFloat(data.valorNoche) || 0;
  const subtotal = parseFloat(data.subtotal) || valor * noches * habitaciones;
  const iva = parseFloat(data.iva) || 0;
  const total = parseFloat(data.total) || subtotal + iva;

  const firmaImg = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" style="max-height:48px;display:block;margin-bottom:4px;">`
    : '';

  const box = (label, val) => `
    <div style="background:${C.crema};border-left:3px solid ${C.dorado};padding:9px 12px;">
      <div style="font-size:8.5px;letter-spacing:2px;color:${C.dorado};margin-bottom:3px;">${label}</div>
      <div style="font-size:12px;color:${C.verde};font-weight:bold;">${val || '—'}</div>
    </div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="font-family:Georgia,'Times New Roman',serif;color:${C.grisTexto};margin:0;padding:0;">
  <div style="background:${C.verde};padding:24px 36px;border-bottom:4px solid ${C.dorado};">
    <table style="width:100%;"><tr>
      <td style="vertical-align:middle;">
        <img src="${logoSrc}" alt="V Grand Hotel" style="height:90px;width:auto;display:block;background:#fff;padding:8px;border-radius:10px;" />
      </td>
      <td style="vertical-align:middle;text-align:right;color:#fff;">
        <div style="font-size:19px;letter-spacing:3px;">CONFIRMACIÓN DE RESERVA</div>
        <div style="font-size:12px;color:${C.dorado};margin-top:4px;">N° ${esc(numero)}</div>
        <div style="font-size:10px;margin-top:8px;">Fecha emisión: ${fmtFecha(new Date())}</div>
      </td>
    </tr></table>
  </div>
  <div style="padding:24px 36px;">
    <p style="font-size:11px;line-height:1.6;text-align:justify;margin-top:0;">
      De acuerdo a tu solicitud, te envío la confirmación de la reserva
      <strong>N° ${esc(data.codigoReserva || numero)}</strong> en <strong>V GRAND HOTEL a member of Radisson Individuals</strong>,
      ubicado en la ${H.direccion}.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
        <tr><td>${box('NOMBRE TITULAR DE LA RESERVA', esc(data.titular))}</td></tr>
        <tr><td>${box('EMPRESA/AGENCIA', esc(data.empresa || 'PARTICULAR'))}</td></tr>
        <tr><td>${box('TIPO DE HABITACIÓN', esc(data.tipoHabitacion))}</td></tr>
        <tr><td>${box('NÚMERO DE HABITACIONES', habitaciones)}</td></tr>
        <tr><td>${box('NÚMERO DE HUÉSPEDES', data.numeroHuespedes)}</td></tr>
        <tr><td>${box('CÓDIGO DE RESERVA', esc(data.codigoReserva || numero))}</td></tr>
      </table>
      <table style="width:100%;border-collapse:separate;border-spacing:0 8px;">
        <tr><td>${box('FECHA DE LLEGADA (Check-in)', fmtFecha(data.fechaLlegada))}</td></tr>
        <tr><td>${box('FECHA DE SALIDA (Check-out)', fmtFecha(data.fechaSalida))}</td></tr>
        <tr><td>${box('NOCHES', noches)}</td></tr>
        <tr><td>${box('VALOR NOCHE', fmtMoneda(valor, 'COP'))}</td></tr>
        <tr><td>${box('IVA APLICA', data.aplicaIva ? 'Sí (19%)' : 'NO (Extranjero / Turista)')}</td></tr>
        <tr><td>${box('ESTADO', esc(data.estado || 'Pendiente'))}</td></tr>
      </table>
    </div>

    <div style="margin-top:16px;background:${C.crema};border:1px solid ${C.linea};padding:12px 16px;border-radius:6px;font-size:11px;">
      <div style="font-size:10px;letter-spacing:2px;color:${C.dorado};margin-bottom:4px;">VALOR TOTAL DE LA ESTADÍA</div>
      <div>${fmtMoneda(valor, 'COP')} x ${noches} noche${noches > 1 ? 's' : ''} x ${habitaciones} habitación${habitaciones > 1 ? 'es' : ''} = <strong>${fmtMoneda(subtotal, 'COP')}</strong></div>
      ${data.aplicaIva ? `<div>IVA (19%) = <strong>${fmtMoneda(iva, 'COP')}</strong></div>` : ''}
      <div style="margin-top:6px;font-size:13px;color:${C.verde};font-weight:bold;">VALOR TOTAL A PAGAR: ${fmtMoneda(total, 'COP')}${data.aplicaIva ? ' IVA incluido' : ''}</div>
      <div style="font-size:9.5px;font-style:italic;margin-top:6px;color:#7d7060;">
        NOTA: El IVA solo aplica para NACIONALES. Si no es ciudadano colombiano o residente, omita el valor del IVA.
      </div>
    </div>

    <div style="margin-top:14px;background:${C.verde};color:#fff;padding:14px 18px;border-radius:6px;text-align:center;">
      <div style="color:${C.dorado};font-size:11px;letter-spacing:3px;margin-bottom:4px;">PAGUE SU RESERVA EN LÍNEA</div>
      <a href="${H.linkPago}" style="color:#fff;font-size:12px;text-decoration:underline;font-weight:bold;">${H.linkPago}</a>
      <div style="font-size:8.5px;color:#cfd8d2;margin-top:4px;">Pago seguro vía Wompi · tarjeta, PSE o link</div>
    </div>

    <div style="margin-top:16px;font-size:9.5px;line-height:1.6;color:${C.grisTexto};">
      <div style="font-size:11px;font-weight:bold;color:${C.verde};letter-spacing:1px;margin-bottom:5px;">ACOMODACIONES</div>
      • Estudio Estándar DBL: 2 Pax · • Estudio Doble TWIN: 3 o 4 Pax · • Estudio Familiar: 2 o 3 Pax · • Estudio SUITE DBL: 2 Pax<br>
      Se acomodan en camas Dobles o Matrimonial (comparten cama).
    </div>

    <div style="margin-top:14px;font-size:10px;line-height:1.6;">
      <div style="font-size:11px;font-weight:bold;color:${C.verde};letter-spacing:1px;margin-bottom:5px;">HORARIOS</div>
      <strong>Desayuno:</strong> 6:30 a.m. – 10:30 a.m. (lun-vie) · 6:30 a.m. – 11:00 a.m. (sáb, dom y festivos)<br>
      <strong>Check-in:</strong> 15:00 todos los días (viernes 16:00) · <strong>Check-out:</strong> antes de 12:00
    </div>

    <div style="margin-top:14px;background:#FBFAF6;border:1px solid ${C.linea};padding:10px 14px;font-size:9.5px;line-height:1.6;">
      <div style="font-size:11px;font-weight:bold;color:${C.verde};margin-bottom:5px;">INFORMACIÓN IMPORTANTE</div>
      • Para cancelar la reserva, hágalo con mínimo 48 horas de anticipación; de lo contrario se cobrará la primera noche como penalidad.<br>
      • Si el huésped no se presenta el día de la reserva, se cobrará el valor de una noche de alojamiento.<br>
      • Impuesto del 19%. Todo extranjero debe pagar IVA si no tiene calidad de turista.<br>
      • Ley 1335 de 2009: prohibido fumar dentro del hotel. Penalidad de 50 USD por noche.
    </div>

    ${data.observaciones ? `<div style="margin-top:14px;font-size:10px;background:${C.crema};border-left:3px solid ${C.verde};padding:10px 14px;"><strong>Observaciones:</strong> ${esc(data.observaciones)}</div>` : ''}

    <div style="margin-top:22px;">${firmaImg}</div>
  </div>
  <div style="background:${C.verde};padding:12px;text-align:center;border-top:3px solid ${C.dorado};">
    <span style="color:${C.dorado};font-size:10px;letter-spacing:4px;">${H.slogan}</span><br>
    <span style="color:#cfd8d2;font-size:9px;">${H.razonSocial} · NIT ${H.nit} · ${H.direccion}</span>
  </div>
  </body></html>`;
};

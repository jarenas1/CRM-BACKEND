const env = require('../config/env');
const { fmtMoneda, fmtFecha, esc } = require('../utils/format');

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
      <div style="font-family:Georgia,serif;font-size:34px;color:#fff;font-style:italic;line-height:1;">V</div>
      <div style="font-family:Georgia,serif;font-size:17px;color:#fff;letter-spacing:4px;margin-top:4px;">GRAND HOTEL</div>
      <div style="font-size:10px;color:${C.dorado};letter-spacing:5px;">MEDELLÍN</div>
      <div style="font-size:8px;color:#cfd8d2;letter-spacing:2px;margin-top:5px;">${H.miembro.toUpperCase()}</div>
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

module.exports = { cotizacion, convenio, reserva, shell, botonPago };

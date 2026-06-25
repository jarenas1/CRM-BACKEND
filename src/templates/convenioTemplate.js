const env = require('../config/env');
const { fmtMoneda, fmtFecha, fmtFechaLarga, esc } = require('../utils/format');

module.exports = function buildConvenioHtml(data, numero, firmante = {}) {
  const C = env.colores;
  const H = env.hotel;
  const fecha = fmtFechaLarga(new Date());
  const vig = fmtFechaLarga(data.vigenciaHasta) || `31 de diciembre de ${new Date().getFullYear()}`;
  const pa = parseFloat(data.personaAdicional) || 120000;
  const sec = `style="font-size:11.5px;letter-spacing:1.5px;color:${C.verde};font-weight:bold;margin:16px 0 6px;border-bottom:1px solid ${C.dorado};padding-bottom:3px;"`;
  const li = 'style="margin:0 0 6px;font-size:9.8px;line-height:1.55;text-align:justify;"';
  const firmaImg = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" style="max-height:52px;max-width:200px;display:block;margin:0 auto 4px;">`
    : '<div style="height:42px;"></div>';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
  <body style="font-family:Georgia,'Times New Roman',serif;color:${C.grisTexto};margin:0;padding:0;">
  <div style="background:${C.verde};padding:24px 36px;border-bottom:4px solid ${C.dorado};">
    <table style="width:100%;"><tr>
      <td style="vertical-align:middle;">
        <div style="font-size:38px;color:#fff;font-style:italic;line-height:1;">V</div>
        <div style="font-size:19px;color:#fff;letter-spacing:3px;margin-top:4px;">GRAND HOTEL</div>
        <div style="font-size:10px;color:${C.dorado};letter-spacing:5px;">MEDELLÍN</div>
        <div style="font-size:8px;color:#cfd8d2;letter-spacing:2px;margin-top:4px;">${H.miembro.toUpperCase()}</div>
      </td>
      <td style="vertical-align:middle;text-align:right;color:#fff;">
        <div style="font-size:19px;letter-spacing:3px;">CONVENIO CORPORATIVO</div>
        <div style="font-size:12px;color:${C.dorado};margin-top:4px;">N° ${numero}</div>
        <div style="font-size:10px;margin-top:8px;">Medellín, ${fecha}</div>
      </td>
    </tr></table>
  </div>
  <div style="padding:22px 40px;">
    <div style="background:${C.crema};border-left:3px solid ${C.dorado};padding:10px 16px;font-size:10.5px;">
      <strong style="font-size:12px;">${esc(data.empresa)}</strong><br>
      ${esc(data.contacto) || ''}${data.cargo ? ' — ' + esc(data.cargo) : ''}<br>
      ${esc(data.email) || ''}
    </div>
    <p style="font-size:10.2px;line-height:1.6;margin-top:14px;text-align:justify;">
      A nombre de todo el personal operativo y staff directivo de <strong>${H.nombreLargo}</strong>,
      nos es grato presentar nuestra propuesta tarifaria con beneficios preferenciales que aplicarán entre
      <strong>${esc(data.empresa)}</strong> y ${H.nombreLargo}.
    </p>

    <table style="width:100%;margin-top:10px;border-collapse:collapse;font-size:10.5px;">
      <thead><tr style="background:${C.verde};color:#fff;">
        <th style="padding:9px;text-align:left;">Hotel</th>
        <th style="padding:9px;text-align:center;">Hab. Sencilla</th>
        <th style="padding:9px;text-align:center;">Hab. Doble</th>
        <th style="padding:9px;text-align:center;">Junior Suite</th>
      </tr></thead>
      <tbody><tr style="background:${C.crema};">
        <td style="padding:9px;border:1px solid ${C.linea};">${H.nombreLargo}</td>
        <td style="padding:9px;border:1px solid ${C.linea};text-align:center;font-weight:bold;font-size:12px;">${fmtMoneda(data.tarifaSencilla, 'COP')}</td>
        <td style="padding:9px;border:1px solid ${C.linea};text-align:center;font-weight:bold;font-size:12px;">${fmtMoneda(data.tarifaDoble, 'COP')}</td>
        <td style="padding:9px;border:1px solid ${C.linea};text-align:center;font-weight:bold;font-size:12px;">${fmtMoneda(data.tarifaSuite, 'COP')}</td>
      </tr></tbody>
    </table>
    <div style="text-align:center;margin-top:10px;font-size:11px;font-weight:bold;color:${C.verde};">Convenio vigente hasta el ${vig}</div>
    <div style="text-align:center;font-size:9px;font-style:italic;margin-top:3px;">Tarifas en pesos colombianos (COP), sujetas a impuestos al momento de la llegada.</div>
    <div style="text-align:center;font-size:9.5px;font-weight:bold;margin-top:5px;">Tarifas NO COMISIONABLES · NO INCLUYEN IMPUESTOS — considerar IVA del 19%</div>

    <div ${sec}>HORA DE REGISTRO Y SALIDA</div>
    <table style="font-size:10px;"><tr>
      <td style="padding:2px 24px 2px 0;"><strong>Entrada:</strong> ${H.checkIn}</td>
      <td><strong>Salida:</strong> ${H.checkOut}</td>
    </tr></table>

    <div ${sec}>BENEFICIOS Y SERVICIOS ESPECIALES</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}><strong>Desayuno buffet en cortesía</strong>, 6:30 a 10:30 a.m.</li>
      <li ${li}><strong>Internet de alta velocidad</strong> (cortesía).</li>
      <li ${li}><strong>Gimnasio</strong> y <strong>parqueadero</strong> en cortesía.</li>
    </ul>

    <div ${sec}>CONDICIONES GENERALES</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>Aplica para reservaciones individuales, máximo 10 habitaciones. Reservas a <strong>${H.emailVentas}</strong> con copia a <strong>${H.emailReservas}</strong>.</li>
      <li ${li}>Persona adicional: cargo de <strong>${fmtMoneda(pa, 'COP')} COP + IVA</strong>.</li>
      <li ${li}>Vigencia hasta el ${vig}; tarifas podrán modificarse notificando con 15 días de anticipación.</li>
      <li ${li}>El hotel no está obligado a aplicar estas tarifas a huéspedes sin previa reservación.</li>
    </ul>

    <div ${sec}>FORMA DE PAGO Y PAGO EN LÍNEA</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>Pago a la razón social <strong>${H.razonSocial}</strong> (NIT ${H.nit}).</li>
      <li ${li}>Pago en línea (tarjeta, PSE o link) disponible en: <strong>${H.linkPago}</strong></li>
    </ul>

    <div style="margin-top:14px;text-align:center;">
      <a href="${H.linkPago}" style="display:inline-block;background:${C.dorado};color:${C.verdeOscuro};text-decoration:none;padding:10px 26px;border-radius:6px;font-weight:bold;font-size:11px;">Pagar en línea</a>
    </div>

    ${data.fechasRestringidas ? `<div ${sec}>FECHAS RESTRINGIDAS</div><p style="font-size:9.5px;font-style:italic;margin:0;"><strong>${esc(data.fechasRestringidas)}</strong></p>` : ''}

    <div style="text-align:center;font-size:10px;margin-top:18px;letter-spacing:2px;color:${C.verde};">DE COMÚN ACUERDO</div>
    <table style="width:100%;margin-top:20px;font-size:10px;border-collapse:collapse;"><tr>
      <td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">
        ${firmaImg}
        <div style="border-top:1px solid ${C.grisTexto};padding-top:7px;">
          <strong>${esc(firmante.nombre || H.razonSocial)}</strong><br>
          ${esc(firmante.cargo || 'Director Comercial')}<br>
          ${H.nombre}<br>
          <span style="font-size:8.5px;color:${C.dorado};letter-spacing:1px;">ELABORA</span>
        </div>
      </td>
      <td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">
        <div style="height:42px;"></div>
        <div style="border-top:1px solid ${C.grisTexto};padding-top:7px;">
          <strong>${esc(data.contacto) || '________________________'}</strong><br>
          ${esc(data.cargo) || '&nbsp;'}<br>
          ${esc(data.empresa)}<br><br>
          <span style="font-size:8.5px;color:${C.dorado};letter-spacing:1px;">ACEPTA</span>
        </div>
      </td>
    </tr></table>
  </div>
  <div style="background:${C.verde};padding:12px;text-align:center;border-top:3px solid ${C.dorado};">
    <span style="color:${C.dorado};font-size:10px;letter-spacing:4px;">${H.slogan}</span><br>
    <span style="color:#cfd8d2;font-size:9px;">${H.direccion}</span>
  </div>
  </body></html>`;
};

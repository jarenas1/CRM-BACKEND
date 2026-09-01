const env = require('../config/env');
const { fmtMoneda, fmtFechaLarga, esc } = require('../utils/format');
const { CO, pdfHeader, pdfFooter, pdfWrap } = require('./brandLayout');

module.exports = function buildConvenioHtml(data, numero, firmante = {}) {
  const H = env.hotel;
  const fecha = fmtFechaLarga(new Date());
  const vig = fmtFechaLarga(data.vigenciaHasta) || `31 de diciembre de ${new Date().getFullYear()}`;
  const pa = parseFloat(data.personaAdicional) || 120000;

  const tarifas = (Array.isArray(data.tarifas) ? data.tarifas : []).filter((t) => t && t.tipo);
  const tarifaRows = tarifas.map((t, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : CO.cream;
    return `<tr style="background:${bg};">`
      + `<td style="padding:8px 12px;border:1px solid ${CO.line};">${esc(t.tipo)}</td>`
      + `<td style="padding:8px 12px;border:1px solid ${CO.line};text-align:right;font-weight:bold;">${fmtMoneda(t.valor, 'COP')}</td>`
      + '</tr>';
  }).join('');

  const sec = `style="font-family:Georgia,'Times New Roman',serif;font-size:12px;letter-spacing:1px;color:${CO.green2};text-transform:uppercase;font-weight:bold;margin:16px 0 6px;border-bottom:2px solid ${CO.brass};padding-bottom:4px;"`;
  const li = 'style="margin:0 0 6px;font-size:10px;line-height:1.55;text-align:justify;"';
  const firmaImg = firmante.firmaDataUri
    ? `<img src="${firmante.firmaDataUri}" alt="Firma" style="max-height:104px;max-width:280px;display:block;margin:0 auto 4px;border:0;">`
    : '<div style="height:42px;"></div>';

  const metaHtml = `N.° <strong style="color:${CO.green2};">${esc(numero)}</strong><br>Medellín, ${fecha}`;

  const body =
    `<div style="background:${CO.cream};border-left:3px solid ${CO.brass};padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:${CO.ink};">`
    + `<strong style="font-size:12px;">${esc(data.empresa)}</strong><br>`
    + `${esc(data.contacto) || ''}${data.cargo ? ' — ' + esc(data.cargo) : ''}<br>${esc(data.email) || ''}</div>`

    + `<p style="font-size:10.5px;line-height:1.6;margin-top:14px;text-align:justify;">`
    + `A nombre de todo el personal operativo y staff directivo de <strong>${esc(H.nombreLargo)}</strong>, `
    + `nos es grato presentar nuestra propuesta tarifaria con beneficios preferenciales que aplicarán entre `
    + `<strong>${esc(data.empresa)}</strong> y ${esc(H.nombreLargo)}.</p>`

    + `<div style="font-size:10.5px;color:${CO.muted};margin:10px 0 4px;">Tarifas preferenciales en <strong style="color:${CO.green2};">${esc(H.nombreLargo)}</strong> (COP por habitación/noche):</div>`
    + '<table style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:11px;">'
    + `<thead><tr style="background:${CO.green2};color:#fff;">`
    + '<th style="padding:9px 12px;text-align:left;">Tipo de habitación</th>'
    + '<th style="padding:9px 12px;text-align:right;">Tarifa (COP / noche)</th></tr></thead>'
    + `<tbody>${tarifaRows || `<tr><td colspan="2" style="padding:9px 12px;border:1px solid ${CO.line};text-align:center;color:${CO.muted};">Sin tarifas registradas</td></tr>`}</tbody></table>`
    + `<div style="text-align:center;margin-top:10px;font-size:11px;font-weight:bold;color:${CO.green2};">Convenio vigente hasta el ${vig}</div>`
    + `<div style="text-align:center;font-size:9.5px;font-style:italic;margin-top:3px;color:${CO.muted};">Tarifas en pesos colombianos (COP), sujetas a impuestos al momento de la llegada.</div>`
    + `<div style="text-align:center;font-size:10px;font-weight:bold;margin-top:5px;">Tarifas NO COMISIONABLES · NO INCLUYEN IMPUESTOS — considerar IVA del 19%</div>`

    + `<div ${sec}>Hora de registro y salida</div>`
    + '<table style="font-family:Arial,Helvetica,sans-serif;font-size:10.5px;"><tr>'
    + `<td style="padding:2px 24px 2px 0;"><strong>Entrada:</strong> ${esc(H.checkIn)}</td>`
    + `<td><strong>Salida:</strong> ${esc(H.checkOut)}</td></tr></table>`

    + `<div ${sec}>Beneficios y servicios especiales</div>`
    + '<p style="font-size:10px;line-height:1.55;margin:0 0 6px;text-align:justify;">Los colaboradores de su empresa podrán disfrutar durante su estancia en el hotel los siguientes servicios y beneficios:</p>'
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>Se otorga <strong>desayuno buffet en cortesía</strong>, de 6:30 a 10:30 hrs.</li>`
    + `<li ${li}><strong>Internet de alta velocidad</strong> en todas las habitaciones y áreas públicas (cortesía).</li>`
    + `<li ${li}><strong>Gimnasio</strong> en cortesía (verificar horarios y condiciones en la recepción).</li>`
    + `<li ${li}><strong>Estacionamiento</strong> en cortesía.</li></ul>`

    + `<div style="font-size:10.5px;font-weight:bold;color:${CO.green2};margin:10px 0 4px;">Servicios adicionales para el viajero de negocios:</div>`
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>Lavandería y tintorería (con costo).</li>`
    + `<li ${li}>Salas de juntas y salones (con costo).</li>`
    + `<li ${li}>Spa (con costo).</li>`
    + `<li ${li}>Restaurante 3 Generaciones (con costo).</li>`
    + `<li ${li}>Room service (con costo).</li></ul>`

    + `<div ${sec}>Condiciones generales</div>`
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>El convenio aplica para reservaciones individuales, máximo 10 habitaciones. Reservas al correo <strong>${esc(H.emailVentas)}</strong> con copia a <strong>${esc(H.emailReservas)}</strong>.</li>`
    + `<li ${li}>Persona adicional: cargo adicional de <strong>${fmtMoneda(pa, 'COP')} COP + IVA</strong>.</li>`
    + `<li ${li}>Este convenio tiene vigencia hasta el <strong>${vig}</strong>. La producción generada de cuartos noche será revisada trimestralmente; en consecuencia, las tarifas podrán ser modificadas por ${esc(H.nombreLargo)}, notificando cualquier cambio con 15 días de anticipación.</li>`
    + `<li ${li}>En caso de contingencia de fuerza mayor (pandemia, sismo, huracán, entre otros), se notificarán los destinos disponibles, canales de reservación y amenidades disponibles.</li>`
    + `<li ${li}>El hotel no está obligado a recibir ni aplicar las tarifas y políticas de este convenio a ningún huésped que se presente sin previa reservación.</li>`
    + `<li ${li}>${esc(H.nombreLargo)} podrá, en cualquier momento, terminar anticipadamente el presente contrato, bastando para ello dar aviso con 30 días naturales de anticipación a la fecha efectiva de terminación.</li>`
    + `<li ${li}>La tarifa convenio está sujeta a disponibilidad; en temporada alta (fechas restringidas) aplican restricciones y queda sujeta a garantía de pago hasta las 18:00 hrs conforme a disponibilidad del hotel.</li></ul>`

    + `<div ${sec}>Fechas restringidas</div>`
    + '<p style="font-size:10px;line-height:1.55;margin:0;text-align:justify;font-style:italic;">'
    + `${data.fechasRestringidas ? '<strong>' + esc(data.fechasRestringidas) + '</strong><br>' : ''}`
    + 'La tarifa convenio otorgada está sujeta a disponibilidad; aplican restricciones y cambios por ferias, congresos o eventos de ciudad.</p>'

    + `<div ${sec}>Políticas de pago</div>`
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>Todas las reservaciones registradas como pago en destino deberán contar con una garantía válida; el huésped deberá pagar al momento del Check-in la totalidad de la estancia (no se aceptan cheques).</li>`
    + `<li ${li}>En caso de transferencias o depósitos, el pago deberá emitirse a nombre de la razón social <strong>${esc(H.razonSocial)}</strong> (NIT ${esc(H.nit)}). Solicitar los datos bancarios al momento de reservar. Enviar copia del pago vía email al front desk del hotel con 72 horas de anticipación; de lo contrario se solicitará forma de pago al huésped. Si no se cuenta con garantía válida 24 hrs previas al Check-in, la reservación será cancelada.</li>`
    + `<li ${li}>La tarifa convenio solo aplica dentro de la vigencia de este convenio; de lo contrario se aplicará tarifa pública.</li>`
    + `<li ${li}>Pago en línea (tarjeta, PSE o link Wompi) disponible en: <strong>${esc(H.linkPago)}</strong></li></ul>`

    + '<div style="margin-top:12px;text-align:center;">'
    + `<a href="${esc(H.linkPago)}" style="display:inline-block;background:${CO.brass};color:#1c1c1c;text-decoration:none;padding:10px 26px;border-radius:6px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;font-size:11px;">Pagar en línea</a></div>`

    + `<div ${sec}>Programa de fidelidad</div>`
    + '<p style="font-size:10px;line-height:1.55;margin:0;text-align:justify;">'
    + `Consulte los beneficios del programa <strong>Choice Privileges</strong> (aplica solo para huéspedes) en el siguiente enlace: `
    + `<a href="https://www.choicehotels.com/es-us/choice-privileges" style="color:${CO.green2};">https://www.choicehotels.com/es-us/choice-privileges</a></p>`

    + `<div ${sec}>Políticas de cancelación</div>`
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>En caso de cambios o cancelación de la reserva, deberá realizarse a través del canal por el cual se realizó la reserva o en la recepción del hotel: <strong>24 hrs antes en temporada baja</strong> y <strong>72 hrs antes en temporada alta</strong>, para evitar cargos por "NO SHOW".</li>`
    + `<li ${li}>En caso de "NO SHOW", solamente se cobrará la primera noche de la estancia contratada y la estancia será cancelada sin responsabilidad para el hotel y sin necesidad de previo aviso.</li>`
    + `<li ${li}>Para reservaciones realizadas a través de GDS y OBT, en ninguna circunstancia podrán cancelarse fuera de la política antes mencionada.</li>`
    + `<li ${li}>Las reservaciones sin garantía estarán sujetas a disponibilidad y ${esc(H.nombre)} no estará obligado a hacerlas válidas. Estarán disponibles hasta las 18:00 hrs del Check-in; una vez cancelada la reservación, la tarifa convenio quedará sujeta a disponibilidad del hotel.</li></ul>`

    + `<div ${sec}>Cláusula de confidencialidad</div>`
    + `<p style="font-size:10px;line-height:1.55;margin:0;text-align:justify;">Las tarifas ofertadas por ${esc(H.nombre)} en este convenio no podrán ser utilizadas ni reveladas a terceros bajo circunstancia alguna, conservando y resguardando La Empresa la confidencialidad y secrecía de las mismas.</p>`

    + `<div ${sec}>Cláusulas de compromiso</div>`
    + '<ul style="margin:0;padding-left:18px;">'
    + `<li ${li}>La Empresa y sus subsidiarias no están autorizadas a permitir el uso a terceros de estas tarifas.</li>`
    + `<li ${li}>Este convenio podrá ser terminado anticipadamente por cualquiera de las partes, mediante comunicado por escrito a la otra parte con 15 días de anticipación, siempre y cuando no exista ningún adeudo pendiente por finiquitar por parte de La Empresa.</li>`
    + `<li ${li}>El incumplimiento de alguna de las condiciones antes mencionadas será causa de rescisión del presente convenio.</li></ul>`

    + `<div ${sec}>Declaración SAGRILAFT / PTEE</div>`
    + '<p style="font-size:9.8px;line-height:1.55;margin:0;text-align:justify;">'
    + 'Mediante la firma del presente convenio, el cliente declara que: '
    + `<strong>(i)</strong> dará estricto cumplimiento al Sistema de Autocontrol y Gestión del Riesgo Integral de Lavado de Activos y Financiación del Terrorismo (SAGRILAFT) y al Programa de Transparencia y Ética Empresarial (PTEE), implementados por <strong>${esc(H.razonSocial)}</strong>, así como a todas las políticas, procedimientos y controles derivados de dichos sistemas, conforme a la normativa colombiana vigente, incluyendo, pero sin limitarse a lo dispuesto en la Circular Básica Jurídica de la Superintendencia de Sociedades, la Ley 1778 de 2016 y la Ley 2195 de 2022; `
    + '<strong>(ii)</strong> sus recursos tienen origen lícito y no están vinculados con actividades delictivas establecidas en el Código Penal Colombiano; '
    + '<strong>(iii)</strong> no se encuentra incluido en listas vinculantes para Colombia, ni en listas restrictivas nacionales o internacionales relacionadas con la prevención y sanción del lavado de activos, la financiación del terrorismo, el financiamiento de la proliferación de armas de destrucción masiva, el soborno transnacional y/o la corrupción (LA/FT/FPADM/ST/C); '
    + '<strong>(iv)</strong> ninguno de sus socios, administradores, representantes legales, beneficiarios finales ni empleados ha sido condenado por delitos relacionados con LA/FT/FPADM/ST/C, ni por cualquiera de sus delitos fuente, ni se encuentra incluido en listas vinculantes para Colombia; y '
    + '<strong>(v)</strong> informará de inmediato cualquier situación que represente un riesgo legal, reputacional o de integridad, incluyendo procesos judiciales, inclusión en listas restrictivas o cualquier cambio relevante en su estructura societaria o financiera que pueda afectar la ejecución del contrato. '
    + `El incumplimiento de cualquiera de estas obligaciones será considerado como un incumplimiento grave, facultando a <strong>${esc(H.razonSocial)}</strong> para dar por terminado el contrato de manera unilateral y con efecto inmediato, sin perjuicio de las acciones legales que correspondan.</p>`

    + `<div style="text-align:center;font-size:11px;margin-top:22px;letter-spacing:3px;color:${CO.green2};font-weight:bold;">DE COMÚN ACUERDO</div>`
    + '<table style="width:100%;margin-top:22px;font-family:Arial,Helvetica,sans-serif;font-size:10px;border-collapse:collapse;"><tr>'
    + '<td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">'
    + `<div style="min-height:110px;">${firmaImg}</div>`
    + `<div style="border-top:1px solid ${CO.ink};padding-top:7px;"><span style="font-size:9px;color:${CO.brass};letter-spacing:2px;">ELABORA</span><br>`
    + `<strong>${esc(firmante.nombre || H.razonSocial)}</strong><br>${esc(firmante.cargo || 'Equipo Comercial')}</div></td>`
    + '<td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">'
    + '<div style="min-height:110px;"></div>'
    + `<div style="border-top:1px solid ${CO.ink};padding-top:7px;"><span style="font-size:9px;color:${CO.brass};letter-spacing:2px;">ACEPTA</span><br><br>`
    + `<strong>${esc(data.contacto) || '________________________'}</strong><br>${esc(data.cargo) || '&nbsp;'}<br><strong>${esc(data.empresa) || '&nbsp;'}</strong></div></td>`
    + '</tr></table>';

  const rows = pdfHeader({ kicker: 'Propuesta corporativa', title: 'Convenio corporativo', metaHtml })
    + `<tr><td style="padding:14px 36px 22px 36px;font-family:Georgia,'Times New Roman',serif;color:${CO.ink};">${body}</td></tr>`
    + pdfFooter();

  return pdfWrap(rows);
};

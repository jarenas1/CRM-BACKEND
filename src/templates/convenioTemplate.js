const env = require('../config/env');
const { fmtMoneda, fmtFecha, fmtFechaLarga, esc } = require('../utils/format');
const { getLogoDataUri } = require('../utils/logo');

module.exports = function buildConvenioHtml(data, numero, firmante = {}) {
  const C = env.colores;
  const H = env.hotel;
  const logoSrc = getLogoDataUri();
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
        <img src="${logoSrc}" alt="V Grand Hotel" style="height:90px;width:auto;display:block;background:#fff;padding:8px;border-radius:10px;" />
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
    <p style="font-size:9.8px;line-height:1.55;margin:0 0 6px;text-align:justify;">
      Los colaboradores de su empresa podrán disfrutar durante su estancia en el hotel los siguientes servicios y beneficios:
    </p>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>Se otorga <strong>desayuno buffet en cortesía</strong>, de 6:30 a 10:30 hrs.</li>
      <li ${li}><strong>Internet de alta velocidad</strong> en todas las habitaciones y áreas públicas (cortesía).</li>
      <li ${li}><strong>Gimnasio</strong> en cortesía (verificar horarios y condiciones en la recepción).</li>
      <li ${li}><strong>Estacionamiento</strong> en cortesía.</li>
    </ul>

    <div style="font-size:10px;font-weight:bold;color:${C.verde};margin:10px 0 4px;">Servicios adicionales para el viajero de negocios:</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>Lavandería y tintorería (con costo).</li>
      <li ${li}>Salas de juntas y salones (con costo).</li>
      <li ${li}>Spa (con costo).</li>
      <li ${li}>Restaurante 3 Generaciones (con costo).</li>
      <li ${li}>Room service (con costo).</li>
    </ul>

    <div ${sec}>CONDICIONES GENERALES</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>El convenio aplica para reservaciones individuales, máximo 10 habitaciones. Reservas al correo <strong>${H.emailVentas}</strong> con copia a <strong>${H.emailReservas}</strong>.</li>
      <li ${li}>Persona adicional: cargo adicional de <strong>${fmtMoneda(pa, 'COP')} COP + IVA</strong>.</li>
      <li ${li}>Este convenio tiene vigencia hasta el <strong>${vig}</strong>. La producción generada de cuartos noche será revisada trimestralmente; en consecuencia, las tarifas podrán ser modificadas por ${H.nombreLargo}, notificando cualquier cambio con 15 días de anticipación.</li>
      <li ${li}>En caso de contingencia de fuerza mayor (pandemia, sismo, huracán, entre otros), se notificarán los destinos disponibles, canales de reservación y amenidades disponibles.</li>
      <li ${li}>El hotel no está obligado a recibir ni aplicar las tarifas y políticas de este convenio a ningún huésped que se presente sin previa reservación.</li>
      <li ${li}>${H.nombreLargo} podrá, en cualquier momento, terminar anticipadamente el presente contrato, bastando para ello dar aviso con 30 días naturales de anticipación a la fecha efectiva de terminación.</li>
      <li ${li}>La tarifa convenio está sujeta a disponibilidad; en temporada alta (fechas restringidas) aplican restricciones y queda sujeta a garantía de pago hasta las 18:00 hrs conforme a disponibilidad del hotel.</li>
    </ul>

    <div ${sec}>FECHAS RESTRINGIDAS</div>
    <p style="font-size:9.8px;line-height:1.55;margin:0;text-align:justify;font-style:italic;">
      ${data.fechasRestringidas ? '<strong>' + esc(data.fechasRestringidas) + '</strong><br>' : ''}
      La tarifa convenio otorgada está sujeta a disponibilidad; aplican restricciones y cambios por ferias, congresos o eventos de ciudad.
    </p>

    <div ${sec}>POLÍTICAS DE PAGO</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>Todas las reservaciones registradas como pago en destino deberán contar con una garantía válida; el huésped deberá pagar al momento del Check-in la totalidad de la estancia (no se aceptan cheques).</li>
      <li ${li}>En caso de transferencias o depósitos, el pago deberá emitirse a nombre de la razón social <strong>${H.razonSocial}</strong> (NIT ${H.nit}). Solicitar los datos bancarios al momento de reservar. Enviar copia del pago vía email al front desk del hotel con 72 horas de anticipación; de lo contrario se solicitará forma de pago al huésped. Si no se cuenta con garantía válida 24 hrs previas al Check-in, la reservación será cancelada.</li>
      <li ${li}>La tarifa convenio solo aplica dentro de la vigencia de este convenio; de lo contrario se aplicará tarifa pública.</li>
      <li ${li}>Pago en línea (tarjeta, PSE o link Wompi) disponible en: <strong>${H.linkPago}</strong></li>
    </ul>

    <div style="margin-top:12px;text-align:center;">
      <a href="${H.linkPago}" style="display:inline-block;background:${C.dorado};color:${C.verdeOscuro};text-decoration:none;padding:10px 26px;border-radius:6px;font-weight:bold;font-size:11px;">Pagar en línea</a>
    </div>

    <div ${sec}>PROGRAMA DE FIDELIDAD</div>
    <p style="font-size:9.8px;line-height:1.55;margin:0;text-align:justify;">
      Consulte los beneficios del programa <strong>Choice Privileges</strong> (aplica solo para huéspedes) en el siguiente enlace:
      <a href="https://www.choicehotels.com/es-us/choice-privileges" style="color:${C.verde};">https://www.choicehotels.com/es-us/choice-privileges</a>
    </p>

    <div ${sec}>POLÍTICAS DE CANCELACIÓN</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>En caso de cambios o cancelación de la reserva, deberá realizarse a través del canal por el cual se realizó la reserva o en la recepción del hotel: <strong>24 hrs antes en temporada baja</strong> y <strong>72 hrs antes en temporada alta</strong>, para evitar cargos por "NO SHOW".</li>
      <li ${li}>En caso de "NO SHOW", solamente se cobrará la primera noche de la estancia contratada y la estancia será cancelada sin responsabilidad para el hotel y sin necesidad de previo aviso.</li>
      <li ${li}>Para reservaciones realizadas a través de GDS y OBT, en ninguna circunstancia podrán cancelarse fuera de la política antes mencionada.</li>
      <li ${li}>Las reservaciones sin garantía estarán sujetas a disponibilidad y ${H.nombre} no estará obligado a hacerlas válidas. Estarán disponibles hasta las 18:00 hrs del Check-in; una vez cancelada la reservación, la tarifa convenio quedará sujeta a disponibilidad del hotel.</li>
    </ul>

    <div ${sec}>CLÁUSULA DE CONFIDENCIALIDAD</div>
    <p style="font-size:9.8px;line-height:1.55;margin:0;text-align:justify;">
      Las tarifas ofertadas por ${H.nombre} en este convenio no podrán ser utilizadas ni reveladas a terceros bajo circunstancia alguna, conservando y resguardando La Empresa la confidencialidad y secrecía de las mismas.
    </p>

    <div ${sec}>CLÁUSULAS DE COMPROMISO</div>
    <ul style="margin:0;padding-left:18px;">
      <li ${li}>La Empresa y sus subsidiarias no están autorizadas a permitir el uso a terceros de estas tarifas.</li>
      <li ${li}>Este convenio podrá ser terminado anticipadamente por cualquiera de las partes, mediante comunicado por escrito a la otra parte con 15 días de anticipación, siempre y cuando no exista ningún adeudo pendiente por finiquitar por parte de La Empresa.</li>
      <li ${li}>El incumplimiento de alguna de las condiciones antes mencionadas será causa de rescisión del presente convenio.</li>
    </ul>

    <div ${sec}>DECLARACIÓN SAGRILAFT / PTEE</div>
    <p style="font-size:9.5px;line-height:1.55;margin:0;text-align:justify;">
      Mediante la firma del presente convenio, el cliente declara que:
      <strong>(i)</strong> dará estricto cumplimiento al Sistema de Autocontrol y Gestión del Riesgo Integral de Lavado de Activos y Financiación del Terrorismo (SAGRILAFT) y al Programa de Transparencia y Ética Empresarial (PTEE), implementados por <strong>${H.razonSocial}</strong>, así como a todas las políticas, procedimientos y controles derivados de dichos sistemas, conforme a la normativa colombiana vigente, incluyendo, pero sin limitarse a lo dispuesto en la Circular Básica Jurídica de la Superintendencia de Sociedades, la Ley 1778 de 2016 y la Ley 2195 de 2022;
      <strong>(ii)</strong> sus recursos tienen origen lícito y no están vinculados con actividades delictivas establecidas en el Código Penal Colombiano;
      <strong>(iii)</strong> no se encuentra incluido en listas vinculantes para Colombia, ni en listas restrictivas nacionales o internacionales relacionadas con la prevención y sanción del lavado de activos, la financiación del terrorismo, el financiamiento de la proliferación de armas de destrucción masiva, el soborno transnacional y/o la corrupción (LA/FT/FPADM/ST/C);
      <strong>(iv)</strong> ninguno de sus socios, administradores, representantes legales, beneficiarios finales ni empleados ha sido condenado por delitos relacionados con LA/FT/FPADM/ST/C, ni por cualquiera de sus delitos fuente, ni se encuentra incluido en listas vinculantes para Colombia; y
      <strong>(v)</strong> informará de inmediato cualquier situación que represente un riesgo legal, reputacional o de integridad, incluyendo procesos judiciales, inclusión en listas restrictivas o cualquier cambio relevante en su estructura societaria o financiera que pueda afectar la ejecución del contrato.
      El incumplimiento de cualquiera de estas obligaciones será considerado como un incumplimiento grave, facultando a <strong>${H.razonSocial}</strong> para dar por terminado el contrato de manera unilateral y con efecto inmediato, sin perjuicio de las acciones legales que correspondan.
    </p>

    <div style="text-align:center;font-size:11px;margin-top:22px;letter-spacing:3px;color:${C.verde};font-weight:bold;">DE COMÚN ACUERDO</div>
    <table style="width:100%;margin-top:22px;font-size:10px;border-collapse:collapse;"><tr>
      <td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">
        <div style="min-height:60px;">${firmaImg}</div>
        <div style="border-top:1px solid ${C.grisTexto};padding-top:7px;">
          <span style="font-size:9px;color:${C.dorado};letter-spacing:2px;">ELABORA</span>
        </div>
      </td>
      <td style="width:50%;text-align:center;padding:0 20px;vertical-align:bottom;">
        <div style="min-height:60px;"></div>
        <div style="border-top:1px solid ${C.grisTexto};padding-top:7px;">
          <span style="font-size:9px;color:${C.dorado};letter-spacing:2px;">ACEPTA</span><br><br>
          <strong>${esc(data.contacto) || '________________________'}</strong><br>
          ${esc(data.cargo) || '&nbsp;'}<br>
          <strong>${esc(data.empresa) || '&nbsp;'}</strong>
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

const leadRepo = require('../repositories/leadRepository');
const quotationRepo = require('../repositories/quotationRepository');
const agreementRepo = require('../repositories/agreementRepository');
const reservationRepo = require('../repositories/reservationRepository');
const env = require('../config/env');

function esMes(fecha) {
  if (!fecha) return false;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function diasDiff(fecha) {
  if (!fecha) return null;
  const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((hoy - d) / 86400000);
}

async function tablero(user) {
  const [leads, cots, convs, resvs] = await Promise.all([
    leadRepo.findAll(),
    quotationRepo.findAll(),
    agreementRepo.findAll(),
    reservationRepo.list({ limit: 1000 }),
  ]);
  const reservasAll = resvs.rows.map((r) => r.toJSON ? r.toJSON() : r);

  // Embudo leads
  const porEstado = {};
  env.catalogos.estadosLead.forEach((e) => { porEstado[e] = 0; });
  let nuevosMes = 0;
  let valorPipeline = 0;
  const leadTareas = [];
  leads.forEach((l) => {
    const est = l.estado || 'Nuevo';
    if (porEstado[est] !== undefined) porEstado[est]++;
    if (esMes(l.createdAt)) nuevosMes++;
    if (est !== 'Ganado' && est !== 'Perdido') {
      valorPipeline += parseFloat(l.valor) || 0;
    }
    if (l.proximaAccion && est !== 'Ganado' && est !== 'Perdido') {
      const d = diasDiff(l.proximaAccion);
      if (d !== null && d >= 0) {
        leadTareas.push({
          id: l.id,
          nombre: l.nombre || l.empresa,
          empresa: l.empresa,
          estado: est,
          proxima: l.proximaAccion,
          dias: d,
        });
      }
    }
  });
  leadTareas.sort((a, b) => b.dias - a.dias);

  // Ventas
  let cotMes = 0, convMes = 0, resMes = 0, totalCOP = 0, totalUSD = 0;
  let ganadas = 0, perdidas = 0, negociacion = 0, abiertas = 0;
  const clientes = {};
  cots.forEach((c) => {
    const estado = c.estado || 'Borrador';
    if (esMes(c.createdAt)) {
      cotMes++;
      const tot = parseFloat(c.total) || 0;
      if (c.moneda === 'USD') totalUSD += tot; else totalCOP += tot;
    }
    if (estado === 'Ganada') ganadas++;
    else if (estado === 'Perdida') perdidas++;
    else if (estado === 'En negociación') negociacion++;
    else abiertas++;
    const emp = c.empresa; if (emp) clientes[emp] = (clientes[emp] || 0) + 1;
  });
  convs.forEach((c) => {
    if (esMes(c.createdAt)) convMes++;
    const emp = c.empresa; if (emp) clientes[emp] = (clientes[emp] || 0) + 1;
  });
  reservasAll.forEach((r) => { if (esMes(r.createdAt)) resMes++; });

  const topClientes = Object.entries(clientes)
    .map(([empresa, docs]) => ({ empresa, docs }))
    .sort((a, b) => b.docs - a.docs)
    .slice(0, 5);

  const tasaConversion = (ganadas + perdidas) > 0
    ? Math.round((ganadas / (ganadas + perdidas)) * 100)
    : 0;

  // Seguimientos
  const seguimientos = [];
  const addSeg = (arr, tipo) => {
    arr.forEach((d) => {
      const estado = d.estado || '';
      if (estado === 'Ganada' || estado === 'Perdida') return;
      if (!d.proximoSeguimiento) return;
      const dias = diasDiff(d.proximoSeguimiento);
      if (dias !== null && dias >= 0) {
        seguimientos.push({
          tipo,
          numero: d.numero,
          empresa: d.empresa,
          contacto: d.contacto,
          email: d.email,
          seguimiento: d.proximoSeguimiento,
          estado,
          diasVencido: dias,
        });
      }
    });
  };
  addSeg(cots, 'COTIZACION');
  addSeg(convs, 'CONVENIO');
  seguimientos.sort((a, b) => b.diasVencido - a.diasVencido);

  // Recientes
  const recientes = [];
  cots.slice(0, 8).forEach((c) => recientes.push({
    tipo: 'COTIZACION', numero: c.numero, empresa: c.empresa,
    detalle: c.moneda + ' ' + (parseFloat(c.total) || 0).toLocaleString('es-CO'),
    estado: c.estado, fecha: c.createdAt,
  }));
  convs.slice(0, 8).forEach((c) => recientes.push({
    tipo: 'CONVENIO', numero: c.numero, empresa: c.empresa, detalle: 'Convenio',
    estado: c.estado, fecha: c.createdAt,
  }));
  reservasAll.slice(0, 8).forEach((r) => recientes.push({
    tipo: 'RESERVA', numero: r.numero, empresa: r.empresa || r.titular,
    detalle: 'COP ' + (parseFloat(r.total) || 0).toLocaleString('es-CO'),
    estado: r.estado, fecha: r.createdAt,
  }));
  recientes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return {
    rol: user.role,
    usuario: user.username,
    mes: new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    totalLeads: leads.length,
    nuevosMes,
    valorPipeline,
    funnel: env.catalogos.estadosLead.map((e) => ({ estado: e, n: porEstado[e] })),
    leadTareas: leadTareas.slice(0, 15),
    cotizacionesMes: cotMes,
    convenidosMes: convMes,
    reservasMes: resMes,
    totalCOP,
    totalUSD,
    ganadas, perdidas, negociacion, abiertas,
    tasaConversion,
    totalCotizaciones: cots.length,
    totalConvenios: convs.length,
    totalReservas: reservasAll.length,
    topClientes,
    seguimientos: seguimientos.slice(0, 15),
    recientes: recientes.slice(0, 12),
    catalogos: env.catalogos,
  };
}

module.exports = { tablero };

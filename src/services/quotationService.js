const quotationRepo = require('../repositories/quotationRepository');
const companyRepo = require('../repositories/companyRepository');
const contactRepo = require('../repositories/contactRepository');
const userRepo = require('../repositories/userRepository');
const { calcularTotalesCotizacion } = require('../utils/calc');
const { generarNumero } = require('../utils/format');
const env = require('../config/env');
const tplCot = require('../templates/cotizacionTemplate');
const tplEmail = require('../templates/emailTemplates');
const { renderHtmlToPdfBuffer } = require('./pdfService');

function mapList(q) {
  const p = q.toJSON ? q.toJSON() : q;
  return {
    id: p.id,
    numero: p.numero,
    empresa: p.empresa,
    contacto: p.contacto,
    email: p.email,
    tipoCotizacion: p.tipoCotizacion,
    moneda: p.moneda,
    subtotal: parseFloat(p.subtotal) || 0,
    impuestoServicio: parseFloat(p.impuestoServicio) || 0,
    iva: parseFloat(p.iva) || 0,
    total: parseFloat(p.total) || 0,
    estado: p.estado,
    fecha: p.createdAt,
    fechaCaducidad: p.fechaCaducidad,
    proximoSeguimiento: p.proximoSeguimiento,
    referencia: p.referencia,
    generadoPor: p.generadoPorNombre,
  };
}

async function list(opts) {
  const r = await quotationRepo.list(opts);
  return { documentos: r.rows.map(mapList), total: r.count };
}

async function search(q) {
  const r = await quotationRepo.search(q);
  return { documentos: r.map(mapList), total: r.length };
}

async function load(numero) {
  const q = await quotationRepo.findByNumero(numero);
  if (!q) throw Object.assign(new Error('No se encontró el documento ' + numero), { status: 404 });
  return q.toJSON();
}

async function create(data, user) {
  const totales = calcularTotalesCotizacion(data.items, data.moneda || 'COP');
  const count = await quotationRepo.count();
  const numero = generarNumero(env.prefijos.cotizacion, count + 1);

  // Asegura empresa y contacto en directorio
  if (data.empresa) {
    await companyRepo.ensureExists(data.empresa, data);
    await contactRepo.ensureExists({
      empresa: data.empresa,
      nombre: data.contacto,
      cargo: data.cargo,
      email: data.email,
      telefono: data.telefono,
    });
  }

  const proxSeguimiento = data.fechaCaducidad
    ? new Date(data.fechaCaducidad)
    : new Date(Date.now() + 3 * 86400000);

  const fullUser = await userRepo.findById(user.id);
  const firmante = {
    nombre: (fullUser && fullUser.name) || user.name,
    cargo: (fullUser && fullUser.cargo) || user.cargo,
    firma: fullUser && fullUser.firma,
  };

  const created = await quotationRepo.create({
    numero,
    empresa: data.empresa,
    contacto: data.contacto,
    cargo: data.cargo,
    email: data.email,
    telefono: data.telefono,
    tipoCotizacion: data.tipoCotizacion || 'Hospedaje',
    moneda: data.moneda || 'COP',
    trmReferencia: data.trmReferencia || null,
    fechaCaducidad: data.fechaCaducidad || null,
    referencia: data.referencia || null,
    items: data.items || [],
    subtotal: totales.subtotal,
    impuestoServicio: totales.servicio,
    iva: totales.iva,
    total: totales.total,
    estado: 'Borrador',
    proximoSeguimiento: proxSeguimiento,
    mensajePersonalizado: data.mensajePersonalizado || null,
    emailCC: data.emailCC || null,
    generadoPorId: user.id,
    generadoPorNombre: user.name,
  });

  return {
    ok: true,
    numero: created.numero,
    id: created.id,
    totales,
    firmante: { nombre: firmante.nombre, cargo: firmante.cargo, tieneFirma: !!firmante.firma },
  };
}

async function renderHtml(numero) {
  const q = await load(numero);
  const fullUser = q.generadoPorId ? await userRepo.findById(q.generadoPorId) : null;
  const firmante = {
    nombre: (fullUser && fullUser.name) || q.generadoPorNombre,
    cargo: fullUser && fullUser.cargo,
    firmaDataUri: fullUser && fullUser.firma,
  };
  const totales = {
    subtotal: parseFloat(q.subtotal),
    servicio: parseFloat(q.impuestoServicio),
    iva: parseFloat(q.iva),
    total: parseFloat(q.total),
  };
  return tplCot(q, q.numero, totales, firmante);
}

async function renderPdf(numero) {
  const html = await renderHtml(numero);
  return renderHtmlToPdfBuffer(html);
}

async function updateState(numero, estado, proxSeguimiento) {
  const q = await quotationRepo.findByNumero(numero);
  if (!q) return { ok: false, mensaje: 'Documento no encontrado' };
  if (estado) q.estado = estado;
  if (proxSeguimiento !== undefined) q.proximoSeguimiento = proxSeguimiento || null;
  await q.save();
  return { ok: true, mensaje: 'Estado actualizado' };
}

async function emailPreview(data) {
  const totales = calcularTotalesCotizacion(data.items, data.moneda || 'COP');
  return tplEmail.cotizacion(data, data.numero || 'PREVIEW', totales, {
    nombre: data.firmanteNombre, cargo: data.firmanteCargo, firmaDataUri: data.firmaDataUri,
  });
}

module.exports = { list, search, load, create, renderHtml, renderPdf, updateState, emailPreview };

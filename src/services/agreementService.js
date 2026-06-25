const agreementRepo = require('../repositories/agreementRepository');
const companyRepo = require('../repositories/companyRepository');
const contactRepo = require('../repositories/contactRepository');
const userRepo = require('../repositories/userRepository');
const { generarNumero } = require('../utils/format');
const env = require('../config/env');
const tplCnv = require('../templates/convenioTemplate');
const tplEmail = require('../templates/emailTemplates');
const { renderHtmlToPdfBuffer } = require('./pdfService');

function mapList(a) {
  const p = a.toJSON ? a.toJSON() : a;
  return {
    id: p.id,
    numero: p.numero,
    empresa: p.empresa,
    contacto: p.contacto,
    email: p.email,
    tarifaSencilla: parseFloat(p.tarifaSencilla) || 0,
    tarifaDoble: parseFloat(p.tarifaDoble) || 0,
    tarifaSuite: parseFloat(p.tarifaSuite) || 0,
    estado: p.estado,
    vigenciaHasta: p.vigenciaHasta,
    fecha: p.createdAt,
    proximoSeguimiento: p.proximoSeguimiento,
    generadoPor: p.generadoPorNombre,
  };
}

async function list(opts) {
  const r = await agreementRepo.list(opts);
  return { documentos: r.rows.map(mapList), total: r.count };
}

async function search(q) {
  const r = await agreementRepo.search(q);
  return { documentos: r.map(mapList), total: r.length };
}

async function load(numero) {
  const a = await agreementRepo.findByNumero(numero);
  if (!a) throw Object.assign(new Error('No se encontró el convenio ' + numero), { status: 404 });
  return a.toJSON();
}

async function create(data, user) {
  const count = await agreementRepo.count();
  const numero = generarNumero(env.prefijos.convenio, count + 1);

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

  const created = await agreementRepo.create({
    numero,
    empresa: data.empresa,
    contacto: data.contacto,
    cargo: data.cargo,
    email: data.email,
    telefono: data.telefono,
    tarifaSencilla: data.tarifaSencilla || 0,
    tarifaDoble: data.tarifaDoble || 0,
    tarifaSuite: data.tarifaSuite || 0,
    personaAdicional: data.personaAdicional || 120000,
    vigenciaHasta: data.vigenciaHasta || null,
    fechasRestringidas: data.fechasRestringidas || null,
    estado: 'Borrador',
    proximoSeguimiento: new Date(Date.now() + 30 * 86400000),
    mensajePersonalizado: data.mensajePersonalizado || null,
    emailCC: data.emailCC || null,
    generadoPorId: user.id,
    generadoPorNombre: user.name,
  });

  return { ok: true, numero: created.numero, id: created.id };
}

async function renderHtml(numero) {
  const a = await load(numero);
  const fullUser = a.generadoPorId ? await userRepo.findById(a.generadoPorId) : null;
  const firmante = {
    nombre: (fullUser && fullUser.name) || a.generadoPorNombre,
    cargo: fullUser && fullUser.cargo,
    firmaDataUri: fullUser && fullUser.firma,
  };
  return tplCnv(a, a.numero, firmante);
}

async function renderPdf(numero) {
  const html = await renderHtml(numero);
  return renderHtmlToPdfBuffer(html);
}

async function updateState(numero, estado, proxSeguimiento) {
  const a = await agreementRepo.findByNumero(numero);
  if (!a) return { ok: false, mensaje: 'Convenio no encontrado' };
  if (estado) a.estado = estado;
  if (proxSeguimiento !== undefined) a.proximoSeguimiento = proxSeguimiento || null;
  await a.save();
  return { ok: true, mensaje: 'Estado actualizado' };
}

async function emailPreview(data) {
  return tplEmail.convenio(data, data.numero || 'PREVIEW', {
    nombre: data.firmanteNombre, cargo: data.firmanteCargo, firmaDataUri: data.firmaDataUri,
  });
}

module.exports = { list, search, load, create, renderHtml, renderPdf, updateState, emailPreview };

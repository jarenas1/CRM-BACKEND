const reservationRepo = require('../repositories/reservationRepository');
const userRepo = require('../repositories/userRepository');
const { calcularTotalesReserva } = require('../utils/calc');
const { generarNumero } = require('../utils/format');
const env = require('../config/env');
const tplRes = require('../templates/reservaTemplate');
const tplEmail = require('../templates/emailTemplates');
const { renderHtmlToPdfBuffer } = require('./pdfService');

function calcularNoches(llegada, salida) {
  if (!llegada || !salida) return 1;
  const d = Math.round((new Date(salida) - new Date(llegada)) / 86400000);
  return d > 0 ? d : 1;
}

function mapList(r) {
  const p = r.toJSON ? r.toJSON() : r;
  return {
    id: p.id,
    numero: p.numero,
    codigoReserva: p.codigoReserva,
    titular: p.titular,
    empresa: p.empresa,
    email: p.email,
    telefono: p.telefono,
    tipoHabitacion: p.tipoHabitacion,
    numeroHabitaciones: p.numeroHabitaciones,
    numeroHuespedes: p.numeroHuespedes,
    noches: p.noches,
    fechaLlegada: p.fechaLlegada,
    fechaSalida: p.fechaSalida,
    valorNoche: parseFloat(p.valorNoche) || 0,
    subtotal: parseFloat(p.subtotal) || 0,
    iva: parseFloat(p.iva) || 0,
    total: parseFloat(p.total) || 0,
    aplicaIva: p.aplicaIva,
    estado: p.estado,
    observaciones: p.observaciones,
    fecha: p.createdAt,
    generadoPor: p.generadoPorNombre,
  };
}

async function list(opts) {
  const r = await reservationRepo.list(opts);
  return { documentos: r.rows.map(mapList), total: r.count };
}

async function search(q) {
  const r = await reservationRepo.search(q);
  return { documentos: r.map(mapList), total: r.length };
}

async function load(numero) {
  const r = await reservationRepo.findByNumero(numero);
  if (!r) throw Object.assign(new Error('No se encontró la reserva ' + numero), { status: 404 });
  return r.toJSON();
}

async function create(data, user) {
  const noches = data.noches || calcularNoches(data.fechaLlegada, data.fechaSalida);
  const totales = calcularTotalesReserva(
    data.valorNoche,
    noches,
    data.numeroHabitaciones || 1,
    data.aplicaIva !== false,
  );
  const count = await reservationRepo.count();
  const numero = generarNumero(env.prefijos.reserva, count + 1);

  const created = await reservationRepo.create({
    numero,
    codigoReserva: data.codigoReserva || ('R' + Date.now().toString().slice(-9)),
    titular: data.titular,
    empresa: data.empresa || 'PARTICULAR',
    email: data.email || null,
    telefono: data.telefono || null,
    tipoHabitacion: data.tipoHabitacion,
    numeroHabitaciones: data.numeroHabitaciones || 1,
    numeroHuespedes: data.numeroHuespedes || 1,
    noches,
    fechaLlegada: data.fechaLlegada,
    fechaSalida: data.fechaSalida,
    valorNoche: parseFloat(data.valorNoche) || 0,
    aplicaIva: data.aplicaIva !== false,
    subtotal: totales.subtotal,
    iva: totales.iva,
    total: totales.total,
    estado: data.estado || 'Pendiente',
    observaciones: data.observaciones || null,
    generadoPorId: user.id,
    generadoPorNombre: user.name,
  });

  return { ok: true, numero: created.numero, id: created.id, totales };
}

async function update(id, data) {
  const r = await reservationRepo.findById(id);
  if (!r) return { ok: false, mensaje: 'Reserva no encontrada' };
  const camposPermitidos = [
    'titular', 'empresa', 'email', 'telefono', 'tipoHabitacion',
    'numeroHabitaciones', 'numeroHuespedes', 'fechaLlegada', 'fechaSalida',
    'valorNoche', 'aplicaIva', 'estado', 'observaciones', 'codigoReserva',
  ];
  camposPermitidos.forEach((k) => { if (data[k] !== undefined) r[k] = data[k]; });
  r.noches = data.noches || calcularNoches(r.fechaLlegada, r.fechaSalida);
  const totales = calcularTotalesReserva(r.valorNoche, r.noches, r.numeroHabitaciones, r.aplicaIva);
  r.subtotal = totales.subtotal;
  r.iva = totales.iva;
  r.total = totales.total;
  await r.save();
  return { ok: true, mensaje: 'Reserva actualizada' };
}

async function updateState(numero, estado) {
  const r = await reservationRepo.findByNumero(numero);
  if (!r) return { ok: false, mensaje: 'Reserva no encontrada' };
  r.estado = estado;
  await r.save();
  return { ok: true, mensaje: 'Estado actualizado' };
}

async function renderHtml(numero) {
  const r = await load(numero);
  const fullUser = r.generadoPorId ? await userRepo.findById(r.generadoPorId) : null;
  const firmante = {
    nombre: (fullUser && fullUser.name) || r.generadoPorNombre,
    cargo: fullUser && fullUser.cargo,
    firmaDataUri: fullUser && fullUser.firma,
  };
  return tplRes(r, r.numero, firmante);
}

async function renderPdf(numero) {
  const html = await renderHtml(numero);
  return renderHtmlToPdfBuffer(html);
}

async function emailPreview(data) {
  return tplEmail.reserva(data, data.numero || 'PREVIEW', {
    nombre: data.firmanteNombre, cargo: data.firmanteCargo, firmaDataUri: data.firmaDataUri,
  });
}

module.exports = { list, search, load, create, update, updateState, renderHtml, renderPdf, emailPreview };

const { Op } = require('sequelize');
const leadRepo = require('../repositories/leadRepository');
const interactionRepo = require('../repositories/interactionRepository');
const { Lead, User } = require('../models');

function mapLead(l) {
  const plain = l.toJSON ? l.toJSON() : l;
  return {
    id: plain.id,
    tipo: plain.tipo,
    nombre: plain.nombre,
    empresa: plain.empresa,
    cargo: plain.cargo,
    email: plain.email,
    telefono: plain.telefono,
    ciudad: plain.ciudad,
    origen: plain.origen,
    interes: plain.interes,
    estado: plain.estado,
    valor: parseFloat(plain.valor) || 0,
    proximaAccion: plain.proximaAccion,
    notas: plain.notas,
    asignadoId: plain.asignadoId,
    asignado: plain.asignado ? plain.asignado.name || plain.asignado.username : '',
    asignadoUsername: plain.asignado ? plain.asignado.username : '',
    creador: plain.creador ? plain.creador.name || plain.creador.username : '',
    creacion: plain.createdAt,
    actualizacion: plain.updatedAt,
    interacciones: plain.interacciones || [],
  };
}

async function list(filtros, user) {
  const f = { ...(filtros || {}) };
  // Si no es admin, solo ve los suyos
  if (user && user.role !== 'admin' && !f.asignadoId) {
    f.asignadoId = user.id;
  }
  const ls = await leadRepo.list(f);
  return ls.map(mapLead);
}

async function getOne(id, user) {
  const l = await leadRepo.findById(id);
  if (!l) throw Object.assign(new Error('Lead no encontrado'), { status: 404 });
  if (user && user.role !== 'admin' && l.asignadoId !== user.id) {
    throw Object.assign(new Error('No tienes acceso a este lead'), { status: 403 });
  }
  const inter = await interactionRepo.listByLead(id);
  const m = mapLead(l);
  m.interacciones = inter;
  return m;
}

async function findDuplicates(data) {
  const conditions = [];
  if (data.email) conditions.push({ email: { [Op.iLike]: data.email } });
  if (data.telefono) conditions.push({ telefono: { [Op.iLike]: data.telefono } });
  if (data.empresa) conditions.push({ empresa: { [Op.iLike]: data.empresa } });
  if (data.nombre && !data.empresa) conditions.push({ nombre: { [Op.iLike]: data.nombre } });
  if (!conditions.length) return [];
  const rows = await Lead.findAll({
    where: { [Op.or]: conditions },
    include: [{ model: User, as: 'asignado', attributes: ['id', 'username', 'name'] }],
    limit: 5,
  });
  return rows.map(mapLead);
}

async function checkDuplicate(data) {
  const duplicates = await findDuplicates(data);
  return { duplicados: duplicates };
}

async function create(data, user) {
  if (!(data.nombre || '').trim() && !(data.empresa || '').trim()) {
    return { ok: false, mensaje: 'Ingresa al menos un nombre o empresa' };
  }
  // Verifica duplicado si no se forzó
  if (!data.forzar) {
    const dups = await findDuplicates(data);
    if (dups.length) {
      return {
        ok: false,
        duplicado: true,
        mensaje: 'Ya existe un lead similar',
        duplicados: dups,
      };
    }
  }
  const lead = await leadRepo.create({
    tipo: data.tipo || 'Empresa',
    nombre: data.nombre || null,
    empresa: data.empresa || null,
    cargo: data.cargo || null,
    email: data.email || null,
    telefono: data.telefono || null,
    ciudad: data.ciudad || null,
    origen: data.origen || 'Otro',
    interes: data.interes || 'Hospedaje',
    estado: data.estado || 'Nuevo',
    valor: parseFloat(data.valor) || 0,
    proximaAccion: data.proximaAccion || null,
    notas: data.notas || null,
    asignadoId: data.asignadoId || user.id,
    creadorId: user.id,
  });
  await interactionRepo.create({
    leadId: lead.id,
    tipo: 'Nota',
    descripcion: 'Lead creado' + (data.origen ? ' · Origen: ' + data.origen : '') + (data.forzar ? ' (creado tras advertencia de duplicado)' : ''),
    usuarioId: user.id,
    usuarioNombre: user.name,
  });
  return { ok: true, mensaje: 'Lead creado', id: lead.id };
}

async function update(id, data, user) {
  const l = await leadRepo.findById(id);
  if (!l) return { ok: false, mensaje: 'Lead no encontrado' };
  if (user.role !== 'admin' && l.asignadoId !== user.id) {
    return { ok: false, mensaje: 'No puedes editar leads de otros usuarios' };
  }
  const camposPermitidos = [
    'tipo', 'nombre', 'empresa', 'cargo', 'email', 'telefono', 'ciudad',
    'origen', 'interes', 'estado', 'proximaAccion', 'notas',
  ];
  camposPermitidos.forEach((k) => { if (data[k] !== undefined) l[k] = data[k]; });
  if (data.valor !== undefined) l.valor = parseFloat(data.valor) || 0;
  // Solo admin puede reasignar
  if (data.asignadoId !== undefined && user.role === 'admin') l.asignadoId = data.asignadoId;
  await l.save();
  return { ok: true, mensaje: 'Lead actualizado' };
}

async function changeState(id, estado, nota, user) {
  const l = await leadRepo.findById(id);
  if (!l) return { ok: false, mensaje: 'Lead no encontrado' };
  if (user.role !== 'admin' && l.asignadoId !== user.id) {
    return { ok: false, mensaje: 'No puedes editar leads de otros usuarios' };
  }
  const anterior = l.estado;
  l.estado = estado;
  await l.save();
  await interactionRepo.create({
    leadId: id,
    tipo: 'Nota',
    descripcion: `Estado: ${anterior} → ${estado}${nota ? ' · ' + nota : ''}`,
    usuarioId: user.id,
    usuarioNombre: user.name,
  });
  return { ok: true, mensaje: `Estado actualizado a "${estado}"` };
}

async function remove(id) {
  await leadRepo.remove(id);
  return { ok: true, mensaje: 'Lead eliminado' };
}

async function assign(id, asignadoId, user) {
  const l = await leadRepo.findById(id);
  if (!l) return { ok: false, mensaje: 'Lead no encontrado' };
  const nuevo = await User.findByPk(asignadoId);
  l.asignadoId = asignadoId;
  await l.save();
  await interactionRepo.create({
    leadId: id,
    tipo: 'Nota',
    descripcion: 'Lead reasignado a ' + (nuevo ? nuevo.name : asignadoId),
    usuarioId: user.id,
    usuarioNombre: user.name,
  });
  return { ok: true, mensaje: 'Lead reasignado' };
}

async function addInteraction(data, user) {
  const l = await leadRepo.findById(data.leadId);
  if (!l) return { ok: false, mensaje: 'Lead no encontrado' };
  if (user.role !== 'admin' && l.asignadoId !== user.id) {
    return { ok: false, mensaje: 'No puedes interactuar con leads de otros usuarios' };
  }
  await interactionRepo.create({
    leadId: data.leadId,
    tipo: data.tipo || 'Nota',
    descripcion: data.descripcion || '',
    resultado: data.resultado || null,
    usuarioId: user.id,
    usuarioNombre: user.name,
  });
  if (data.proximaAccion !== undefined && data.leadId) {
    l.proximaAccion = data.proximaAccion || null;
    await l.save();
  }
  return { ok: true, mensaje: 'Interacción registrada' };
}

module.exports = { list, getOne, create, update, changeState, remove, assign, addInteraction, checkDuplicate, mapLead };

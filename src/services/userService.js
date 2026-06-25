const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/userRepository');

function publicProfile(u) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    email: u.email || '',
    role: u.role,
    cargo: u.cargo || '',
    telefono: u.telefono || '',
    tieneFirma: !!u.firma,
    firmaUrl: u.firma || '',
    active: u.active,
    lastLogin: u.lastLogin,
  };
}

async function list() {
  const users = await userRepo.findAll();
  return users.map(publicProfile);
}

async function listAssignable() {
  return userRepo.findActive();
}

async function getMyProfile(userId) {
  const u = await userRepo.findById(userId);
  if (!u) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  return publicProfile(u);
}

async function updateMyProfile(userId, data) {
  const u = await userRepo.findById(userId);
  if (!u) return { ok: false, mensaje: 'Usuario no encontrado' };
  if (data.name !== undefined) u.name = data.name;
  if (data.email !== undefined) u.email = data.email;
  if (data.cargo !== undefined) u.cargo = data.cargo;
  if (data.telefono !== undefined) u.telefono = data.telefono;
  await u.save();
  return { ok: true, mensaje: 'Perfil actualizado', user: publicProfile(u) };
}

async function uploadSignature(userId, dataUri) {
  if (!dataUri) return { ok: false, mensaje: 'No se recibió la imagen' };
  const u = await userRepo.findById(userId);
  if (!u) return { ok: false, mensaje: 'Usuario no encontrado' };
  u.firma = dataUri;
  await u.save();
  return { ok: true, mensaje: 'Firma guardada', url: dataUri };
}

async function deleteSignature(userId) {
  const u = await userRepo.findById(userId);
  if (!u) return { ok: false, mensaje: 'Usuario no encontrado' };
  u.firma = null;
  await u.save();
  return { ok: true, mensaje: 'Firma eliminada' };
}

async function create(data) {
  if (!data.username || !data.password) {
    return { ok: false, mensaje: 'Usuario y contraseña son obligatorios' };
  }
  if (data.password.length < 6) {
    return { ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
  }
  const exists = await userRepo.findByUsername(data.username);
  if (exists) return { ok: false, mensaje: 'Ese usuario ya existe' };
  const passwordHash = await bcrypt.hash(data.password, 10);
  const u = await userRepo.create({
    username: data.username.trim(),
    name: data.name || data.username,
    email: data.email || null,
    role: data.role === 'admin' ? 'admin' : 'ejecutivo',
    cargo: data.cargo || null,
    telefono: data.telefono || null,
    passwordHash,
    active: true,
  });
  return { ok: true, mensaje: 'Usuario creado', user: publicProfile(u) };
}

async function update(id, data) {
  const u = await userRepo.findById(id);
  if (!u) return { ok: false, mensaje: 'Usuario no encontrado' };
  if (data.name !== undefined) u.name = data.name;
  if (data.email !== undefined) u.email = data.email;
  if (data.cargo !== undefined) u.cargo = data.cargo;
  if (data.telefono !== undefined) u.telefono = data.telefono;
  if (data.role !== undefined) u.role = data.role === 'admin' ? 'admin' : 'ejecutivo';
  if (data.active !== undefined) u.active = !!data.active;
  if (data.password) {
    if (data.password.length < 6) return { ok: false, mensaje: 'Mínimo 6 caracteres en contraseña' };
    u.passwordHash = await bcrypt.hash(data.password, 10);
  }
  await u.save();
  return { ok: true, mensaje: 'Usuario actualizado', user: publicProfile(u) };
}

module.exports = {
  list,
  listAssignable,
  getMyProfile,
  updateMyProfile,
  uploadSignature,
  deleteSignature,
  create,
  update,
  publicProfile,
};

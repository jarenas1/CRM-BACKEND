const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/userRepository');
const jwtUtil = require('../utils/jwt');

async function login(username, password) {
  if (!username || !password) {
    return { ok: false, mensaje: 'Usuario y contraseña son obligatorios' };
  }
  const user = await userRepo.findByUsername(username.trim());
  if (!user) return { ok: false, mensaje: 'Usuario o contraseña incorrectos' };
  if (!user.active) return { ok: false, mensaje: 'Usuario inactivo. Contacta al administrador.' };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, mensaje: 'Usuario o contraseña incorrectos' };

  user.lastLogin = new Date();
  await user.save();

  const token = jwtUtil.sign({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    cargo: user.cargo || '',
  });
  return {
    ok: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      cargo: user.cargo || '',
      telefono: user.telefono || '',
      tieneFirma: !!user.firma,
    },
  };
}

async function changePassword(userId, actual, nueva) {
  if (!nueva || nueva.length < 6) {
    return { ok: false, mensaje: 'La nueva contraseña debe tener al menos 6 caracteres' };
  }
  const user = await userRepo.findById(userId);
  if (!user) return { ok: false, mensaje: 'Usuario no encontrado' };
  const valid = await bcrypt.compare(actual, user.passwordHash);
  if (!valid) return { ok: false, mensaje: 'La contraseña actual no es correcta' };
  user.passwordHash = await bcrypt.hash(nueva, 10);
  await user.save();
  return { ok: true, mensaje: 'Contraseña actualizada' };
}

module.exports = { login, changePassword };

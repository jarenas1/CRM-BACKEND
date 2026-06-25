const authService = require('../services/authService');
const env = require('../config/env');

async function login(req, res) {
  const { username, password } = req.body || {};
  const r = await authService.login(username, password);
  if (!r.ok) return res.status(401).json(r);
  res.json({ ...r, catalogos: env.catalogos, hotel: env.hotel, colores: env.colores });
}

async function changePassword(req, res) {
  const { actual, nueva } = req.body || {};
  const r = await authService.changePassword(req.user.id, actual, nueva);
  res.status(r.ok ? 200 : 400).json(r);
}

function me(req, res) {
  res.json({ ok: true, user: req.user, catalogos: env.catalogos, hotel: env.hotel, colores: env.colores });
}

module.exports = { login, changePassword, me };

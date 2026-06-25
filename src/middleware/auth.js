const jwtUtil = require('../utils/jwt');

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  let token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  // Permite token vía query (?token=...) para enlaces directos: PDFs, previews, descargas
  if (!token && req.query && req.query.token) token = String(req.query.token);
  if (!token) return res.status(401).json({ ok: false, mensaje: 'Token requerido' });
  try {
    req.user = jwtUtil.verify(token);
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, mensaje: 'Sesión inválida o expirada' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, mensaje: 'Acción solo para administradores' });
  }
  next();
}

module.exports = { authRequired, adminRequired };

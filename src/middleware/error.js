function notFound(req, res) {
  res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado' });
}

function errorHandler(err, req, res, _next) {
  console.error('[ERROR]', err);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    mensaje: err.message || 'Error interno del servidor',
  });
}

module.exports = { notFound, errorHandler };

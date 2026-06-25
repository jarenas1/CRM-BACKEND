const reservationService = require('../services/reservationService');

async function list(req, res) {
  const limit = parseInt(req.query.limit || '30', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  res.json(await reservationService.list({ limit, offset }));
}

async function search(req, res) {
  res.json(await reservationService.search(req.query.q || ''));
}

async function load(req, res) {
  res.json(await reservationService.load(req.params.numero));
}

async function create(req, res) {
  res.json(await reservationService.create(req.body, req.user));
}

async function update(req, res) {
  res.json(await reservationService.update(req.params.id, req.body));
}

async function updateState(req, res) {
  res.json(await reservationService.updateState(req.params.numero, req.body.estado));
}

async function renderHtml(req, res) {
  res.type('html').send(await reservationService.renderHtml(req.params.numero));
}

async function renderPdf(req, res) {
  const pdf = await reservationService.renderPdf(req.params.numero);
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `inline; filename="${req.params.numero}.pdf"`);
  res.send(pdf);
}

async function emailPreview(req, res) {
  res.json({ html: await reservationService.emailPreview(req.body) });
}

module.exports = { list, search, load, create, update, updateState, renderHtml, renderPdf, emailPreview };

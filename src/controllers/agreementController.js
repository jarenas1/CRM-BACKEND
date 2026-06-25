const agreementService = require('../services/agreementService');

async function list(req, res) {
  const limit = parseInt(req.query.limit || '30', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  res.json(await agreementService.list({ limit, offset }));
}

async function search(req, res) {
  res.json(await agreementService.search(req.query.q || ''));
}

async function load(req, res) {
  res.json(await agreementService.load(req.params.numero));
}

async function create(req, res) {
  res.json(await agreementService.create(req.body, req.user));
}

async function updateState(req, res) {
  res.json(await agreementService.updateState(req.params.numero, req.body.estado, req.body.proximoSeguimiento));
}

async function renderHtml(req, res) {
  res.type('html').send(await agreementService.renderHtml(req.params.numero));
}

async function renderPdf(req, res) {
  const pdf = await agreementService.renderPdf(req.params.numero);
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `inline; filename="${req.params.numero}.pdf"`);
  res.send(pdf);
}

async function emailPreview(req, res) {
  res.json({ html: await agreementService.emailPreview(req.body) });
}

module.exports = { list, search, load, create, updateState, renderHtml, renderPdf, emailPreview };

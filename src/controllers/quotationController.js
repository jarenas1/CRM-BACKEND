const quotationService = require('../services/quotationService');

async function list(req, res) {
  const limit = parseInt(req.query.limit || '30', 10);
  const offset = parseInt(req.query.offset || '0', 10);
  res.json(await quotationService.list({ limit, offset }));
}

async function search(req, res) {
  res.json(await quotationService.search(req.query.q || ''));
}

async function load(req, res) {
  res.json(await quotationService.load(req.params.numero));
}

async function create(req, res) {
  res.json(await quotationService.create(req.body, req.user));
}

async function updateState(req, res) {
  res.json(await quotationService.updateState(req.params.numero, req.body.estado, req.body.proximoSeguimiento));
}

async function renderHtml(req, res) {
  const html = await quotationService.renderHtml(req.params.numero);
  res.type('html').send(html);
}

async function renderPdf(req, res) {
  const pdf = await quotationService.renderPdf(req.params.numero);
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `inline; filename="${req.params.numero}.pdf"`);
  res.send(pdf);
}

async function emailPreview(req, res) {
  res.json({ html: await quotationService.emailPreview(req.body) });
}

module.exports = { list, search, load, create, updateState, renderHtml, renderPdf, emailPreview };

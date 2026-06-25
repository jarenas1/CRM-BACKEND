const leadService = require('../services/leadService');

async function list(req, res) {
  res.json(await leadService.list(req.query, req.user));
}

async function getOne(req, res) {
  res.json(await leadService.getOne(req.params.id, req.user));
}

async function checkDuplicate(req, res) {
  res.json(await leadService.checkDuplicate(req.body));
}

async function create(req, res) {
  const r = await leadService.create(req.body, req.user);
  if (r.duplicado) return res.status(409).json(r);
  res.json(r);
}

async function update(req, res) {
  res.json(await leadService.update(req.params.id, req.body, req.user));
}

async function changeState(req, res) {
  res.json(await leadService.changeState(req.params.id, req.body.estado, req.body.nota, req.user));
}

async function remove(req, res) {
  res.json(await leadService.remove(req.params.id));
}

async function assign(req, res) {
  res.json(await leadService.assign(req.params.id, req.body.asignadoId, req.user));
}

async function addInteraction(req, res) {
  res.json(await leadService.addInteraction({ ...req.body, leadId: req.params.id }, req.user));
}

module.exports = { list, getOne, create, update, changeState, remove, assign, addInteraction, checkDuplicate };

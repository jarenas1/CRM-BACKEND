const companyService = require('../services/companyService');

async function listDirectory(req, res) {
  res.json(await companyService.listDirectory(req.query.busqueda));
}

async function listNames(req, res) {
  res.json(await companyService.listNames());
}

async function create(req, res) {
  res.json(await companyService.create(req.body));
}

async function update(req, res) {
  res.json(await companyService.update(req.params.id, req.body));
}

async function importAsLead(req, res) {
  res.json(await companyService.importAsLead(req.params.id, req.user));
}

module.exports = { listDirectory, listNames, create, update, importAsLead };

const userService = require('../services/userService');

async function list(req, res) {
  res.json(await userService.list());
}

async function listAssignable(req, res) {
  res.json(await userService.listAssignable());
}

async function myProfile(req, res) {
  res.json(await userService.getMyProfile(req.user.id));
}

async function updateMyProfile(req, res) {
  res.json(await userService.updateMyProfile(req.user.id, req.body));
}

async function uploadSignature(req, res) {
  res.json(await userService.uploadSignature(req.user.id, req.body.dataUri));
}

async function deleteSignature(req, res) {
  res.json(await userService.deleteSignature(req.user.id));
}

async function create(req, res) {
  res.json(await userService.create(req.body));
}

async function update(req, res) {
  res.json(await userService.update(req.params.id, req.body));
}

module.exports = { list, listAssignable, myProfile, updateMyProfile, uploadSignature, deleteSignature, create, update };

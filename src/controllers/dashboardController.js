const dashboardService = require('../services/dashboardService');

async function tablero(req, res) {
  res.json(await dashboardService.tablero(req.user));
}

module.exports = { tablero };

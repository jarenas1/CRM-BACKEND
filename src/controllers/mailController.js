const mailService = require('../services/mailService');

async function verify(req, res) {
  try {
    const r = await mailService.verify();
    res.json({ ok: true, ...r });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: e.message });
  }
}

async function sendQuotation(req, res) {
  try {
    const r = await mailService.sendQuotation({
      numero: req.params.numero,
      user: req.user,
      extraCc: req.body.cc,
      mensajePersonalizado: req.body.mensaje,
    });
    res.json({ ok: true, mensaje: 'Cotización enviada por correo', ...r });
  } catch (e) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
}

async function sendAgreement(req, res) {
  try {
    const r = await mailService.sendAgreement({
      numero: req.params.numero,
      user: req.user,
      extraCc: req.body.cc,
      mensajePersonalizado: req.body.mensaje,
    });
    res.json({ ok: true, mensaje: 'Convenio enviado por correo', ...r });
  } catch (e) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
}

async function sendReservation(req, res) {
  try {
    const r = await mailService.sendReservation({
      numero: req.params.numero,
      user: req.user,
      extraCc: req.body.cc,
      mensajePersonalizado: req.body.mensaje,
    });
    res.json({ ok: true, mensaje: 'Reserva enviada por correo', ...r });
  } catch (e) {
    res.status(400).json({ ok: false, mensaje: e.message });
  }
}

module.exports = { verify, sendQuotation, sendAgreement, sendReservation };

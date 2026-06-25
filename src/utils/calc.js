const env = require('../config/env');

function calcularTotalesCotizacion(items, moneda) {
  let subtotal = 0;
  let baseServicio = 0;
  (items || []).forEach((it) => {
    const st = (parseFloat(it.cantidad) || 0) * (parseFloat(it.noches) || 1) * (parseFloat(it.tarifa) || 0);
    subtotal += st;
    const incluyeServicio = it.aplicaServicio || env.itemsConServicio.includes(it.descripcion);
    if (incluyeServicio) baseServicio += st;
  });
  const servicio = baseServicio * env.impuestoServicio;
  const iva = subtotal * env.iva;
  const total = subtotal + servicio + iva;
  const round = (n) => (moneda === 'USD' ? Math.round(n * 100) / 100 : Math.round(n));
  return {
    subtotal: round(subtotal),
    servicio: round(servicio),
    iva: round(iva),
    total: round(total),
  };
}

function calcularTotalesReserva(valorNoche, noches, habitaciones, aplicaIva) {
  const v = parseFloat(valorNoche) || 0;
  const n = parseInt(noches, 10) || 1;
  const h = parseInt(habitaciones, 10) || 1;
  const subtotal = v * n * h;
  const iva = aplicaIva ? Math.round(subtotal * env.iva) : 0;
  const total = subtotal + iva;
  return {
    subtotal: Math.round(subtotal),
    iva: Math.round(iva),
    total: Math.round(total),
  };
}

module.exports = { calcularTotalesCotizacion, calcularTotalesReserva };

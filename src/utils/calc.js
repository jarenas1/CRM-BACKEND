const env = require('../config/env');

function calcularTotalesCotizacion(items, moneda) {
  let subtotal = 0;
  let baseServicio = 0;
  let baseIva = 0;
  let baseImpoconsumo = 0;
  (items || []).forEach((it) => {
    const st = (parseFloat(it.cantidad) || 0) * (parseFloat(it.noches) || 1) * (parseFloat(it.tarifa) || 0);
    subtotal += st;
    // Impuesto de servicio (10%) — por ítem (o auto para ítems de A&B).
    const incluyeServicio = it.aplicaServicio || env.itemsConServicio.includes(it.descripcion);
    if (incluyeServicio) baseServicio += st;
    // IVA (19%) — condicional por ítem. Por compatibilidad, si el ítem no trae
    // el flag definido, se asume que aplica (comportamiento anterior).
    if (it.aplicaIva === undefined ? true : !!it.aplicaIva) baseIva += st;
    // Impoconsumo (8%) — condicional por ítem (por defecto no aplica).
    if (it.aplicaImpoconsumo) baseImpoconsumo += st;
  });
  const servicio = baseServicio * env.impuestoServicio;
  const iva = baseIva * env.iva;
  const impoconsumo = baseImpoconsumo * env.impoconsumo;
  const total = subtotal + servicio + iva + impoconsumo;
  const round = (n) => (moneda === 'USD' ? Math.round(n * 100) / 100 : Math.round(n));
  return {
    subtotal: round(subtotal),
    servicio: round(servicio),
    iva: round(iva),
    impoconsumo: round(impoconsumo),
    total: round(total),
  };
}

function calcularTotalesReserva(valorNoche, noches, habitaciones, aplicaIva, aplicaImpoconsumo) {
  const v = parseFloat(valorNoche) || 0;
  const n = parseInt(noches, 10) || 1;
  const h = parseInt(habitaciones, 10) || 1;
  const subtotal = v * n * h;
  const iva = aplicaIva ? Math.round(subtotal * env.iva) : 0;
  const impoconsumo = aplicaImpoconsumo ? Math.round(subtotal * env.impoconsumo) : 0;
  const total = Math.round(subtotal) + iva + impoconsumo;
  return {
    subtotal: Math.round(subtotal),
    iva,
    impoconsumo,
    total,
  };
}

module.exports = { calcularTotalesCotizacion, calcularTotalesReserva };

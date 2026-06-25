function fmtMoneda(n, moneda) {
  n = parseFloat(n) || 0;
  if (moneda === 'USD') {
    return 'USD $' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '$' + Math.round(n).toLocaleString('es-CO');
}

function fmtFecha(f) {
  if (!f) return '';
  const d = f instanceof Date ? f : new Date(f);
  if (isNaN(d.getTime())) return String(f);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtFechaLarga(f) {
  if (!f) return '';
  const d = f instanceof Date ? f : new Date(f);
  if (isNaN(d.getTime())) return String(f);
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function esc(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generarNumero(prefijo, secuencia) {
  const year = new Date().getFullYear();
  return `${prefijo}-${year}-${String(secuencia).padStart(4, '0')}`;
}

module.exports = { fmtMoneda, fmtFecha, fmtFechaLarga, esc, generarNumero };

/**
 * Renderiza HTML a PDF con Puppeteer manteniendo todos los estilos
 * (backgrounds, fuentes, imágenes embebidas como data URIs, etc.).
 *
 * Antes existía un fallback a PDFKit que descartaba el HTML y solo
 * imprimía texto plano — eso producía PDFs sin estilos y ocultaba
 * problemas reales de Puppeteer. Se eliminó a propósito: si Puppeteer
 * falla se lanza el error para que quede visible en logs.
 */
const puppeteer = require('puppeteer');

async function renderHtmlToPdfBuffer(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
    });
    return Buffer.isBuffer(pdf) ? pdf : Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

module.exports = { renderHtmlToPdfBuffer };

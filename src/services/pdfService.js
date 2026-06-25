/**
 * Renderiza HTML a PDF.
 * Estrategia: intenta Puppeteer (alta fidelidad). Si no está disponible
 * en el entorno (sin Chromium, serverless, etc.) cae a un PDF generado
 * con PDFKit como respaldo simple.
 */
let puppeteer = null;
try { puppeteer = require('puppeteer'); } catch (e) { /* sin puppeteer */ }
const PDFDocument = require('pdfkit');

async function renderHtmlToPdfBuffer(html) {
  if (puppeteer) {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', right: '12mm', bottom: '14mm', left: '12mm' },
      });
      await browser.close();
      return pdf;
    } catch (e) {
      console.warn('Puppeteer falló, usando PDFKit fallback:', e.message);
    }
  }
  return renderFallbackPdf(html);
}

function renderFallbackPdf(html) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    const text = html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>(?!\n)/gi, '\n')
      .replace(/<\/(p|div|tr|li|h\d|table)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
    doc.fontSize(11).text(text, { width: 515 });
    doc.end();
  });
}

module.exports = { renderHtmlToPdfBuffer };

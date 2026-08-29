const fs = require('fs');
const path = require('path');

const cache = {};

function loadDataUri(file, mime) {
  if (cache[file] !== undefined) return cache[file];
  try {
    const p = path.join(__dirname, '..', 'assets', file);
    const b = fs.readFileSync(p);
    cache[file] = `data:${mime};base64,${b.toString('base64')}`;
  } catch (e) {
    cache[file] = '';
  }
  return cache[file];
}

// Logo histórico (JPG) — se conserva para plantillas antiguas
function getLogoDataUri() {
  return loadDataUri('logo.jpg', 'image/jpeg');
}

// Logo principal V Grand Hotel Medellín (PNG con fondo transparente)
function getMainLogoDataUri() {
  return loadDataUri('logo-vgrand.png', 'image/png');
}

// Sello "Member of Radisson Individuals" (PNG con fondo transparente)
function getRadissonLogoDataUri() {
  return loadDataUri('logo-radisson.png', 'image/png');
}

// Versiones en BLANCO (letras blancas, fondo transparente) para fondos oscuros
function getMainLogoWhiteDataUri() {
  return loadDataUri('logo-vgrand-white.png', 'image/png');
}

function getRadissonLogoWhiteDataUri() {
  return loadDataUri('logo-radisson-white.png', 'image/png');
}

function assetPath(file) {
  return path.join(__dirname, '..', 'assets', file);
}

// CIDs (Content-ID) para incrustar los logos como adjuntos inline en correos.
// Se usan como <img src="cid:..."> y evitan el "clipping" de Gmail (>102KB de HTML)
// y los problemas de render de las imágenes base64 en clientes de correo.
const LOGO_CID = {
  vgrandWhite: 'logo-vgrand-white',
  radissonWhite: 'logo-radisson-white',
};

// Adjuntos inline (nodemailer) con los logos blancos para fondos oscuros.
function whiteLogoInlineAttachments() {
  return [
    {
      filename: 'logo-vgrand-white.png',
      path: assetPath('logo-vgrand-white.png'),
      cid: LOGO_CID.vgrandWhite,
      contentDisposition: 'inline',
    },
    {
      filename: 'logo-radisson-white.png',
      path: assetPath('logo-radisson-white.png'),
      cid: LOGO_CID.radissonWhite,
      contentDisposition: 'inline',
    },
  ];
}

module.exports = {
  getLogoDataUri,
  getMainLogoDataUri,
  getRadissonLogoDataUri,
  getMainLogoWhiteDataUri,
  getRadissonLogoWhiteDataUri,
  assetPath,
  LOGO_CID,
  whiteLogoInlineAttachments,
};

const fs = require('fs');
const path = require('path');

let cachedDataUri = null;

function getLogoDataUri() {
  if (cachedDataUri) return cachedDataUri;
  try {
    const p = path.join(__dirname, '..', 'assets', 'logo.jpg');
    const b = fs.readFileSync(p);
    cachedDataUri = `data:image/jpeg;base64,${b.toString('base64')}`;
  } catch (e) {
    cachedDataUri = '';
  }
  return cachedDataUri;
}

module.exports = { getLogoDataUri };

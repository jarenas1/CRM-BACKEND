const { join } = require('path');

/**
 * Guarda el Chrome descargado dentro del proyecto (`./.cache/puppeteer`)
 * en lugar del `$HOME/.cache/puppeteer` por defecto. En Render el HOME
 * no se persiste entre la etapa de build y la de runtime, por eso Chrome
 * "desaparece" al arrancar la app. Con esta ruta el binario queda dentro
 * del árbol del proyecto y sobrevive el despliegue.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require('node:path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
  defaultProduct: 'chrome',
  temporaryDirectory: join(__dirname, '.tmp', 'puppeteer'),
};

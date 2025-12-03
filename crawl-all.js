const crawlThermo = require('./scrapers/thermo');
const crawlBD = require('./scrapers/bd');
const crawlBiolegend = require('./scrapers/biolegend');

const cache = {};

async function runCrawl({ vendor, target, species, laser, debug = false, useCache = true }) {
  const key = `${vendor}-${target}-${species}-${laser}`.toLowerCase();

  if (useCache && cache[key]) {
    if (debug) console.log(`[CACHE HIT] ${key}`);
    return cache[key];
  }

  if (debug) console.log(`[SCRAPE] ${key}`);

  let result = { rows: [], total: 0 };

  try {
    switch (vendor.toLowerCase()) {
      case 'thermo':
        result = await crawlThermo({ target, species, laser, debug });
        break;
      case 'bd':
        result = await crawlBD({ target, species, laser, debug });
        break;
      case 'biolegend':
        result = await crawlBiolegend({ target, species, laser, debug });
        break;
      default:
        throw new Error(`Unknown vendor: ${vendor}`);
    }

    result.total = result.rows?.length || 0;
    cache[key] = result;
    return result;

  } catch (err) {
    console.error(`[ERROR] ${vendor} scraper failed: ${err.message}`);
    throw err;
  }
}

module.exports = runCrawl;


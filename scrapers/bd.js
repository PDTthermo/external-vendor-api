const playwright = require('playwright');

const laserFacetMap = {
  uv: 'Ultraviolet 355 nm',
  violet: 'Violet 405 nm',
  blue: 'Blue 488 nm',
  yellowgreen: 'Yellow-Green 561 nm',
  red: 'Red 633 nm'
};

async function crawlBD({ target, species, laser, debug }) {
  const laserFacet = laserFacetMap[laser.toLowerCase()] || '';
  const query = encodeURIComponent(target);
  const speciesFacet = encodeURIComponent(species);
  const laserEncoded = encodeURIComponent(laserFacet);

  const url = `https://www.bdbiosciences.com/en-us/search-results?searchKey=${query}&speciesReactivity_facet_ss::%22${speciesFacet}%22=%22${speciesFacet}%22&applicationName_facet_ss::%22Flow%20cytometry%22=%22Flow%20cytometry%22&excitationSource_facet_s::%22${laserEncoded}%22=%22${laserEncoded}%22`;

  if (debug) console.log(`[BD] URL: ${url}`);

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  const rows = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.pdp-search-card__body-text'));
    return cards.map(card => {
      const catalog = card.querySelector('.pdp-search-card__layout-row .col-9')?.textContent?.trim();
      const sizeLabel = Array.from(card.querySelectorAll('.pdp-search-card__layout-row')).find(el =>
        el.textContent.includes('Size:')
      );
      const size = sizeLabel?.querySelector('.col-9')?.textContent?.trim();
      const price = parseFloat(
        card.querySelector('.pdp-search-card__price-label')?.textContent?.replace(/[^\d.]/g, '')
      );

      return {
        catalog,
        size,
        price,
        vendor: 'bd',
        target: 'CD4',
        species: 'Mouse',
        laser: 'uv'
      };
    }).filter(row => row.catalog && row.price);
  });

  await browser.close();

  return { rows };
}

module.exports = crawlBD;

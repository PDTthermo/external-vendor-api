const playwright = require('playwright');

const laserFacetMap = {
  uv: '355+nm+(Ultraviolet)',
  violet: '405+nm+(Violet)',
  blue: '488+nm+(Blue)',
  yellowgreen: '561+nm+(Yellow-Green)',
  red: '633+nm+(Red)'
};

async function crawlThermo({ target, species, laser, debug }) {
  const laserFacet = laserFacetMap[laser.toLowerCase()] || '';
  const url = `https://www.thermofisher.com/antibody/primary/query/${target}/filter/application/Flow+Cytometry/species/${species}/compatibility/${laserFacet}`;

  if (debug) console.log(`[THERMO] URL: ${url}`);

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  const rows = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.product-card'));

    return cards.map(card => {
      const catalog = card.querySelector('[data-sku]')?.getAttribute('data-sku')?.trim();
      const size = card.querySelector('.product-card__size')?.textContent?.trim();
      const price = parseFloat(
        card.querySelector('.spcl-offr-value, .price-amount')?.textContent?.replace(/[^\d.]/g, '')
      );

      return {
        catalog,
        size,
        price,
        vendor: 'thermo',
        target: 'CD4',
        species: 'Mouse',
        laser: 'uv'
      };
    }).filter(row => row.catalog);
  });

  await browser.close();

  return { rows };
}

module.exports = crawlThermo;

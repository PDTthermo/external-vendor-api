const playwright = require('playwright');

const laserFacetMap = {
  uv: 'ultravioletlaser',
  violet: 'violetlaser',
  blue: 'bluelaser',
  yellowgreen: 'yellowgreenlaser',
  red: 'redlaser'
};

async function crawlBiolegend({ target, species, laser, debug }) {
  const laserFacet = laserFacetMap[laser.toLowerCase()] || '';
  const query = encodeURIComponent(target);
  const speciesFacet = encodeURIComponent(species);

  const url = `https://www.biolegend.com/en-us/search-results?Applications=FC&ExcitationLaser=${laserFacet}&Keywords=${query}&Reactivity=${speciesFacet}&PageSize=25`;

  if (debug) console.log(`[BIOLEGEND] URL: ${url}`);

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  const rows = await page.evaluate(() => {
    const forms = Array.from(document.querySelectorAll('form.add-to-cart'));

    return forms.map(form => {
      const catalog = form.querySelector('div:nth-child(1)')?.textContent?.trim();
      const size = form.querySelector('div:nth-child(2)')?.textContent?.trim();
      const price = parseFloat(
        form.querySelector('[itemprop=price]')?.textContent?.replace(/[^\d.]/g, '')
      );

      return {
        catalog,
        size,
        price,
        vendor: 'biolegend',
        target: 'CD4',
        species: 'Mouse',
        laser: 'uv'
      };
    }).filter(row => row.catalog && row.price);
  });

  await browser.close();

  return { rows };
}

module.exports = crawlBiolegend;

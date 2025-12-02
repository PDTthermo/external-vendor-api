const fs = require("fs");
const path = require("path");

// Simulated scraper functions
async function scrapeThermo(target, species, laser) {
  return {
    vendor: "thermo",
    rows: [
      {
        target,
        species,
        laser,
        catalog: "Q10092",
        size: "100 µg",
        price: 624.0
      }
    ]
  };
}

async function scrapeBioLegend(target, species, laser) {
  return {
    vendor: "biolegend",
    rows: [
      {
        target,
        species,
        laser,
        catalog: "100491",
        size: "25 µg",
        price: 143.0
      },
      {
        target,
        species,
        laser,
        catalog: "100492",
        size: "100 µg",
        price: 370.0
      }
    ]
  };
}

async function scrapeBD(target, species, laser) {
  return {
    vendor: "bd",
    rows: [
      {
        target,
        species,
        laser,
        catalog: "741461",
        size: "50 µg",
        price: 398.0
      }
    ]
  };
}

async function runAllScrapers() {
  const targets = ["CD4", "CD3"]; // Add more
  const speciesList = ["Mouse", "Human"];
  const lasers = ["uv", "violet", "blue"];

  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

  for (const target of targets) {
    for (const species of speciesList) {
      for (const laser of lasers) {
        const thermo = await scrapeThermo(target, species, laser);
        const biolegend = await scrapeBioLegend(target, species, laser);
        const bd = await scrapeBD(target, species, laser);

        fs.writeFileSync(
          path.join(dataDir, `thermo-${target}-${species}-${laser}.json`),
          JSON.stringify(thermo, null, 2)
        );
        fs.writeFileSync(
          path.join(dataDir, `biolegend-${target}-${species}-${laser}.json`),
          JSON.stringify(biolegend, null, 2)
        );
        fs.writeFileSync(
          path.join(dataDir, `bd-${target}-${species}-${laser}.json`),
          JSON.stringify(bd, null, 2)
        );
      }
    }
  }

  console.log("Scraping done!");
}

runAllScrapers();
`

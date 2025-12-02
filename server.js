const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve scraped JSON from /data
app.use("/data", express.static(path.join(__dirname, "data")));

app.get("/", (req, res) => {
  res.send("Antibody API is live!");
});

// Compare endpoint (simple version)
app.get("/compare", async (req, res) => {
  const { target, species, laser } = req.query;

  if (!target || !species || !laser) {
    return res.status(400).json({ error: "target, species, and laser required" });
  }

  const vendors = ["bd", "biolegend", "thermo"];
  let combined = [];

  for (const vendor of vendors) {
    const filePath = path.join(__dirname, "data", `${vendor}-${target}-${species}-${laser}.json`);
    if (fs.existsSync(filePath)) {
      const vendorData = JSON.parse(fs.readFileSync(filePath));
      combined = combined.concat(
        vendorData.rows.map((r) => ({ ...r, vendor }))
      );
    }
  }

  res.json({ total: combined.length, rows: combined });
});

// Match by catalog number
app.post("/match-catalog", (req, res) => {
  const { catalogNumbers } = req.body;
  if (!Array.isArray(catalogNumbers)) {
    return res.status(400).json({ error: "catalogNumbers must be an array" });
  }

  const vendorFiles = fs.readdirSync(path.join(__dirname, "data")).filter(f => f.endsWith(".json"));
  const matches = [];

  for (const file of vendorFiles) {
    const filePath = path.join(__dirname, "data", file);
    const data = JSON.parse(fs.readFileSync(filePath));
    for (const row of data.rows) {
      if (catalogNumbers.includes(row.catalog)) {
        matches.push({ ...row, source: file });
      }
    }
  }

  res.json({ total: matches.length, matches });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

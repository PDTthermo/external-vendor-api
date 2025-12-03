const express = require('express');
const fs = require('fs');
const path = require('path');
const runCrawl = require('./crawl-all');
const app = express();
const PORT = process.env.PORT || 1000;

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Antibody API is live!');
});

// Endpoint: /compare — uses static files from /data
app.get('/compare', async (req, res) => {
  const { vendor, target, species, laser } = req.query;
  if (!vendor || !target || !species || !laser) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  const filename = `${vendor}-${target}-${species}-${laser}.json`.replace(/\s+/g, '');
  const filepath = path.join(__dirname, 'data', filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'No data file found', file: filename });
  }

  try {
    const file = fs.readFileSync(filepath, 'utf8');
    const rows = JSON.parse(file);
    return res.json({ total: rows.length, rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read file', details: err.message });
  }
});

// Endpoint: /table — performs live scraping
app.get('/table', async (req, res) => {
  const { vendor, target, species, laser, debug, nocache } = req.query;
  if (!vendor || !target || !species || !laser) {
    return res.status(400).json({ error: 'Missing query parameters' });
  }

  try {
    const result = await runCrawl({
      vendor,
      target,
      species,
      laser,
      debug: debug === '1',
      useCache: nocache !== '1', // true unless nocache=1
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ── PROXY CLAUDE ──────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  const { apiKey, ...body } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Clé Claude manquante' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY APOLLO ──────────────────────────────────────
app.post('/api/apollo', async (req, res) => {
  const { apiKey, ...body } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Clé Apollo manquante' });

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, ...body })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY GOOGLE PAGESPEED ────────────────────────────
app.get('/api/pagespeed', async (req, res) => {
  const { apiKey, url } = req.query;
  if (!apiKey || !url) return res.status(400).json({ error: 'Paramètres manquants' });

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${url}&key=${apiKey}&category=PERFORMANCE&strategy=mobile`
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SERVE APP ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ ProspectX Pro démarré sur le port ${PORT}`));

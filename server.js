const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── PROXY GROQ ────────────────────────────────────────
app.post('/api/groq', async (req, res) => {
  const { apiKey, system, messages, max_tokens } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Clé Groq manquante' });
  try {
    const groqMessages = [];
    if (system) groqMessages.push({ role: 'system', content: system });
    groqMessages.push(...messages);
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: max_tokens || 4000,
        temperature: 0.3
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY APOLLO (vraies entreprises) ────────────────
app.post('/api/apollo/search', async (req, res) => {
  const { apiKey, sector, city, nb } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Clé Apollo manquante' });
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
     body: JSON.stringify({
  api_key: apiKey,
  q_keywords: sector,
  q_organization_locations: city ? [city + ', France'] : ['France'],
  page: 1,
  per_page: nb || 8
})
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PROXY APOLLO CONTACTS ─────────────────────────────
app.post('/api/apollo/contacts', async (req, res) => {
  const { apiKey, organizationId } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Clé Apollo manquante' });
  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: apiKey,
        organization_ids: [organizationId],
        person_titles: ['directeur', 'gérant', 'CEO', 'fondateur', 'président', 'manager'],
        page: 1,
        per_page: 1
      })
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('✅ ProspectX Pro démarré port ' + PORT));

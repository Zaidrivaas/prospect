const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ── API GOUV.FR (vraies entreprises françaises) ───────
app.post('/api/entreprises', async (req, res) => {
  try {
    const { sector, city, nb } = req.body;
    const q = encodeURIComponent(sector);
    const commune = city ? `&commune=${encodeURIComponent(city)}` : '';
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=${nb || 8}${commune}&etat_administratif=A`);
    const data = await r.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── APOLLO (site web + contacts) ─────────────────────
app.post('/api/apollo', async (req, res) => {
  try {
    const { apiKey, companyName } = req.body;
    const r = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        q_organization_name: companyName,
        page: 1,
        per_page: 1
      })
    });
    const data = await r.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GOOGLE PAGESPEED ──────────────────────────────────
app.get('/api/pagespeed', async (req, res) => {
  try {
    const { apiKey, url } = req.query;
    const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${url}&key=${apiKey}&category=PERFORMANCE&strategy=mobile`);
    const data = await r.json();
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── GROQ IA ───────────────────────────────────────────
app.post('/api/groq', async (req, res) => {
  try {
    const { apiKey, system, messages, max_tokens } = req.body;
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: msgs, max_tokens: max_tokens || 2000 })
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, () => console.log('✅ ProspectX Pro démarré'));

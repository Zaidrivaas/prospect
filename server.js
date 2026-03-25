const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Plateformes amateurs à cibler
const PLATFORMS = [
  { domain: 'wixsite.com', name: 'Wix' },
  { domain: 'wordpress.com', name: 'WordPress.com' },
  { domain: 'jimdo.com', name: 'Jimdo' },
  { domain: 'jimdosite.com', name: 'Jimdo' },
  { domain: 'webnode.fr', name: 'Webnode' },
  { domain: 'weebly.com', name: 'Weebly' },
  { domain: 'e-monsite.com', name: 'E-monsite' },
  { domain: 'sitew.com', name: 'SiteW' },
  { domain: 'over-blog.com', name: 'Over-blog' },
  { domain: 'site123.me', name: 'Site123' },
];

// CHERCHE DIRECTEMENT LES SITES AMATEURS VIA GOOGLE
app.post('/api/searchamateur', async (req, res) => {
  try {
    const { sector, city, googleKey, searchEngineId, nb } = req.body;
    const allResults = [];
    const seen = new Set();

    // Pour chaque plateforme, cherche les entreprises du secteur
    for (const platform of PLATFORMS) {
      if (allResults.length >= nb) break;

      const query = encodeURIComponent(
        `${sector} ${city || 'France'} site:${platform.domain}`
      );

      const r = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${searchEngineId}&q=${query}&num=5`
      );
      const data = await r.json();
      const items = data.items || [];

      for (const item of items) {
        if (allResults.length >= nb) break;
        const url = item.link || '';
        const title = item.title || '';
        const snippet = item.snippet || '';
        const domain = url.replace('https://','').replace('http://','').split('/')[0].toLowerCase();

        if (!seen.has(domain)) {
          seen.add(domain);
          allResults.push({
            nom: title.replace(/\s*[-|–].*$/, '').trim(),
            website: domain,
            platformName: platform.name,
            snippet: snippet,
            url: url
          });
        }
      }
    }

    res.json({ results: allResults });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CHERCHE AUSSI LES ENTREPRISES SANS SITE via API Gouv
app.post('/api/entreprises', async (req, res) => {
  try {
    const { sector, city, nb } = req.body;
    const q = encodeURIComponent(sector);
    const commune = city ? `&commune=${encodeURIComponent(city)}` : '';
    const page = Math.floor(Math.random() * 8) + 1;
    const r = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=${nb}&page=${page}${commune}&etat_administratif=A`
    );
    const data = await r.json();
    if (!data.results || data.results.length < 2) {
      const r2 = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=${nb}&page=1${commune}&etat_administratif=A`
      );
      return res.json(await r2.json());
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GOOGLE PAGESPEED
app.get('/api/pagespeed', async (req, res) => {
  try {
    const { apiKey, url } = req.query;
    const r = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://${url}&key=${apiKey}&category=PERFORMANCE&strategy=mobile`
    );
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GROQ IA
app.post('/api/groq', async (req, res) => {
  try {
    const { apiKey, system, messages, max_tokens } = req.body;
    const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: msgs, max_tokens: max_tokens || 500 })
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(process.env.PORT || 3000, () => console.log('✅ ProspectX Pro démarré'))
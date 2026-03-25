const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const AMATEUR_PLATFORMS = [
  'wordpress.com', 'wixsite.com', 'wix.com', 'jimdo.com', 'jimdosite.com',
  'webnode.fr', 'webnode.com', 'site123.me', 'weebly.com', 'squarespace.com',
  'blogger.com', 'blogspot.com', 'free.fr', 'e-monsite.com', 'sitew.com',
  'kazeo.com', 'eklablog.com', 'over-blog.com', 'canalblog.com', 'unblog.fr'
];

// API GOUV.FR - avec pagination aléatoire pour varier les résultats
app.post('/api/entreprises', async (req, res) => {
  try {
    const { sector, city, nb } = req.body;
    const q = encodeURIComponent(sector);
    const commune = city ? `&commune=${encodeURIComponent(city)}` : '';
    // Page aléatoire entre 1 et 5 pour varier les résultats
    const page = Math.floor(Math.random() * 5) + 1;
    const perPage = Math.min(nb || 10, 25);
    const r = await fetch(
      `https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=${perPage}&page=${page}${commune}&etat_administratif=A`
    );
    const data = await r.json();
    // Si pas assez de résultats sur cette page, prendre la page 1
    if (!data.results || data.results.length < 3) {
      const r2 = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=${perPage}&page=1${commune}&etat_administratif=A`
      );
      return res.json(await r2.json());
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GOOGLE CUSTOM SEARCH
app.post('/api/findsite', async (req, res) => {
  try {
    const { companyName, city, googleKey, searchEngineId } = req.body;
    const query = encodeURIComponent(`"${companyName}" ${city} site officiel`);
    const r = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${searchEngineId}&q=${query}&num=3`
    );
    const data = await r.json();
    const items = data.items || [];
    let website = null;
    let isAmateur = false;
    let platformName = null;

    for (const item of items) {
      const url = item.link || '';
      const domain = url.replace('https://','').replace('http://','').split('/')[0].toLowerCase();
      const amateurPlatform = AMATEUR_PLATFORMS.find(p => domain.includes(p));
      if (amateurPlatform) {
        website = domain;
        isAmateur = true;
        platformName = amateurPlatform;
        break;
      }
      if (!website && domain &&
        !domain.includes('facebook') && !domain.includes('google') &&
        !domain.includes('linkedin') && !domain.includes('pages-jaunes') &&
        !domain.includes('societe.com') && !domain.includes('verif.com') &&
        !domain.includes('pappers') && !domain.includes('infogreffe') &&
        !domain.includes('youtube') && !domain.includes('instagram')) {
        website = domain;
      }
    }
    res.json({ website, isAmateur, platformName });
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

app.listen(process.env.PORT || 3000, () => console.log('✅ ProspectX Pro démarré'));

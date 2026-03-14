# ProspectX Pro 🤖

Agent de prospection web IA — HOT LEADS automatiques

## Déploiement gratuit sur Railway (5 minutes)

### Étape 1 — Créer un compte Railway
Vas sur **railway.app** → Sign up with GitHub (gratuit)

### Étape 2 — Déployer le projet
1. Clique sur **"New Project"**
2. Clique sur **"Deploy from GitHub repo"**
3. Upload ce dossier ou connecte GitHub

### Autre option — Render.com
1. Vas sur **render.com**
2. New → Web Service
3. Upload le projet
4. Build Command : `npm install`
5. Start Command : `npm start`

## Utilisation
1. Ouvre le lien donné par Railway/Render
2. Entre tes clés API (Claude, Apollo, Google)
3. Lance la recherche !

## Clés API nécessaires
- **Claude** : console.anthropic.com → API Keys
- **Apollo** : app.apollo.io → Settings → API Keys  
- **Google PageSpeed** : console.cloud.google.com → APIs → PageSpeed Insights API

## Structure
```
prospectx/
├── server.js        # Serveur proxy Node.js
├── package.json     # Dépendances
└── public/
    └── index.html   # Application web
```

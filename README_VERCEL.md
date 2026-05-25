# Déploiement Vercel

Instructions rapides pour déployer ce projet sur Vercel:

- Framework: Static (Vite)
- Commande de build: `npm run build`
- Dossier de sortie: `dist`

Étapes:
1. Liez ce dépôt à Vercel (via le tableau de bord Vercel).
2. Dans les paramètres du projet Vercel, définissez les variables d'environnement nécessaires (par ex. `OPENROUTER_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `N8N_API_KEY`).
3. Vercel détectera `vercel.json` et exécutera `npm run build`, puis servira `dist`.

Remarques:
- Ne commitez pas de secrets dans le dépôt; utilisez les variables d'environnement de Vercel.
- Pour tester localement: `npm run build` puis `npm run preview`.

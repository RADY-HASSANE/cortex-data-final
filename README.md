<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/08e3b128-85b5-452e-be88-2f087ea33f5e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a local env file from `.env.example` and set your keys in [.env.local](.env.local):

   - `OPENROUTER_API_KEY` — OpenRouter API key (or other model provider key)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` — Supabase project URL and anon key
   - `N8N_API_KEY` — n8n API key (if used by workflows)
3. Run the app:
   `npm run dev`

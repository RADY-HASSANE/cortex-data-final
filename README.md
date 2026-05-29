




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

# Split Bill OCR App (uctenkovnik.kopernici.cz)

## Architecture
- `frontend/` — Vite + React + TypeScript SPA, deployed to GitHub Pages on push to main
- `backend/` — DigitalOcean Serverless Functions (Node.js), 4 functions in `split-bill` package

## Commands
- `cd frontend && npm run build` — build frontend
- `doctl serverless deploy .` — deploy backend functions (run from `backend/`)
- `doctl serverless activations list --limit 10` — check recent function invocations
- `doctl serverless functions list` — list deployed functions
- Frontend auto-deploys via GitHub Actions on push to main

## Gotchas
- DO Functions has a **1MB body size limit** for web actions — base64 image payloads must stay under this
- Browser shows raw "Failed to fetch" TypeError when DO rejects oversized payloads (no CORS headers on 413)
- `VITE_API_BASE` is set in `.github/workflows/deploy-frontend.yml` at build time
- DO Functions `environment` + `${VAR}` in `project.yml` does NOT reliably inject env vars — use `parameters` with literal values instead
- DO Functions platform adds CORS headers (`*`) automatically for web functions — manual CORS in function code is redundant
- Base64-encoded Google credentials contain literal newlines in `private_key` — must escape before `JSON.parse` (see `parseCredentials()` in ocr-receipt)
- `project.yml` currently has hardcoded credentials in `parameters` — do NOT commit to git (it's gitignored via `.deployed/`)
- `parse-receipt` and `generate-payment-description` use `@google/generative-ai` + `GEMINI_API_KEY` (not Vertex AI)
- `ocr-receipt` uses `@google-cloud/vision` + `GOOGLE_CREDENTIALS_B64` (service account)
- Vertex AI requires a real region (e.g. `us-central1`), NOT `global` — `global` returns HTML 404
- `node backend/test/harness.js <function-name> '<json>'` — test backend functions locally
- `node backend/test/test-exchange-rate.js` — automated exchange-rate tests

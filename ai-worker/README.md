# Ask the mechanic on the public site

The website can't hold an API key (anyone could copy it), so the mechanic talks to this small Cloudflare Worker, which holds the key and passes questions to Claude.

1. Get an API key at console.anthropic.com (add a few dollars of credit; Haiku answers cost a fraction of a cent each).
2. In Cloudflare (free plan): Workers & Pages > Create > Worker > paste `worker.js` > Deploy.
3. Worker > Settings > Variables and secrets: add secret `ANTHROPIC_API_KEY`. Optional: `ALLOWED_ORIGINS` (add your custom domain later), `MODEL`.
4. Copy the worker URL (https://something.workers.dev) into `CHAT_API` at the top of `src/chat.js`, then push.

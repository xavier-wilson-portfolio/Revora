# Ask the mechanic on the public site

The website talks to this small Cloudflare Worker, which answers questions.

Free setup (no API key, no card):
1. Cloudflare > Workers & Pages > Create application > Start with Hello World! > name it revora-mechanic > Deploy.
2. Edit code > replace everything with `worker.js` > Deploy.
3. Worker > Settings (or Bindings) > Add binding > Workers AI > variable name `AI` > Save/Deploy.

Uses Cloudflare's free Workers AI daily allowance (Meta Llama models).

Optional paid Claude answers: add secret `ANTHROPIC_API_KEY` and a text variable `PROVIDER` = `anthropic`.

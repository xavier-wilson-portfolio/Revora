/* Revora "Ask the mechanic" proxy (Cloudflare Worker).
   Holds the Anthropic API key so it never ships in the public website.
   Settings (Worker > Settings > Variables and secrets):
     ANTHROPIC_API_KEY  (secret, required)
     ALLOWED_ORIGINS    comma list, default https://xavier-wilson-portfolio.github.io
     MODEL              default claude-haiku-5-5
*/
const SYSTEM = `You are "the mechanic" on Revora, a website that helps people restore old motorcycles and cars.
Only help with vehicle restoration, repair, maintenance, tools, parts, paint and shop safety. Politely decline anything else in one sentence.
Never invent torque values, clearances, wear limits, jet sizes, wire colors, fluid capacities or part numbers. Point to the factory service manual section instead.
Keep answers short and plain. Put safety first.`;
const MAX_MSGS = 26, MAX_CHARS = 9000, MAX_TOTAL = 40000, PER_10_MIN = 30;
const hits = new Map();

function cors(origin) {
  return { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type", "Access-Control-Max-Age": "86400", "Vary": "Origin" };
}
const deny = (status, msg, h = {}) => new Response(JSON.stringify({ error: msg }), { status, headers: { ...h, "content-type": "application/json" } });

export default {
  async fetch(req, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://xavier-wilson-portfolio.github.io").split(",").map(s => s.trim()).filter(Boolean);
    const origin = req.headers.get("Origin") || "";
    if (!allowed.includes(origin)) return deny(403, "origin not allowed");
    const h = cors(origin);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (req.method !== "POST") return deny(405, "POST only", h);
    if (!env.ANTHROPIC_API_KEY) return deny(503, "not configured", h);

    // Best-effort rate limit per visitor (per Worker instance).
    const ip = req.headers.get("CF-Connecting-IP") || "?", now = Date.now();
    const list = (hits.get(ip) || []).filter(t => now - t < 600000); list.push(now); hits.set(ip, list);
    if (list.length > PER_10_MIN) return deny(429, "slow down", h);

    let body; try { body = await req.json(); } catch (e) { return deny(400, "bad json", h); }
    const msgs = Array.isArray(body && body.messages) ? body.messages.slice(-MAX_MSGS) : [];
    let total = 0;
    const clean = msgs.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map(m => { const c = m.content.slice(0, MAX_CHARS); total += c.length; return { role: m.role, content: c }; });
    if (!clean.length || clean[0].role !== "user" || clean[clean.length - 1].role !== "user") return deny(400, "bad messages", h);
    if (total > MAX_TOTAL) return deny(413, "too large", h);

    const up = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 800, stream: true, system: SYSTEM, messages: clean }),
    });
    if (!up.ok || !up.body) return deny(up.status === 429 ? 429 : 502, "upstream error", h);
    return new Response(up.body, { status: 200, headers: { ...h, "content-type": "text/event-stream", "cache-control": "no-store" } });
  },
};

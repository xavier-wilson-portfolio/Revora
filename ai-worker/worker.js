/* Revora "Ask the mechanic" proxy (Cloudflare Worker).
   FREE mode (default): add a Workers AI binding named AI (Settings > Bindings > Add > Workers AI).
     Uses Cloudflare's free daily allowance. No API key or card needed.
   CLAUDE mode (optional, paid): add secret ANTHROPIC_API_KEY and variable PROVIDER = anthropic.
   Other settings: ALLOWED_ORIGINS (comma list), MODEL (overrides the default model), VISION_MODEL (overrides the parts-scan model).
   PARTS SCAN: POST { scan: { image: "data:image/jpeg;base64,...", prompt: "..." } } returns { text }. Uses a free Workers AI vision model.
*/
const VISION_MODELS = ["@cf/meta/llama-3.2-11b-vision-instruct"];
const MAX_IMAGE = 2400000; // about 1.8 MB of photo as base64
const FREE_MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct"];
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
    const useClaude = env.PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY;
    if (!useClaude && !env.AI) return deny(503, "not configured: add a Workers AI binding named AI", h);

    // Best-effort rate limit per visitor (per Worker instance).
    const ip = req.headers.get("CF-Connecting-IP") || "?", now = Date.now();
    const list = (hits.get(ip) || []).filter(t => now - t < 600000); list.push(now); hits.set(ip, list);
    if (list.length > PER_10_MIN) return deny(429, "slow down", h);

    let body; try { body = await req.json(); } catch (e) { return deny(400, "bad json", h); }
    if (body && body.scan) return scanParts(body.scan, env, h);
    const msgs = Array.isArray(body && body.messages) ? body.messages.slice(-MAX_MSGS) : [];
    let total = 0;
    const clean = msgs.filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map(m => { const c = m.content.slice(0, MAX_CHARS); total += c.length; return { role: m.role, content: c }; });
    if (!clean.length || clean[0].role !== "user" || clean[clean.length - 1].role !== "user") return deny(400, "bad messages", h);
    if (total > MAX_TOTAL) return deny(413, "too large", h);

    if (!useClaude) {
      // Free Cloudflare Workers AI. Reply in the same streamed format the website already reads.
      let text = "", lastErr = "";
      for (const model of (env.MODEL ? [env.MODEL] : FREE_MODELS)) {
        try { const out = await env.AI.run(model, { messages: [{ role: "system", content: SYSTEM }, ...clean], max_tokens: 700 }); text = (out && out.response) || ""; if (text) break; }
        catch (e) { lastErr = String(e && e.message || e); console.log("Workers AI error", model, lastErr); }
      }
      if (!text) return deny(/limit|quota|capacity/i.test(lastErr) ? 429 : 502, "free AI error " + lastErr.slice(0, 200), h);
      const sse = o => "data: " + JSON.stringify(o) + "\n\n";
      return new Response(sse({ type: "content_block_delta", delta: { type: "text_delta", text } }) + sse({ type: "message_delta", delta: { stop_reason: "end_turn" } }),
        { status: 200, headers: { ...h, "content-type": "text/event-stream", "cache-control": "no-store" } });
    }
    const up = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: env.MODEL || "claude-haiku-5-5", max_tokens: 800, stream: true, system: SYSTEM, messages: clean }),
    });
    if (!up.ok || !up.body) {
      // Pass back Anthropic's reason (never the key) so problems like "no credit" or "bad key" are easy to spot.
      let why = ""; try { const j = await up.json(); why = (j.error && (j.error.type + ": " + j.error.message)) || ""; } catch (e) {}
      console.log("Anthropic error", up.status, why);
      return deny(up.status === 429 ? 429 : 502, `upstream ${up.status}${why ? " " + why : ""}`, h);
    }
    return new Response(up.body, { status: 200, headers: { ...h, "content-type": "text/event-stream", "cache-control": "no-store" } });
  },
};

/* Parts scan: one photo + the list of parts that could be in it. Free Workers AI vision model. */
async function scanParts(scan, env, h) {
  if (!env.AI) return deny(503, "not configured: add a Workers AI binding named AI", h);
  const image = typeof scan.image === "string" ? scan.image : "", prompt = typeof scan.prompt === "string" ? scan.prompt.slice(0, 12000) : "";
  if (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || !prompt) return deny(400, "bad scan", h);
  if (image.length > MAX_IMAGE) return deny(413, "photo too large", h);
  const run = model => env.AI.run(model, { messages: [{ role: "system", content: "You identify motorcycle parts in workshop photos. Answer with JSON only." }, { role: "user", content: prompt }], image, max_tokens: 1200 });
  let lastErr = "";
  for (const model of (env.VISION_MODEL ? [env.VISION_MODEL] : VISION_MODELS)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { const out = await run(model); const text = (out && (out.response || out.description)) || ""; if (text) return new Response(JSON.stringify({ text, model }), { status: 200, headers: { ...h, "content-type": "application/json" } }); break; }
      catch (e) { lastErr = String(e && e.message || e); console.log("vision error", model, lastErr);
        // Meta's vision model needs its license accepted once per account: send "agree", then try again.
        if (attempt === 0 && /agree|license|5016/i.test(lastErr)) { try { await env.AI.run(model, { prompt: "agree" }); } catch (e2) {} continue; } break; }
    }
  }
  return deny(/limit|quota|capacity/i.test(lastErr) ? 429 : 502, "vision AI error " + lastErr.slice(0, 200), h);
}

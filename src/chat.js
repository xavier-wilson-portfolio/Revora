/* ============ "Ask the mechanic" — AI helper on every major page and step ============ */
const CHAT = { open: false, turns: [], busy: false, ctl: null, sample: undefined, ctx: null };
/* Public website: the mechanic talks to a small proxy that holds the API key (see ai-worker/README.md).
   Paste the worker's URL here. Leave it empty and the mechanic only works inside Claude. */
const CHAT_API = "https://revora-worker.xavier-j-wilson101.workers.dev";
async function chatInit() {
  try { CHAT.sample = window.claude && window.claude.use ? await window.claude.use("sample") : (CHAT_API ? apiSample : null); } catch (e) { CHAT.sample = CHAT_API ? apiSample : null; }
  document.body.classList.toggle("no-ai", !CHAT.sample);
  renderChat();
}
const CHAT_RULES = `You are "the mechanic", a friendly, patient expert in vintage Japanese motorcycles helping a small team restore a fully disassembled 1977 Suzuki GS750 (air-cooled DOHC inline four, 748 cc, four Mikuni VM26SS carbs, wire wheels, front and rear disc brakes; exact model letter not yet verified).
How to answer:
- Explain simply enough that a beginner (even a kid) can follow. Use short sentences and short numbered steps.
- Keep it under 170 words unless they ask for more detail.
- NEVER invent torque values, clearances, wear limits, jet sizes, float heights, wire colors, fluid capacities or part numbers. Say exactly which section of the factory service manual to check instead.
- Put safety first when it matters: fuel and fumes, brakes, lifting heavy parts, chemicals, 2K paints (isocyanates), electrical shorts.
- If something is risky for a beginner, say when to get a pro (machine shop, frame shop, plating shop, paint booth).
- If you're not sure, say so and suggest how to check.
- Plain text only. You may use **bold** and simple "- " or "1. " lists. No headings.`;
/* Same contract as the Claude "sample" call: streams text through onText, resolves { text, truncated }. */
async function apiSample(messages, { signal, onText } = {}) {
  let res, text = "", stop = null;
  try { res = await fetch(CHAT_API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages }), signal }); }
  catch (e) { throw { code: e && e.name === "AbortError" ? "cancelled" : "unavailable", text }; }
  if (!res.ok || !res.body) throw { code: res.status === 429 ? "rate_limited" : res.status === 413 ? "too_large" : "unavailable" };
  const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "";
  try {
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); const lines = buf.split("\n"); buf = lines.pop();
      for (const l of lines) {
        if (!l.startsWith("data:")) continue; let ev; try { ev = JSON.parse(l.slice(5)); } catch (e) { continue; }
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") { text += ev.delta.text; onText && onText({ text }); }
        else if (ev.type === "message_delta" && ev.delta) stop = ev.delta.stop_reason;
        else if (ev.type === "error") throw { code: "unavailable", text };
      }
    }
  } catch (e) { if (signal && signal.aborted) throw { code: "cancelled", text }; throw e && e.code ? e : { code: "unavailable", text }; }
  return { text, truncated: stop === "max_tokens" };
}
function pageContext() {
  const out = [];
  try {
    if (R.sec === "lesson") { const ph = S.phases[R.lesson], L = LESSONS[R.lesson] || {}, s = phaseStats(ph); out.push(`They are on course Part ${lessonIndex(R.lesson) + 1}: "${L.title}". About: ${L.about}`, `Steps: ` + s.tasks.map(t => `${t.title} [${t.status}]`).join("; ")); }
    else if (R.sec === "viewer" && TW.sel) out.push(`They have selected "${TW.sel.name}" (${TW.sel.id}) in the 3D garage, inside ${nodeAncestors(TW.sel).slice(1, -1).map(a => a.name).join(" > ") || "the motorcycle"}.`);
    else if (MODULES[SEC[R.sec]?.mod]) out.push(`They are in the ${MODULES[SEC[R.sec].mod]} workshop area.`);
    else if (R.sec === "paint") { const m = meta(); out.push(`They are in the Paint Studio. Chosen scheme: ${m.paintName || "Candy blue"} tank and covers, ${m.frameFinish || "Gloss black"} frame, ${STRIPES[m.stripe || "gold"]}.`); }
    else if (R.sec === "guides" && R.guide) out.push(`They are reading the guide "${GUIDES[R.guide]?.title}".`);
    else if (R.sec === "diagrams" && R.diag) { const d = DIAGRAMS.find(x => x.id === R.diag); if (d) { out.push(`They are looking at the technical diagram "${d.title}" (${d.id}), ${DV.view || "exploded"} view. Parts in it: ${d.parts.map(x => x.name).join(", ")}.`); const sp = DV.sel && d.parts.find(x => x.k === DV.sel); if (sp) out.push(`Selected in the diagram: ${sp.name}.`); if (DV.step != null && d.steps && d.steps[DV.step]) out.push(`They are on sequence step ${DV.step + 1} of ${d.steps.length}: ${d.steps[DV.step].t || d.steps[DV.step].title || ""}.`); } }
    else out.push(`They are on the "${SEC[R.sec]?.t}" page.`);
    if (drawerState.c === "parts" && S.parts[drawerState.id]) { const p = S.parts[drawerState.id]; out.push(`Open part: ${p.name} (${p.id}), status ${partStatusLabel(p)}, condition ${p.condition}${p.notes ? ", notes: " + p.notes : ""}.`); }
    if (drawerState.c === "tasks" && S.tasks[drawerState.id]) { const t = S.tasks[drawerState.id]; out.push(`Open step: ${t.title}. Instructions: ${t.instructions}`); }
    else if (drawerState.c && drawerState.c !== "parts" && S[drawerState.c] && S[drawerState.c][drawerState.id]) out.push(`Open record: ${recordBrief(drawerState.c, S[drawerState.c][drawerState.id])}`);
    out.push(`Overall progress ${pct(overallProgress())}.`);
  } catch (e) {}
  return out.join("\n");
}
const SUGGEST = {
  lesson: ["What should I do first in this part?", "What tools do I really need?", "What mistakes do beginners make here?"],
  viewer: ["What does this part do?", "How do I know if it's worn out?", "How hard is it to rebuild?"],
  paint: ["Walk me through painting the tank", "Paint or powder coat for the frame?", "What safety gear do I need for 2K clear?"],
  inventory: ["How should I label and store small parts?", "How do I judge if a part is reusable?"],
  gates: ["Why does each check need a reviewer?", "What should a brake inspection cover?"],
  budget: ["Where can I save money on this build?", "What usually costs more than people expect?"],
  purchasing: ["New or used for this part?", "What should I check before buying a used part?"],
  shops: ["Where do people find rare GS750 parts?", "How do I spot a fake or poor-quality part?"],
  diagrams: ["What does this assembly do?", "What order does this come apart in?", "What wears out here?"],
  tasks: ["What should I work on next?", "How do I split this work between two people?"],
  inspections: ["How do I take this measurement?", "What tools do I need to measure this?"],
  problems: ["How do I troubleshoot this?", "When should I take this to a pro?"],
  maintenance: ["What maintenance does a GS750 need?", "How often should I change the oil?"],
  videos: ["What should I watch for in this video?", "What does the video skip that I should know?"],
  course: ["Where should I start?", "How long does a full restoration take?"],
  default: ["Where should I start?", "What's the hardest part of a GS750 restoration?", "What tools should I buy first?"],
};
function askMechanic(question, ctxLabel, more) {
  CHAT.open = true; CHAT.ctx = ctxLabel || null; renderChat();
  if (question) sendChat(question, more); else setTimeout(() => $("#chatIn")?.focus(), 60);
}
function fmtAnswer(t) {
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n/);
  let html = "", list = null;
  lines.forEach(l => { const m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/); if (m) { const ol = /^\s*\d/.test(l) ? "ol" : "ul"; if (list !== ol) { if (list) html += `</${list}>`; html += `<${ol}>`; list = ol; } html += `<li>${m[1]}</li>`; } else { if (list) { html += `</${list}>`; list = null; } if (l.trim()) html += `<p>${l}</p>`; } });
  if (list) html += `</${list}>`; return html;
}
const CHAT_ERR = { not_granted: "The mechanic needs your OK to use Claude. Ask again and choose Allow.", rate_limited: "Lots of questions at once. Wait a moment and try again.", too_large: "That question is too long. Try a shorter one.", unavailable: "The mechanic can't answer right now. Try again in a minute." };
async function sendChat(asked, more) {
  const inp = $("#chatIn"); const q = (typeof asked === "string" ? asked : inp?.value || "").trim(); if (!q || CHAT.busy) return;
  const turn = { role: "user", content: more ? q + "\n\nDetails from the app:\n" + more : q, show: q };
  if (!CHAT.sample) { CHAT.turns.push(turn, { role: "assistant", content: "The mechanic works when this page is open in Claude. It isn't available in this copy." }); inp.value = ""; renderChat(); return; }
  inp.value = ""; CHAT.turns.push(turn); CHAT.turns.push({ role: "assistant", content: "", pending: true }); CHAT.busy = true; renderChat();
  const ctl = CHAT.ctl = new AbortController(), cur = CHAT.turns[CHAT.turns.length - 1];
  const history = CHAT.turns.filter(t => !t.pending && !t.err).slice(-12).map(t => ({ role: t.role, content: t.content }));
  const input = [{ role: "user", content: CHAT_RULES + "\n\nWhere they are in the app right now:\n" + pageContext() + "\n\nReply \"Ready.\" and wait for their question." }, { role: "assistant", content: "Ready." }, ...history];
  try {
    const { text, truncated } = await CHAT.sample(input, { cache: false, signal: ctl.signal, onText: ({ text }) => { cur.content = text; cur.pending = false; paintLastAnswer(); } });
    cur.content = text + (truncated ? "\n\n(Answer was cut short. Ask a narrower question for the rest.)" : ""); cur.pending = false;
  } catch (e) { cur.pending = false; if (e && e.code === "cancelled") cur.content = (e.text || cur.content || "") + "\n\n(Stopped.)"; else { cur.content = (e && e.text) || CHAT_ERR[e && e.code] || "Something went wrong. Try asking again."; cur.err = !(e && e.text); } }
  CHAT.busy = false; CHAT.ctl = null; renderChat();
}
function paintLastAnswer() { const el = $("#chatLog .msg.a:last-child .bubble"); const t = CHAT.turns[CHAT.turns.length - 1]; if (el && t) el.innerHTML = fmtAnswer(t.content); const log = $("#chatLog"); if (log) log.scrollTop = log.scrollHeight; }
function renderChat() {
  let host = $("#chatHost"); if (!host) { host = document.createElement("div"); host.id = "chatHost"; document.body.appendChild(host); }
  const sugg = SUGGEST[R.sec] || (MODULES[SEC[R.sec]?.mod] ? SUGGEST.lesson : SUGGEST.default);
  if (CHAT.sample === null && !CHAT.open) { host.innerHTML = ""; return; }
  host.innerHTML = `<button class="chat-fab ${CHAT.open ? "hide" : ""}" id="chatFab" aria-label="Ask the mechanic">${ic("chat")}<span>Ask the mechanic</span></button>
  ${CHAT.open ? `<section class="chat" role="dialog" aria-label="Ask the mechanic">
    <header><span class="cav">${ic("wrench")}</span><div><b>Ask the mechanic</b><span>AI helper · knows which page you're on</span></div><button class="x" id="chatX" aria-label="Close">${ic("x")}</button></header>
    <div class="chat-log" id="chatLog">${CHAT.turns.length ? CHAT.turns.map(t => `<div class="msg ${t.role === "user" ? "u" : "a"}"><div class="bubble">${t.role === "user" ? esc(t.show || t.content) : t.pending ? `<span class="typing"><i></i><i></i><i></i></span> Thinking…` : fmtAnswer(t.content)}</div></div>`).join("")
      : `<div class="chat-hello"><b>Hi! Stuck on something?</b><p>Ask anything about this page, a step, a part or a tool. I'll keep it simple, and I'll tell you where the factory manual has the exact numbers.</p>${CHAT.ctx ? `<span class="tag">About: ${esc(CHAT.ctx)}</span>` : ""}</div>`}</div>
    ${!CHAT.busy ? `<div class="chat-sugg">${sugg.map(s => `<button data-sugg="${esc(s)}">${esc(s)}</button>`).join("")}</div>` : ""}
    <form class="chat-form" id="chatForm"><input id="chatIn" placeholder="Type your question…" autocomplete="off" aria-label="Your question" ${CHAT.busy ? "disabled" : ""}>${CHAT.busy ? `<button type="button" class="btn sm" id="chatStop">Stop</button>` : `<button class="btn pri sm" aria-label="Send">${ic("send")}</button>`}</form>
    <p class="chat-note">AI answers can be wrong. Always check specs in the factory service manual.${CHAT.turns.length ? ` <button class="linkbtn" id="chatClear">Clear chat</button>` : ""}</p></section>` : ""}`;
  $("#chatFab").onclick = () => askMechanic(null);
  if (!CHAT.open) return;
  $("#chatX").onclick = () => { CHAT.open = false; renderChat(); };
  $("#chatForm").onsubmit = e => { e.preventDefault(); sendChat(); };
  $("#chatStop") && ($("#chatStop").onclick = () => CHAT.ctl && CHAT.ctl.abort());
  $("#chatClear") && ($("#chatClear").onclick = () => { CHAT.turns = []; renderChat(); });
  $$("[data-sugg]", host).forEach(b => b.onclick = () => sendChat(b.dataset.sugg));
  const log = $("#chatLog"); log.scrollTop = log.scrollHeight;
}
const askBtn = (q, label, cls = "btn sm ask", more = "") => `<button type="button" class="${cls}" data-ask="${esc(q)}" data-ask-ctx="${esc(label || "")}"${more ? ` data-ask-more="${esc(more)}"` : ""}>${ic("chat")} ${esc(label ? "Ask about this" : "Ask the mechanic")}</button>`;
document.addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (!b) return; e.preventDefault(); e.stopPropagation(); askMechanic(b.dataset.ask || null, b.dataset.askCtx || null, b.dataset.askMore || ""); }, true);

/* Short plain-text summary of any record, used for "Ask about this" prompts and page context. */
function recordBrief(c, r) {
  const sc = SCHEMA[c]; if (!sc || !r) return "";
  const bits = [`${sc.label} ${r.id}: "${titleOf(c, r)}"`];
  sc.fields.forEach(f => { if (f.k === sc.title) return; const v = r[f.k]; if (v == null || v === "" || typeof v === "object" || typeof v === "boolean") return; const t = String(v); if (t.length > 1 && t !== VERIFY) bits.push(`${f.label}: ${t.length > 220 ? t.slice(0, 220) + "…" : t}`); });
  let out = bits.join(". "); return out.length > 1400 ? out.slice(0, 1400) + "…" : out;
}
const ASK_LEAD = {
  tasks: "Help me with this step of my GS750 restoration. Tell me how to do it, what tools I need and what to watch out for.",
  steps: "Help me with this procedure step on my GS750. Tell me how to do it and what to watch out for.",
  inspections: "Explain how to do this inspection or measurement on my GS750, what tools I need, and what a good or bad result looks like. Don't give me spec numbers, tell me where in the factory manual to find them.",
  gates: "Explain this quality gate on my GS750 restoration: why it matters and what has to be true before it passes.",
  checks: "Explain this safety check on my GS750: how to do it and what counts as a pass or a fail.",
  issues: "Help me solve this problem on my GS750. Walk me through likely causes and how to check each one.",
  decisions: "Help me think through this decision on my GS750 restoration. Lay out the options and trade-offs.",
  purchases: "Help me with this purchase for my GS750: is it the right part, what should I check, and new or used?",
  expenses: "Help me understand this expense on my GS750 restoration and whether it's in line with normal costs.",
  maintenance: "Explain this maintenance item for my GS750: how to do it and how often.",
  finishes: "Help me with this finishing job on my GS750: prep, process and safety.",
  tools: "Tell me how to use this tool or supply on a GS750 restoration, and what to look for when buying it.",
  phases: "Explain this phase of my GS750 restoration: what it covers, what order to work in and common mistakes.",
  worklogs: "Look at this work session on my GS750 and tell me what I should do next.",
};
const askRecord = (c, r, cls = "btn sm ask") => ASK_LEAD[c] ? askBtn(`About "${titleOf(c, r)}": ${ASK_LEAD[c]}`, titleOf(c, r), cls, recordBrief(c, r)) : "";

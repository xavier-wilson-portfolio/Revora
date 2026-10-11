/* ============ "Ask the mechanic" — AI helper on every major page and step ============ */
const CHAT = { open: false, turns: [], busy: false, ctl: null, sample: undefined, ctx: null };
async function chatInit() {
  try { CHAT.sample = window.claude && window.claude.use ? await window.claude.use("sample") : null; } catch (e) { CHAT.sample = null; }
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
function pageContext() {
  const out = [];
  try {
    if (R.sec === "lesson") { const ph = S.phases[R.lesson], L = LESSONS[R.lesson] || {}, s = phaseStats(ph); out.push(`They are on course Part ${lessonIndex(R.lesson) + 1}: "${L.title}". About: ${L.about}`, `Steps: ` + s.tasks.map(t => `${t.title} [${t.status}]`).join("; ")); }
    else if (R.sec === "viewer" && TW.sel) out.push(`They have selected "${TW.sel.name}" (${TW.sel.id}) in the 3D garage, inside ${nodeAncestors(TW.sel).slice(1, -1).map(a => a.name).join(" > ") || "the motorcycle"}.`);
    else if (MODULES[SEC[R.sec]?.mod]) out.push(`They are in the ${MODULES[SEC[R.sec].mod]} workshop area.`);
    else if (R.sec === "paint") { const m = meta(); out.push(`They are in the Paint Studio. Chosen scheme: ${m.paintName || "Candy blue"} tank and covers, ${m.frameFinish || "Gloss black"} frame, ${STRIPES[m.stripe || "gold"]}.`); }
    else if (R.sec === "guides" && R.guide) out.push(`They are reading the guide "${GUIDES[R.guide]?.title}".`);
    else out.push(`They are on the "${SEC[R.sec]?.t}" page.`);
    if (drawerState.c === "parts" && S.parts[drawerState.id]) { const p = S.parts[drawerState.id]; out.push(`Open part: ${p.name} (${p.id}), status ${partStatusLabel(p)}, condition ${p.condition}${p.notes ? ", notes: " + p.notes : ""}.`); }
    if (drawerState.c === "tasks" && S.tasks[drawerState.id]) { const t = S.tasks[drawerState.id]; out.push(`Open step: ${t.title}. Instructions: ${t.instructions}`); }
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
  default: ["Where should I start?", "What's the hardest part of a GS750 restoration?", "What tools should I buy first?"],
};
function askMechanic(question, ctxLabel) {
  CHAT.open = true; CHAT.ctx = ctxLabel || null; renderChat();
  if (question) { $("#chatIn").value = question; sendChat(); } else setTimeout(() => $("#chatIn")?.focus(), 60);
}
function fmtAnswer(t) {
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").split(/\n/);
  let html = "", list = null;
  lines.forEach(l => { const m = l.match(/^\s*(?:[-•*]|\d+[.)])\s+(.*)/); if (m) { const ol = /^\s*\d/.test(l) ? "ol" : "ul"; if (list !== ol) { if (list) html += `</${list}>`; html += `<${ol}>`; list = ol; } html += `<li>${m[1]}</li>`; } else { if (list) { html += `</${list}>`; list = null; } if (l.trim()) html += `<p>${l}</p>`; } });
  if (list) html += `</${list}>`; return html;
}
const CHAT_ERR = { not_granted: "The mechanic needs your OK to use Claude. Ask again and choose Allow.", rate_limited: "Lots of questions at once. Wait a moment and try again.", too_large: "That question is too long. Try a shorter one.", unavailable: "The mechanic can't answer right now. Try again in a minute." };
async function sendChat() {
  const inp = $("#chatIn"); const q = (inp?.value || "").trim(); if (!q || CHAT.busy) return;
  if (!CHAT.sample) { CHAT.turns.push({ role: "user", content: q }, { role: "assistant", content: "The mechanic works when this page is open in Claude. It isn't available in this copy." }); inp.value = ""; renderChat(); return; }
  inp.value = ""; CHAT.turns.push({ role: "user", content: q }); CHAT.turns.push({ role: "assistant", content: "", pending: true }); CHAT.busy = true; renderChat();
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
    <div class="chat-log" id="chatLog">${CHAT.turns.length ? CHAT.turns.map(t => `<div class="msg ${t.role === "user" ? "u" : "a"}"><div class="bubble">${t.role === "user" ? esc(t.content) : t.pending ? `<span class="typing"><i></i><i></i><i></i></span> Thinking…` : fmtAnswer(t.content)}</div></div>`).join("")
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
  $$("[data-sugg]", host).forEach(b => b.onclick = () => { $("#chatIn").value = b.dataset.sugg; sendChat(); });
  const log = $("#chatLog"); log.scrollTop = log.scrollHeight;
}
const askBtn = (q, label, cls = "btn sm ask") => `<button type="button" class="${cls}" data-ask="${esc(q)}" data-ask-ctx="${esc(label || "")}">${ic("chat")} ${esc(label ? "Ask about this" : "Ask the mechanic")}</button>`;
document.addEventListener("click", e => { const b = e.target.closest("[data-ask]"); if (!b) return; e.preventDefault(); e.stopPropagation(); askMechanic(b.dataset.ask || null, b.dataset.askCtx || null); }, true);

/* ============ Parts scan: photo -> AI looks for this diagram's parts -> you confirm piece by piece -> have / missing ============
   The marks are the same ones the diagram parts check uses (S.meta["have-<diagram id>"]), so diagrams, the parts page and the
   course all show the same answer. The photo is kept in Photos & files as a record. */
const SCAN = { sample: undefined };

/* ---- have / missing store (shared with the 3D parts check) ---- */
function haveDoc(did) { return (S.meta && S.meta["have-" + did]) || { id: "have-" + did, parts: {} }; }
function haveGet(did, pid) { return (haveDoc(did).parts || {})[pid] || {}; }
async function haveSave(did, updates, action) {
  const d = clone(haveDoc(did)); d.parts = d.parts || {};
  Object.entries(updates).forEach(([pid, patch]) => { const cur = Object.assign({}, d.parts[pid], patch); Object.keys(cur).forEach(k => { if (cur[k] === null || cur[k] === "" || cur[k] === undefined) delete cur[k]; }); if (Object.keys(cur).length) d.parts[pid] = cur; else delete d.parts[pid]; });
  S.meta[d.id] = d; scanRefreshViews();
  try { await store.put("meta", d, { silent: true, action }); } catch (e) {}
}
function scanRefreshViews() { if (typeof D3 !== "undefined" && D3.st && !D3.st.dead) { d3Paint(D3.st); d3Chk(D3.st); d3Side(D3.st); } else if (["inventory", "lesson", "viewer"].includes(R.sec)) scheduleRender(); }

/* ---- which parts can be scanned ---- */
function scanParts(did) {
  const m = D3_MODELS[did]; if (!m) return []; const st = { id: did, model: m };
  return m.parts.filter(p => p.ref !== undefined && p.ref !== "—" && String(p.ref).trim()).map(p => ({ pid: p.id, ref: String(p.ref), name: p.name, count: p.count || 1, small: !!p.small, pn: fmtPn(d3Pn(st, p.ref)) || "", cat: d3Cat(st, p.ref) || "" }));
}
function scanDiagrams() { return DIAGRAMS.filter(d => D3_MODELS[d.id] && (typeof DIAG_ONLY_B === "undefined" || !DIAG_ONLY_B || diagFitsB(d))); }
function haveStats(did) { const ps = scanParts(did); let have = 0, miss = 0; ps.forEach(p => { const h = haveGet(did, p.pid).have; if (h === true) have++; else if (h === false) miss++; }); return { total: ps.length, have, miss, open: ps.length - have - miss }; }
const cmsSearchUrl = pn => "https://www.cmsnl.com/search/?q=" + encodeURIComponent(pn);
const ebaySearchUrl = (pn, name) => "https://www.ebay.com/sch/i.html?_nkw=" + encodeURIComponent([pn, "Suzuki GS750", pn ? "" : name].filter(Boolean).join(" "));

/* which diagram goes with each part group of the bike (3D garage groups, course focus, Parts records) */
const GROUP_DIAG = { frame: "CMS-BLCK0023", stem: "CMS-BLCK0071", fork: "DG-CH-01", handlebar: "CMS-BLCK0042", controls: "CMS-BLCK0045", switches: "CMS-BLCK0045",
  mcyl: "CMS-BLCK0032", wheelF: "DG-CH-02", wheelR: "CMS-BLCK0058", tires: "DG-CH-02", brakeF: "DG-CH-02", caliper: "DG-BR-01", hoses: "CMS-BLCK0026", brakeR: "CMS-BLCK0052",
  engine: "CMS-BLCK0017", head: "CMS-BLCK0018", cases: "CMS-BLCK0014", clutch: "DG-EN-03", alt: "CMS-BLCK0041", starter: "CMS-BLCK0069", carbs: "DG-FU-01",
  boots: "CMS-BLCK0001", airbox: "CMS-BLCK0001", exhaust: "CMS-BLCK0048", tank: "CMS-BLCK0037", tap: "CMS-BLCK0036", seat: "CMS-BLCK0062", coverL: "CMS-BLCK0025",
  coverR: "CMS-BLCK0025", fenders: "CMS-BLCK0054", swingarm: "CMS-BLCK0057", shocks: "CMS-BLCK0008", chain: "CMS-BLCK0058", headlight: "CMS-BLCK0043",
  gauges: "CMS-BLCK0065", sigF: "CMS-BLCK0076", tail: "CMS-BLCK0053", harness: "CMS-BLCK0020", ignition: "CMS-BLCK0011", pegs: "CMS-BLCK0021" };
const scanBtn = (did, label = "Scan parts", cls = "btn sm") => did && D3_MODELS[did] ? `<button type="button" class="${cls}" data-scan="${did}" title="Take a photo of these parts and check them off">${ic("camera")} ${esc(label)}</button>` : "";
const scanPickBtn = (label = "Scan a tray of parts", cls = "btn sm") => `<button type="button" class="${cls}" data-scanpick title="Pick which diagram the parts belong to, then take a photo">${ic("camera")} ${esc(label)}</button>`;
document.addEventListener("click", e => {
  const b = e.target.closest("[data-scan]"); if (b) { e.preventDefault(); scanStart(b.dataset.scan); return; }
  const p = e.target.closest("[data-scanpick]"); if (p) { e.preventDefault(); scanPick(); }
});

/* ---- AI ---- */
function scanPrompt(title, parts) {
  return `This photo shows motorcycle parts laid out for a 1977 Suzuki GS750 restoration. They should be from the "${title}" area.
These are the ONLY parts that could be in the photo (number. name, Suzuki part number, how many the bike uses):
${parts.map((p, i) => `${i + 1}. ${p.name}${p.pn ? ` (${p.pn})` : ""}${p.count > 1 ? `, ${p.count} used` : ""}`).join("\n")}

For EVERY numbered part decide whether it is visible in the photo.
Reply with only a JSON array, one object per numbered part, in order:
{"n": <number>, "seen": "yes" | "maybe" | "no", "count": <how many you can see, 0 if none>, "note": "<a few words about what you saw, or empty>"}
Use "maybe" when something looks similar but you are not sure. Small fasteners that look alike should be "maybe". Never add parts that are not in the list.`;
}
function scanParse(t) {
  if (Array.isArray(t)) return t; if (t && typeof t === "object" && Array.isArray(t.parts)) return t.parts;
  t = String(t || ""); const a = t.indexOf("["), b = t.lastIndexOf("]");
  if (a >= 0 && b > a) { try { const v = JSON.parse(t.slice(a, b + 1)); if (Array.isArray(v)) return v; } catch (e) {} }
  const out = []; t.replace(/"n"\s*:\s*(\d+)[^{}]*?"seen"\s*:\s*"(yes|maybe|no)"(?:[^{}]*?"count"\s*:\s*(\d+))?/gi, (m, n, s, c) => { out.push({ n: +n, seen: s.toLowerCase(), count: c ? +c : 0 }); return m; });
  return out;
}
async function scanAI(dataUrl, blob, prompt) {
  if (SCAN.sample === undefined) { try { SCAN.sample = window.claude && window.claude.use ? await window.claude.use("sample") : null; } catch (e) { SCAN.sample = null; } }
  if (SCAN.sample) { let lim = null; try { lim = await SCAN.sample.limits(); } catch (e) {}
    if (lim && lim.images) return scanParse(await SCAN.sample.json(prompt, { images: [blob], modelTier: "default", cache: false })); }
  if (typeof CHAT_API === "undefined" || !CHAT_API) throw new Error("the photo AI isn't set up on this site yet");
  let res; try { res = await fetch(CHAT_API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ scan: { image: dataUrl, prompt } }) }); }
  catch (e) { throw new Error("couldn't reach the photo AI (check your internet)"); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(res.status === 429 ? "the free AI is busy or out of today's allowance, try again later" : /bad messages|bad json/.test(j.error || "") ? "the photo AI needs its update (see Settings > AI)" : (j.error || "error " + res.status));
  return scanParse(j.text);
}

/* ---- picker: which tray / diagram ---- */
function scanPick() {
  const ds = scanDiagrams(), sys = [...new Set(ds.map(d => d.system))];
  modal(`<h3>${ic("camera")} Scan a tray of parts</h3><p class="hint-text" style="text-align:left;margin:0">Pick the area the parts are from. The scan only looks for that diagram's parts, which makes it far more accurate.</p>
    <input type="search" id="scQ" placeholder="Search, e.g. carburetor, fork, clutch" autofocus>
    <div class="scpick" id="scList">${sys.map(s => `<div class="scgrp" data-sys="${esc(s)}"><div class="lbl">${esc(s)}</div>${ds.filter(d => d.system === s).map(d => { const h = haveStats(d.id); return `<button type="button" class="scrow" data-pick="${d.id}" data-t="${esc((d.title + " " + s).toLowerCase())}"><b>${esc(d.title)}</b><span>${h.have || h.miss ? `${h.have} have · ${h.miss} missing · ${h.open} to check` : `${h.total} parts`}</span></button>`; }).join("")}</div>`).join("")}</div>
    <div class="row"><button class="btn" data-x>Cancel</button></div>`, m => {
    $("[data-x]", m).onclick = closeModal;
    $$("[data-pick]", m).forEach(b => b.onclick = () => scanStart(b.dataset.pick));
    $("#scQ", m).oninput = e => { const q = e.target.value.trim().toLowerCase(); $$("[data-pick]", m).forEach(b => b.hidden = q && !b.dataset.t.includes(q)); $$(".scgrp", m).forEach(g => g.hidden = !$$("[data-pick]", g).some(b => !b.hidden)); };
  });
}

/* ---- the scan itself ---- */
function scanStart(did) {
  const d = diagById(did), parts = scanParts(did); if (!d || !parts.length) { toast("That area has no parts list to scan yet.", "err"); return; }
  if (!ME.canWrite) { toast("You have view-only access, so scans can't be saved. Ask the owner for Contributor access.", "err"); return; }
  try { if (document.fullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
  $$(".d3main.d3full").forEach(x => x.classList.remove("d3full")); document.body.classList.remove("d3lock");
  const sc = { did, title: d.title, parts, step: "photo", ai: {}, dec: {}, i: 0, photo: null, err: "" };
  parts.forEach(p => { const h = haveGet(did, p.pid); sc.dec[p.pid] = { have: h.have, note: h.note || "", got: h.got }; });
  scanShow(sc);
}
function scanChip(a) { if (!a) return ""; const c = a.seen === "yes" ? "g" : a.seen === "maybe" ? "a" : "r";
  return `<span class="scchip ${c}">${a.seen === "yes" ? "Scan: looks like it's here" + (a.count > 1 ? ` (×${a.count})` : "") : a.seen === "maybe" ? "Scan: not sure" : "Scan: didn't see it"}</span>`; }
function scanShow(sc) {
  const P = sc.parts, n = P.length;
  const head = `<div class="row" style="justify-content:space-between;align-items:center"><h3 style="margin:0">${ic("camera")} Scan parts: ${esc(sc.title)}</h3><button class="linkbtn" data-sc="close" aria-label="Close">✕</button></div>`;
  const photo = sc.photo ? `<img class="scphoto" src="${sc.photo.dataUrl}" alt="Your parts photo">` : "";
  let body = "";
  if (sc.step === "photo") {
    body = `<p style="margin:0">Lay out the parts from this area and take one photo. The scan looks for the ${n} parts on this diagram, then you go through them one at a time to confirm.</p>
      <ul class="tips scTips"><li>${ic("bulb")}<span>Plain, light surface. Parts spread out, not touching or stacked.</span></li><li>${ic("bulb")}<span>Good light, no heavy shadows. Shoot from straight above.</span></li><li>${ic("bulb")}<span>Small bolts and washers are hard to tell apart in a photo, so expect to confirm those yourself.</span></li></ul>
      <div class="row" style="gap:8px;flex-wrap:wrap"><label class="btn pri">${ic("camera")} Take a photo<input type="file" accept="image/*" capture="environment" data-scfile hidden></label><label class="btn">${ic("image")} Upload a photo<input type="file" accept="image/*" data-scfile hidden></label><button class="btn" data-sc="manual">No photo, just go through the list</button></div>`;
  } else if (sc.step === "busy") {
    body = `${photo}<div class="row center" style="gap:10px"><span class="spinner"></span><b>Looking for ${n} parts in your photo…</b></div><p class="hint-text" style="margin:0">This usually takes 5 to 30 seconds.</p>`;
  } else if (sc.step === "error") {
    body = `${photo}<div class="banner warn"><div class="grow">The scan couldn't run: ${esc(sc.err)}. You can still go through the parts by hand, and the photo is still saved with your marks.</div></div>
      <div class="row" style="gap:8px"><button class="btn pri" data-sc="retry">Try the scan again</button><button class="btn" data-sc="walk">Go through by hand</button></div>`;
  } else if (sc.step === "summary") {
    const c = { yes: 0, maybe: 0, no: 0 }; P.forEach(p => { const a = sc.ai[p.pid]; c[a ? a.seen : "no"]++; });
    body = `${photo}<div class="sclegend"><span><i class="g"></i>${c.yes} look like they're here</span><span><i class="a"></i>${c.maybe} not sure</span><span><i class="r"></i>${c.no} not seen</span></div>
      <p style="margin:0">Next, go through each part and confirm it's the right piece and that you have it. Nothing is saved until you finish.</p>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-sc="walk" autofocus>Go through piece by piece</button><button class="btn" data-sc="list">See the whole list</button></div>`;
  } else if (sc.step === "walk") {
    const p = P[sc.i], a = sc.ai[p.pid], dc = sc.dec[p.pid], prev = haveGet(sc.did, p.pid).have;
    body = `${photo ? `<details class="scphwrap"><summary>Your photo</summary>${photo}</details>` : ""}
      <div class="scprog"><span>Part ${sc.i + 1} of ${n}</span><div class="progress"><i style="width:${(sc.i + 1) / n * 100}%"></i></div></div>
      <div class="sccard"><span class="eyebrow">Ref ${esc(p.ref)}${p.count > 1 ? ` · the bike uses ${p.count}` : ""}</span><h2 class="vtitle" style="margin:2px 0">${esc(p.name)}</h2>
        <div class="hint-text" style="text-align:left">${p.pn ? `Suzuki part no. <code>${esc(p.pn)}</code>` : "No Suzuki part number on this page"}${p.cat ? ` · catalogue name: ${esc(p.cat)}` : ""}</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${scanChip(a)}${a && a.note ? `<span class="hint-text">“${esc(a.note)}”</span>` : ""}${prev !== undefined ? `<span class="hint-text">Marked before: ${prev ? "have it" : "missing"}</span>` : ""}</div>
        <p style="margin:4px 0 0"><b>Is this the part, and do you have it?</b></p>
        <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn ${dc.have === true ? "have-on" : ""}" data-sc="have">✓ Yes, I have it</button><button class="btn ${dc.have === false ? "miss-on" : ""}" data-sc="miss">✕ Missing</button><button class="btn" data-sc="skip">Not sure, skip</button></div>
        ${p.count > 1 ? `<label class="lbl" for="scGot">How many do you have? (the bike uses ${p.count})</label><input type="number" id="scGot" min="0" max="99" value="${dc.got != null ? dc.got : ""}" style="width:90px">` : ""}
        <label class="lbl" for="scNote">Note</label><textarea id="scNote" rows="2" placeholder="e.g. cracked, worn, wrong part, needs replacing">${esc(dc.note || "")}</textarea>
        ${p.pn ? `<div class="hint-text" style="text-align:left">Not sure what it looks like? <a href="${cmsSearchUrl(p.pn)}" target="_blank" rel="noopener">Look up ${esc(p.pn)} on CMSNL</a></div>` : ""}</div>
      <div class="row" style="justify-content:space-between;gap:8px"><button class="btn" data-sc="back" ${sc.i ? "" : "disabled"}>${ic("back")} Back</button><button class="btn" data-sc="list">Whole list</button>${sc.i < n - 1 ? `<button class="btn" data-sc="next">Next ${ic("next")}</button>` : `<button class="btn pri" data-sc="save">Finish and save</button>`}</div>`;
  } else if (sc.step === "list") {
    body = `${photo ? `<details class="scphwrap"><summary>Your photo</summary>${photo}</details>` : ""}
      <div class="row" style="gap:8px;flex-wrap:wrap">${Object.keys(sc.ai).length ? `<button class="btn sm" data-sc="acceptYes">Mark everything the scan saw as “have it”</button>` : ""}<button class="btn sm" data-sc="walk">Piece by piece</button></div>
      <div class="sclist">${P.map((p, k) => { const dc = sc.dec[p.pid]; return `<div class="scli"><div class="grow"><b>${esc(p.ref)}. ${esc(p.name)}</b>${p.count > 1 ? ` <span class="faint">×${p.count}</span>` : ""}<div>${scanChip(sc.ai[p.pid])}</div></div>
        <div class="row" style="gap:4px"><button class="btn sm ${dc.have === true ? "have-on" : ""}" data-lh="${k}">✓ Have</button><button class="btn sm ${dc.have === false ? "miss-on" : ""}" data-lm="${k}">✕ Missing</button><button class="btn sm" data-lw="${k}" title="Open this part to add a note">Note</button></div></div>`; }).join("")}</div>
      <div class="row" style="justify-content:flex-end"><button class="btn pri" data-sc="save">Save</button></div>`;
  } else if (sc.step === "done") {
    body = `<div class="banner good"><div class="grow"><b>Saved.</b> ${sc.saved.have} have it, ${sc.saved.miss} missing${sc.saved.open ? `, ${sc.saved.open} still to check` : ""}.${sc.photo ? " The photo is in Photos &amp; files." : ""}</div></div>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn pri" data-sc="missing">See what's missing and where to get it</button><button class="btn" data-sc="diagram">Open the diagram</button>${scanPickBtn("Scan another tray", "btn")}<button class="btn" data-sc="close">Close</button></div>`;
  }
  let m = $("#modalHost .modal.scmodal");
  if (m) { m.innerHTML = `<div class="scan stack">${head}${body}</div>`; m.scrollTop = 0; } else m = modal(`<div class="scan stack">${head}${body}</div>`, () => {});
  m.classList.add("scmodal");
  const keepNote = () => { const p = P[sc.i]; if (sc.step !== "walk" || !p) return; const nt = $("#scNote", m), g = $("#scGot", m); if (nt) sc.dec[p.pid].note = nt.value.trim(); if (g) sc.dec[p.pid].got = g.value === "" ? null : Math.max(0, +g.value); };
  $$("[data-scfile]", m).forEach(inp => inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return;
    let dataUrl; try { dataUrl = await compressImage(f, 520000); } catch (e) { toast("Couldn't read that photo. Try a JPG or PNG.", "err"); return; }
    sc.photo = { dataUrl, blob: await (await fetch(dataUrl)).blob(), name: f.name }; scanRun(sc); });
  $$("[data-sc]", m).forEach(b => b.onclick = () => { const a = b.dataset.sc, p = P[sc.i];
    if (a === "close") { if (["walk", "list", "summary"].includes(sc.step) && Object.values(sc.dec).some((d, k) => d.have !== haveGet(sc.did, P[k].pid).have)) { if (!confirm("Close without saving these marks?")) return; } closeModal(); return; }
    if (a === "manual") { sc.step = "walk"; sc.i = 0; }
    else if (a === "retry") { scanRun(sc); return; }
    else if (a === "walk") { sc.step = "walk"; }
    else if (a === "list") { keepNote(); sc.step = "list"; }
    else if (a === "have" || a === "miss") { keepNote(); const v = a === "have"; sc.dec[p.pid].have = sc.dec[p.pid].have === v ? undefined : v; if (sc.dec[p.pid].have !== undefined && sc.i < n - 1) sc.i++; }
    else if (a === "skip") { keepNote(); if (sc.i < n - 1) sc.i++; }
    else if (a === "next") { keepNote(); sc.i = Math.min(n - 1, sc.i + 1); }
    else if (a === "back") { keepNote(); sc.i = Math.max(0, sc.i - 1); }
    else if (a === "acceptYes") { P.forEach(q => { if ((sc.ai[q.pid] || {}).seen === "yes") sc.dec[q.pid].have = true; }); }
    else if (a === "save") { keepNote(); scanSave(sc); return; }
    else if (a === "missing") { closeModal(); R.partsFocus = "missing"; go("inventory"); return; }
    else if (a === "diagram") { closeModal(); DV.id = null; go("diagram-" + sc.did); return; }
    scanShow(sc); });
  $$("[data-lh],[data-lm]", m).forEach(b => b.onclick = () => { const k = +(b.dataset.lh ?? b.dataset.lm), v = b.dataset.lh !== undefined, q = sc.dec[P[k].pid]; q.have = q.have === v ? undefined : v; scanShow(sc); });
  $$("[data-lw]", m).forEach(b => b.onclick = () => { sc.i = +b.dataset.lw; sc.step = "walk"; scanShow(sc); });
}
async function scanRun(sc) {
  sc.step = "busy"; scanShow(sc);
  try { const res = await scanAI(sc.photo.dataUrl, sc.photo.blob, scanPrompt(sc.title, sc.parts)); sc.ai = {};
    res.forEach((r, k) => { const idx = Number.isFinite(+r.n) && +r.n >= 1 ? +r.n - 1 : k, p = sc.parts[idx]; if (!p) return; const seen = /^(yes|maybe|no)$/i.test(r.seen) ? r.seen.toLowerCase() : r.seen === true ? "yes" : "no";
      sc.ai[p.pid] = { seen, count: Math.max(0, parseInt(r.count) || 0), note: String(r.note || "").slice(0, 120) }; });
    if (!Object.keys(sc.ai).length) throw new Error("the AI's answer couldn't be read");
    sc.step = "summary"; }
  catch (e) { sc.err = String(e && e.message || e).replace(/^Error:\s*/, ""); sc.step = "error"; }
  if ($("#modalHost .scan")) scanShow(sc);
}
async function scanSave(sc) {
  const today = new Date().toISOString().slice(0, 10); let docId = null;
  if (sc.photo) { try { const rec = blank("docs", { title: "Parts scan: " + sc.title, kind: "During photo", file: sc.photo.dataUrl, fileName: sc.photo.name || "parts-scan.jpg", folder: "Parts scans", tags: "parts scan",
      caption: `Parts laid out for the ${sc.title} scan`, notes: sc.parts.map(p => { const d = sc.dec[p.pid]; return `${p.ref}. ${p.name}: ${d.have === true ? "have" : d.have === false ? "missing" : "not checked"}${d.note ? " (" + d.note + ")" : ""}`; }).join("\n") });
    await store.put("docs", rec, { silent: true, action: "saved a parts scan photo" }); docId = rec.id; } catch (e) { toast("The photo couldn't be saved (storage may be full). Your marks are still saved.", "err"); } }
  const up = {}; sc.parts.forEach(p => { const d = sc.dec[p.pid], a = sc.ai[p.pid], old = haveGet(sc.did, p.pid);
    if (d.have === old.have && (d.note || "") === (old.note || "") && (d.got ?? null) === (old.got ?? null) && !a) return;
    up[p.pid] = { have: d.have === undefined ? null : d.have, note: d.note || null, got: d.got ?? null, seen: a ? a.seen : old.seen, scanAt: a || docId ? today : old.scanAt, scanDoc: docId || old.scanDoc }; });
  await haveSave(sc.did, up, "checked parts for " + sc.title);
  const h = haveStats(sc.did); sc.saved = h; sc.step = "done"; scanShow(sc);
}

/* ---- Parts page: what you have, what's missing, where to get it ---- */
function partsCheckHtml() {
  const ds = scanDiagrams(); let have = 0, miss = 0, total = 0; const rows = [], missing = [];
  ds.forEach(d => { const h = haveStats(d.id); have += h.have; miss += h.miss; total += h.total; rows.push([d, h]);
    if (h.miss) scanParts(d.id).forEach(p => { const x = haveGet(d.id, p.pid); if (x.have === false) missing.push([d, p, x]); }); });
  const checked = rows.filter(([, h]) => h.have || h.miss);
  const shops = ["cmsnl", "partzilla", "z1", "allballs"].filter(k => SHOPS[k]);
  return `<section class="stack pcheck" id="partsCheck"><div class="row" style="justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:8px"><div><h2 class="sec left" style="margin:0">Parts check</h2><p class="sec-sub" style="text-align:left;margin:4px 0 0">Every piece from the Suzuki diagrams, marked from your scans and checks.</p></div>${scanPickBtn("Scan a tray of parts", "btn pri")}</div>
    <div class="tcard stack"><div class="sclegend big"><span><i class="g"></i><b class="num">${have}</b> have</span><span><i class="r"></i><b class="num">${miss}</b> missing</span><span><i></i><b class="num">${total - have - miss}</b> not checked yet</span><span class="faint">of ${total} pieces in ${ds.length} diagrams</span></div>
      ${checked.length ? "" : `<p class="hint-text" style="text-align:left;margin:0">Nothing checked yet. Lay out a tray or bag of parts and press “Scan a tray of parts”, or open any diagram and use the ⚙ parts check.</p>`}</div>
    ${missing.length ? `<div class="tcard stack"><h3 class="vh">What's missing and where to get it (${missing.length})</h3><div class="pmiss">${missing.map(([d, p, x]) => `<div class="pmrow"><div class="grow"><b>${esc(p.name)}</b> <span class="faint">ref ${esc(p.ref)} · ${esc(d.title)}</span>${p.pn ? `<div class="mono">${esc(p.pn)}</div>` : ""}${x.note ? `<div class="hint-text" style="text-align:left">Note: ${esc(x.note)}</div>` : ""}</div>
        <div class="row" style="gap:4px;flex-wrap:wrap">${p.pn ? `<a class="btn sm" href="${cmsSearchUrl(p.pn)}" target="_blank" rel="noopener">CMSNL</a>` : ""}<a class="btn sm" href="${ebaySearchUrl(p.pn, p.name)}" target="_blank" rel="noopener">eBay</a><button class="btn sm" data-godiag2="${d.id}">Diagram</button></div></div>`).join("")}</div>
      <div class="hint-text" style="text-align:left">Your saved shops: ${shops.map(k => `<a href="${esc(SHOPS[k].url)}" target="_blank" rel="noopener">${esc(SHOPS[k].name)}</a>`).join(" · ")} · <button class="linkbtn" data-go="shops">all shops</button>. CMSNL search opens the exact Suzuki number; eBay is good for used and new-old-stock parts.</div></div>` : ""}
    <details class="tcard"${checked.length ? " open" : ""}><summary><b>By diagram</b> <span class="faint">(${checked.length} of ${ds.length} started)</span></summary><div class="pdiag">${rows.map(([d, h]) => `<div class="pdrow"><div class="grow"><b>${esc(d.title)}</b><div class="hbar"><i class="g" style="width:${h.total ? h.have / h.total * 100 : 0}%"></i><i class="r" style="width:${h.total ? h.miss / h.total * 100 : 0}%"></i></div><span class="faint">${h.have} have · ${h.miss} missing · ${h.open} to check</span></div><div class="row" style="gap:4px">${scanBtn(d.id, "Scan")}<button class="btn sm" data-godiag2="${d.id}">Diagram</button></div></div>`).join("")}</div></details></section>`;
}
document.addEventListener("click", e => { const b = e.target.closest("[data-godiag2]"); if (!b) return; DV.ret = R.sec === "lesson" ? "lesson-" + R.lesson : R.sec; DV.id = null; go("diagram-" + b.dataset.godiag2); });

/* ============ 2D technical diagram viewer ============
   Reusable for every diagram in DIAGRAMS: layered SVG (one <g> per component), zoom/pan, selection,
   hide/show, callouts, labels, status overlay, exploded/assembled switching, step sequences,
   source + verification metadata, workflow links, export. */
const DV = { id: null, view: "exploded", sel: null, hidden: new Set(), nums: true, labels: false, status: false, step: null, vb: null, pos: {}, tw: null, playing: false };
const diagById = id => DIAGRAMS.find(d => d.id === id);
const diagViews = d => ["exploded", "assembled"].filter(k => d.kinds.includes(k));
const VERIFY_LABEL = { names: ["Names verified", "Component names, references and relationships come from the GS750 (B) parts diagram. Shapes and proportions are drawn, not measured."], schematic: ["Schematic", "Shows how the parts relate. Shapes are representative; nothing here is measured."], unverified: ["Unverified", "Component names come from general construction of this part type, not from a GS750 (B) document. Check against the factory manual and parts diagram."] };
const verPill = v => `<span class="vpill v-${v}" title="${esc(VERIFY_LABEL[v][1])}">${esc(VERIFY_LABEL[v][0])}</span>`;

function diagLayout(d, view) {
  const out = {}; let cx = d.pad || 40, row = 0;
  const rows = d.rows || [d.vb[1] / 2];
  d.parts.forEach(p => {
    if (view === "assembled" && p.a) { out[p.k] = p.a.slice(); return; }
    if (p.e) { out[p.k] = p.e.slice(); return; }
    if (p.row != null && p.row !== row) { row = p.row; cx = d.pad || 40; }
    if (d.axis === "v") { out[p.k] = [rows[row], cx]; cx += (p.len || 30) + (p.gap ?? d.gap ?? 26); }
    else { out[p.k] = [cx, rows[row]]; cx += (p.len || 30) + (p.gap ?? d.gap ?? 26); }
  });
  return out;
}
function diagPartColor(p) { const r = p.part && S.parts[p.part]; return r ? partColor(r) : null; }
function diagSvg(d, opts = {}) {
  const pos = opts.pos || diagLayout(d, opts.view || "exploded"), stat = opts.status;
  const v = opts.view || "exploded", zs = d.parts.slice().sort((a, b) => (a.z || 0) - (b.z || 0));
  const parts = zs.map(p => { const i = d.parts.indexOf(p), [x, y] = pos[p.k]; const ph = (opts.view === "assembled" && p.phantom) ? " phantom" : "";
    const flt = opts.sel === p.k ? "url(#f-sel)" : stat && diagPartColor(p) ? `url(#f-${diagPartColor(p)})` : "";
    return `<g class="dp${ph}${opts.hidden && opts.hidden.has(p.k) ? " hid" : ""}${opts.dim && !opts.dim.includes(p.k) ? " dim" : ""}" data-k="${p.k}" transform="translate(${x.toFixed(2)},${y.toFixed(2)})"${flt ? ` filter="${flt}"` : ""}><title>${esc((i + 1) + ". " + p.name)}</title>${p.draw(v)}</g>`; }).join("");
  const order = d.parts.filter(p => !p.noCall);
  const calls = opts.nums === false ? "" : order.map(p => { if (opts.hidden && opts.hidden.has(p.k)) return ""; const n = diagLabel(d, p), [x, y] = pos[p.k], an = p.anchor || (p.len ? (d.axis === "v" ? [0, p.len / 2] : [p.len / 2, 0]) : [0, 0]), off = (opts.view === "assembled" ? p.ca : null) || p.co || [0, -40];
    const ax = x + an[0], ay = y + an[1], abs = opts.view === "assembled" ? p.caAt : p.ceAt, cxp = abs ? abs[0] : ax + off[0], cyp = abs ? abs[1] : ay + off[1], ox = cxp - ax, oy = cyp - ay, L = Math.hypot(ox, oy) || 1, ex = cxp - ox / L * 9, ey = cyp - oy / L * 9;
    return `<g class="dc${opts.sel === p.k ? " on" : ""}" data-k="${p.k}"><line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="${DK.ink}" stroke-width=".7" marker-end="url(#m-dot)"/><circle cx="${cxp.toFixed(1)}" cy="${cyp.toFixed(1)}" r="8.5" fill="#fff" stroke="${DK.ink}" stroke-width=".9"/><text x="${cxp.toFixed(1)}" y="${(cyp + 3.8).toFixed(1)}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="${String(n).length > 2 ? 8.5 : 10.5}" font-weight="700" fill="${DK.ink}">${n}</text>${opts.labels ? `<text x="${(cxp + (ox < 0 ? -13 : 13)).toFixed(1)}" y="${(cyp + 3.8).toFixed(1)}" text-anchor="${ox < 0 ? "end" : "start"}" font-family="Inter,Arial,sans-serif" font-size="10.5" fill="${DK.ink}" paint-order="stroke" stroke="${DSHEET}" stroke-width="3">${esc(p.short || p.name)}</text>` : ""}</g>`; }).join("");
  const arrows = opts.view !== "assembled" && opts.arrows !== false ? diagArrows(d, pos, opts) : "";
  const layer = (opts.view === "assembled" ? d.assembledExtra : d.explodedExtra) || (() => "");
  const vb = opts.vb || [0, 0, d.vb[0], d.vb[1]];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" class="dsvg" role="img" aria-label="${esc(d.title)}">${dkDefs()}<rect x="-5000" y="-5000" width="10000" height="10000" fill="${DSHEET}"/><g class="dall">${layer()}<g class="darrows">${arrows}</g><g class="dparts">${parts}</g><g class="dcalls">${calls}</g></g>${opts.titleBlock ? diagTitleBlock(d, vb) : ""}<g></g></svg>`;
}
/* Amber arrows on the exploded view: each part points the way it goes on.
   Hand-drawn diagrams point toward the part's assembled position; generated ones toward the main part. */
function diagArrows(d, pos, opts) {
  const asm = diagViews(d).includes("assembled") ? diagLayout(d, "assembled") : null;
  return d.parts.map(p => {
    if (opts.hidden && opts.hidden.has(p.k)) return "";
    const [x, y] = pos[p.k] || [0, 0], an = p.anchor || (p.len ? [p.len / 2, 0] : [0, 0]), ax = x + an[0], ay = y + an[1];
    let tx, ty;
    if (asm && p.a) { const [bx, by] = asm[p.k]; tx = bx + an[0]; ty = by + an[1];
      // hand-drawn parts move along the build axis: keep only the main direction of travel
      if (!d.gen) { if (Math.abs(tx - ax) > Math.abs(ty - ay)) ty = ay; else tx = ax; } }
    else if (p.toward && pos[p.toward]) { const m = d.parts.find(z => z.k === p.toward), [mx, my] = pos[p.toward], ma = m.anchor || [0, 0]; tx = mx + ma[0]; ty = my + ma[1]; }
    else return "";
    const dx = tx - ax, dy = ty - ay, L = Math.hypot(dx, dy); if (L < 46) return "";
    const ux = dx / L, uy = dy / L, hw = (p.w || p.len || 30) / 2, hh = (p.h || 30) / 2;
    const r0 = Math.min(Math.abs(ux) > .001 ? hw / Math.abs(ux) : 1e9, Math.abs(uy) > .001 ? hh / Math.abs(uy) : 1e9) + 6, len = Math.min(34, L * .35);
    if (r0 + len > L - 8) return "";
    const x1 = ax + ux * r0, y1 = ay + uy * r0, x2 = x1 + ux * len, y2 = y1 + uy * len;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${DK.arrow}" stroke-width="1.6" stroke-dasharray="5 3" marker-end="url(#m-go)"/>`;
  }).join("");
}
/* Drafting title block in the sheet's bottom-right corner */
function diagTitleBlock(d, vb) {
  const W = 300, H = 46, x = d.vb[0] - W - 14, y = d.vb[1] - H - 12;
  return `<g class="dtb" font-family="IBM Plex Mono,monospace" fill="${DK.fine}"><rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${DSHEET}" stroke="${DK.center}" stroke-width=".8"/><line x1="${x}" y1="${y + 22}" x2="${x + W}" y2="${y + 22}" stroke="${DK.center}" stroke-width=".6"/><line x1="${x + 86}" y1="${y}" x2="${x + 86}" y2="${y + H}" stroke="${DK.center}" stroke-width=".6"/>
    <text x="${x + 8}" y="${y + 15}" font-size="10.5" fill="${DK.ink}">${esc(d.fig || "")}</text><text x="${x + 94}" y="${y + 15}" font-size="10.5" fill="${DK.ink}">${esc(String(d.title).toUpperCase().slice(0, 30))}</text>
    <text x="${x + 8}" y="${y + 37}" font-size="9">REVORA</text><text x="${x + 94}" y="${y + 37}" font-size="9">${esc((d.blk ? "CMSNL " + d.blk + " · " : "") + "NOT TO SCALE")}</text></g>`;
}
function diagStatic(d, w) { // thumbnail / export / print (no interaction)
  return diagSvg(d, { view: d.thumb || "exploded", nums: !!w }).replace('class="dsvg"', `class="dsvg thumb"`);
}

/* ---------- page: catalogue + viewer ---------- */
const DIAG_SYSTEMS = ["Engine", "Fuel & air", "Electrical", "Brakes", "Chassis", "Body"];
const diagFitsB = d => !d.models || /GS750B|All 1977|^GS750$/.test(d.models);
let DIAG_ONLY_B = true;
VIEWS.diagrams = {
  render() {
    const d = R.diag && diagById(R.diag);
    if (!d) return `${pageHead("diagrams")}
      <div class="row dfilter"><span class="muted">${DIAGRAMS.length} diagrams, one for every page of the CMSNL catalogue.</span><span class="spacer"></span><div class="seg"><button class="${DIAG_ONLY_B ? "on" : ""}" data-donly="1">Fits the GS750B</button><button class="${DIAG_ONLY_B ? "" : "on"}" data-donly="0">All models</button></div></div>
      ${DIAG_SYSTEMS.map(sys => { const list = DIAGRAMS.filter(x => x.system === sys && (!DIAG_ONLY_B || diagFitsB(x))).sort((a, b) => (a.fig || "").localeCompare(b.fig || "")); if (!list.length) return ""; return `<section class="stack"><h2 class="sec left">${esc(sys)} <span class="faint" style="font-weight:500">(${list.length})</span></h2><div class="dgrid">${list.map(x => `<button class="dcard" data-diag="${x.id}">${D3_MODELS[x.id] && D3_THUMBS[x.id] ? `<div class="dthumb d3t"><img src="${D3_THUMBS[x.id]}" alt="3D model of the ${esc(x.title)}" loading="lazy"></div>` : `<div class="dthumb">${diagStatic(x)}</div>`}<div class="dmeta"><span class="mono faint">${esc(x.fig || "")}${x.blk ? " · " + esc(x.blk) : ""}</span><b>${esc(x.title)}</b><small>${x.parts.length} parts${x.models && !/^All/.test(x.models) ? " · " + esc(x.models) : ""}${x.steps ? ` · ${x.steps.length} steps` : ""}</small>${D3_MODELS[x.id] ? `<span class="vpill v-names">3D model</span>` : ""}${x.gen ? `<span class="vpill ${x.layoutMatched ? "v-names" : "v-schematic"}">${x.layoutMatched ? "Layout matched" : "Catalogue parts"}</span>` : verPill(x.verify)}</div></button>`).join("")}</div></section>`; }).join("")}
      ${CMS_PICTURE_ONLY.length ? `<section class="stack"><h2 class="sec left">Picture only on CMSNL</h2><div class="tcard"><ul class="dpend">${CMS_PICTURE_ONLY.map(p => `<li><b>${esc(p.title)}</b><span>${esc(p.models)}. CMSNL shows the drawing but no parts list, so there's nothing to number yet. <a href="${esc(p.url)}" target="_blank" rel="noopener">Open on CMSNL</a></span></li>`).join("")}</ul></div></section>` : ""}
      <details class="panel"><summary><b>How to add a new technical diagram</b></summary>${diagHowTo()}</details>`;
    if (d3On(d)) return d3PageHtml(d);
    if (DV.id !== d.id) { const v0 = diagViews(d)[0] || "exploded"; Object.assign(DV, { id: d.id, view: v0, sel: null, hidden: new Set(), step: null, vb: null, playing: false, pos: diagLayout(d, v0) }); }
    const st = meta().diagSteps?.[d.id] || {};
    return `<div class="dhead"><button class="linkbtn" data-diagback>${ic("back")} All diagrams</button><div class="dtitle"><span class="mono">${esc(d.fig)}</span><h1>${esc(d.title)}</h1>${verPill(d.verify)}</div>${D3_MODELS[d.id] ? `<div class="seg"><button data-d3mode2="3d">3D model</button><button class="on">2D drawing</button></div>` : ""}</div>
    <div class="dview">
      <div class="dmain"><div class="dtools" role="toolbar" aria-label="Diagram tools">
        ${diagViews(d).length > 1 ? `<div class="seg">${diagViews(d).map(k => `<button data-dv="${k}" class="${DV.view === k ? "on" : ""}">${k[0].toUpperCase() + k.slice(1)}</button>`).join("")}</div>` : ""}
        <span class="dt-g"><button class="tb" data-dz="in" title="Zoom in">+</button><button class="tb" data-dz="out" title="Zoom out">−</button><button class="tb" data-dz="fit" title="Fit">Fit</button></span>
        <label class="dchk"><input type="checkbox" id="dvNums" ${DV.nums ? "checked" : ""}> Numbers</label><label class="dchk"><input type="checkbox" id="dvLabels" ${DV.labels ? "checked" : ""}> Labels</label><label class="dchk"><input type="checkbox" id="dvStatus" ${DV.status ? "checked" : ""}> Restoration status</label>
        ${d.anim ? `<button class="tb" id="dvPlay">${DV.playing ? "Stop" : "Play"} ${esc(d.animLabel || "animation")}</button>` : ""}
        <button class="tb" id="dvReset">Reset</button><button class="tb" id="dvSvg">SVG</button><button class="tb" id="dvPng">PNG</button></div>
        <div class="dstage" id="dstage"><div class="dtbh"><b>${esc(d.fig || "")}</b><span>${esc(d.title)}</span><small>${d.blk ? "CMSNL " + esc(d.blk) + " · " : ""}Not to scale</small></div>${diagSvg(d, { view: DV.view, pos: DV.pos, sel: DV.sel, hidden: DV.hidden, nums: DV.nums, labels: DV.labels, status: DV.status, vb: DV.vb, dim: DV.step != null ? d.steps[DV.step].hl : null })}</div>
        ${d.steps ? `<div class="dsteps"><div class="row" style="justify-content:space-between;align-items:center"><b>${DV.step == null ? `${d.steps.length}-step sequence` : `Step ${DV.step + 1} of ${d.steps.length}: ${esc(d.steps[DV.step].t)}`}</b><span class="row" style="gap:6px">${DV.step != null ? `<button class="btn sm" id="dsExit">Leave steps</button>` : ""}<button class="btn sm" id="dsPrev" ${DV.step == null || DV.step === 0 ? "disabled" : ""}>${ic("back")} Previous</button><button class="btn sm pri" id="dsNext">${DV.step == null ? "Start" : DV.step === d.steps.length - 1 ? "Finish" : "Next"} ${ic("next")}</button></span></div>
          ${DV.step != null ? `<p style="margin:6px 0 0">${d.steps[DV.step].d}</p><div class="row" style="margin-top:6px">${st[DV.step] ? `<span class="pill green">Marked done by ${esc(st[DV.step].by)} · ${fmtTime(st[DV.step].at)}</span><button class="linkbtn" id="dsUndo">Undo</button>` : ME.canWrite ? `<button class="btn sm" id="dsDone">${ic("tick")} Mark this step done</button>` : ""}<span class="hint-text">Marking a step done doesn't approve the work. Approval still needs the inspection.</span></div>` : ""}
          ${d.seqNote ? `<p class="hint-text" style="text-align:left;margin:6px 0 0">${esc(d.seqNote)}</p>` : ""}<div class="dstepdots">${d.steps.map((s, i) => `<button class="${DV.step === i ? "on" : ""} ${st[i] ? "done" : ""}" data-ds="${i}" title="${esc(s.t)}">${i + 1}</button>`).join("")}</div></div>` : ""}
      </div>
      <aside class="dside">${diagSideHtml(d)}</aside></div>`;
  },
  bind(root) {
    $$("[data-donly]", root).forEach(b => b.onclick = () => { DIAG_ONLY_B = b.dataset.donly === "1"; render(true); });
    $$("[data-diag]", root).forEach(b => b.onclick = () => { R.diag = b.dataset.diag; DV.id = null; location.hash = "diagram-" + R.diag; render(true); window.scrollTo(0, 0); });
    $$("[data-diagback]", root).forEach(b => b.onclick = () => { d3Teardown(); R.diag = null; DV.id = null; DV.playing = false; location.hash = "diagrams"; render(true); });
    const d = R.diag && diagById(R.diag); if (!d) { d3Teardown(); return; }
    if (d3On(d)) { d3Bind(root, d); return; }
    d3Teardown(); $$("[data-d3mode2]", root).forEach(b => b.onclick = () => { D3.mode[d.id] = "3d"; render(true); });
    bindTables(root); diagBindStage(d);
    const re = () => render(false);
    $$("[data-dv]", root).forEach(b => b.onclick = () => { const vs = diagViews(d), v = b.dataset.dv === DV.view && vs.length > 1 ? vs.find(x => x !== DV.view) : b.dataset.dv; if (DV.step != null) { DV.step = null; if (DV.pre) { DV.hidden = DV.pre.hidden; DV.sel = DV.pre.sel; } DV.pre = null; } diagSetView(d, v); re(); });
    $$("[data-dz]", root).forEach(b => b.onclick = () => diagZoom(d, b.dataset.dz));
    $("#dvNums", root).onchange = e => { DV.nums = e.target.checked; diagRedraw(d); };
    $("#dvLabels", root).onchange = e => { DV.labels = e.target.checked; diagRedraw(d); };
    $("#dvStatus", root).onchange = e => { DV.status = e.target.checked; diagRedraw(d); };
    $("#dvReset", root).onclick = () => { DV.playing = false; DV.pre = null; const v0 = diagViews(d)[0] || "exploded"; Object.assign(DV, { sel: null, hidden: new Set(), step: null, vb: null, view: v0, pos: diagLayout(d, v0) }); re(); };
    $("#dvSvg", root).onclick = () => saveFile(`${d.id}.svg`, diagExport(d), "image/svg+xml");
    $("#dvPng", root).onclick = () => diagPng(d);
    const pl = $("#dvPlay", root); if (pl) pl.onclick = () => { DV.playing = !DV.playing; pl.textContent = `${DV.playing ? "Stop" : "Play"} ${d.animLabel || "animation"}`; if (DV.playing) { if (d.animView && DV.view !== d.animView) { DV.view = d.animView; DV.step = null; DV.pos = diagLayout(d, d.animView); render(false); } diagAnimate(d); } else diagRedraw(d); };
    // stepping is a mode you can leave at any time: leaving puts back the view, hidden parts and selection you had before
    const go2 = i => { if (i != null && i === DV.step) i = null;
      if (DV.step == null && i != null) DV.pre = { view: DV.view, hidden: new Set(DV.hidden), sel: DV.sel };
      DV.step = i; const s = i == null ? null : d.steps[i];
      if (s) { if (s.view && s.view !== DV.view) { DV.view = s.view; DV.refit = true; } diagTween(d, diagStepPos(d, s)); DV.hidden = new Set(s.hide || []); DV.sel = (s.hl && s.hl.length === 1) ? s.hl[0] : DV.sel; }
      else if (DV.pre) { const p = DV.pre; DV.pre = null; if (p.view !== DV.view) { DV.view = p.view; DV.refit = true; } DV.hidden = p.hidden; DV.sel = p.sel; diagTween(d, diagLayout(d, DV.view)); }
      re(); };
    const n = $("#dsNext", root); if (n) n.onclick = () => go2(DV.step == null ? 0 : DV.step >= d.steps.length - 1 ? null : DV.step + 1);
    const p = $("#dsPrev", root); if (p) p.onclick = () => go2(Math.max(0, DV.step - 1));
    const ex = $("#dsExit", root); if (ex) ex.onclick = () => go2(null);
    $$("[data-ds]", root).forEach(b => b.onclick = () => go2(+b.dataset.ds));
    const dn = $("#dsDone", root); if (dn) dn.onclick = async () => { const m = clone(meta()); m.diagSteps = Object.assign({}, m.diagSteps || {}); m.diagSteps[d.id] = Object.assign({}, m.diagSteps[d.id] || {}, { [DV.step]: { by: whoName(), at: nowISO() } }); await store.put("meta", m, { action: `marked step ${DV.step + 1} of ${d.fig} done` }); };
    const un = $("#dsUndo", root); if (un) un.onclick = async () => { const m = clone(meta()); m.diagSteps = Object.assign({}, m.diagSteps || {}); m.diagSteps[d.id] = Object.assign({}, m.diagSteps[d.id] || {}); delete m.diagSteps[d.id][DV.step]; await store.put("meta", m, { action: `un-marked step ${DV.step + 1} of ${d.fig}` }); };
    $$("[data-dp]", root).forEach(b => b.onclick = () => { DV.sel = b.dataset.dp === DV.sel ? null : b.dataset.dp; diagRedraw(d); diagSide(d); });
    $$("[data-dh]", root).forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.dh; DV.hidden.has(k) ? DV.hidden.delete(k) : DV.hidden.add(k); diagRedraw(d); diagSide(d); });
    $$("[data-pst]", root).forEach(b => b.onclick = async () => { const pid = b.dataset.pid; await quickSet("parts", pid, { status: b.dataset.pst }, `${S.parts[pid].name}: ${b.textContent.trim()}`); });
    const ap = $("#dApprove", root); if (ap) ap.onclick = () => approveInspection(ap.dataset.pid);
    const up = $("#dUpload", root); if (up) up.onclick = () => uploadPhotos({ partId: up.dataset.pid });
    $$("[data-ba]", root).forEach(r => r.oninput = () => { const w = r.closest(".bacomp"); w.style.setProperty("--x", r.value + "%"); });
  },
  teardown() { DV.playing = false; d3Teardown(); },
};
function diagStepPos(d, s) { const base = diagLayout(d, s.view || DV.view), out = Object.assign({}, base); Object.entries(s.pos || {}).forEach(([k, v]) => { const p = d.parts.find(x => x.k === k); if (!p) return; out[k] = v === "a" ? (p.a || base[k]).slice() : v === "e" ? diagLayout(d, "exploded")[k] : v.slice(); }); return out; }
function diagRedraw(d) {
  const host = $("#dstage"); if (!host) return;
  host.innerHTML = diagSvg(d, { view: DV.view, pos: DV.pos, sel: DV.sel, hidden: DV.hidden, nums: DV.nums, labels: DV.labels, status: DV.status, vb: DV.vb, dim: DV.step != null && d.steps ? d.steps[DV.step].hl : null });
  diagBindStage(d);
}
function diagSide(d) { const s = $(".dside"); if (s) { s.innerHTML = diagSideHtml(d); VIEWS.diagrams.bind(s.parentElement.parentElement); } }
function diagSetView(d, v) { DV.view = v; DV.step = null; DV.refit = true; diagTween(d, diagLayout(d, v)); $$("[data-dv]").forEach(b => b.classList.toggle("on", b.dataset.dv === v)); }
function diagTween(d, to, ms = 750) {
  const from = Object.assign({}, DV.pos), t0 = performance.now(), refit = DV.refit; DV.refit = false; cancelAnimationFrame(DV.tw);
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tick = now => { const k = Math.min(1, (now - t0) / ms), e = ease(k); const cur = {};
    Object.keys(to).forEach(key => { const a = from[key] || to[key], b = to[key]; cur[key] = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; });
    DV.pos = cur; const svg = $("#dstage svg"); if (svg) { d.parts.forEach(p => { const g = svg.querySelector(`.dp[data-k="${p.k}"]`); if (g) g.setAttribute("transform", `translate(${cur[p.k][0].toFixed(2)},${cur[p.k][1].toFixed(2)})`); g && g.classList.toggle("phantom", DV.view === "assembled" && !!p.phantom); }); if (k >= 1 || (now - t0) % 3 < 1) {} }
    if (k < 1) DV.tw = requestAnimationFrame(tick); else { DV.pos = to; if (refit) DV.refit = true; diagRedraw(d); } };
  DV.tw = requestAnimationFrame(tick);
}
function diagBindStage(d) {
  const host = $("#dstage"), svg = host && host.querySelector("svg"); if (!svg) return;
  const setVB = () => svg.setAttribute("viewBox", DV.vb.map(v => v.toFixed(2)).join(" "));
  if (!DV.vb || DV.refit) { const to = diagFitVB(svg, d), from = DV.vb; DV.refit = false;
    if (!from) { DV.vb = to; setVB(); }
    else { const t0 = performance.now(); const tick = now => { const k = Math.min(1, (now - t0) / 380), e = 1 - Math.pow(1 - k, 3); DV.vb = from.map((v, i) => v + (to[i] - v) * e); if (svg.isConnected) setVB(); if (k < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); } }
  const toSvg = (cx, cy) => { const r = svg.getBoundingClientRect(), s = Math.max(DV.vb[2] / r.width, DV.vb[3] / r.height), ox = (r.width * s - DV.vb[2]) / 2, oy = (r.height * s - DV.vb[3]) / 2; return [DV.vb[0] - ox + (cx - r.left) * s, DV.vb[1] - oy + (cy - r.top) * s, s]; };
  svg.onwheel = e => { e.preventDefault(); const [px, py] = toSvg(e.clientX, e.clientY); const pinch = e.ctrlKey, pad = e.deltaMode === 0 && (e.deltaX !== 0 || !Number.isInteger(e.deltaY) || Math.abs(e.deltaY) < 40);
    if (!pinch && pad) { const [, , s] = toSvg(0, 0); DV.vb[0] += e.deltaX * s; DV.vb[1] += e.deltaY * s; setVB(); return; }
    const f = Math.exp((pinch ? e.deltaY * .012 : Math.sign(e.deltaY) * .18)); const nw = Math.max(d.vb[0] * .06, Math.min(d.vb[0] * 3, DV.vb[2] * f)), k = nw / DV.vb[2];
    DV.vb = [px - (px - DV.vb[0]) * k, py - (py - DV.vb[1]) * k, DV.vb[2] * k, DV.vb[3] * k]; setVB(); };
  let drag = null;
  svg.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, vb: DV.vb.slice(), moved: false, g: e.target.closest(".dp,.dc") }; svg.setPointerCapture(e.pointerId); };
  svg.onpointermove = e => { if (!drag) return; const [, , s] = toSvg(0, 0), dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true; if (drag.moved) { DV.vb[0] = drag.vb[0] - dx * s; DV.vb[1] = drag.vb[1] - dy * s; setVB(); svg.style.cursor = "grabbing"; } };
  svg.onpointerup = e => { const was = drag; drag = null; svg.style.cursor = ""; if (!was || was.moved) return; const g = was.g; DV.sel = g ? (g.dataset.k === DV.sel ? null : g.dataset.k) : null; diagRedraw(d); diagSide(d); };
  svg.querySelectorAll(".dp").forEach(g => { g.onmouseenter = () => { if (DV.sel !== g.dataset.k && !g.getAttribute("filter")) g.setAttribute("filter", "url(#f-hov)"); }; g.onmouseleave = () => { if (g.getAttribute("filter") === "url(#f-hov)") g.removeAttribute("filter"); }; });
}
function diagFitVB(svg, d) { try { const g = svg.querySelector(".dall"), hid = [...svg.querySelectorAll(".dp.hid")]; hid.forEach(h => h.classList.remove("hid")); const b = g.getBBox(); hid.forEach(h => h.classList.add("hid")); const p = Math.max(b.width, b.height) * .05 + 12; if (b.width > 10 && b.height > 10) return [b.x - p, b.y - p, b.width + 2 * p, b.height + 2 * p]; } catch (e) {} return [0, 0, d.vb[0], d.vb[1]]; }
function diagZoom(d, how) { if (how === "fit") DV.refit = true; else { const k = how === "in" ? .8 : 1.25, cx = DV.vb[0] + DV.vb[2] / 2, cy = DV.vb[1] + DV.vb[3] / 2; DV.vb = [cx - DV.vb[2] * k / 2, cy - DV.vb[3] * k / 2, DV.vb[2] * k, DV.vb[3] * k]; } diagRedraw(d); }
function diagAnimate(d) { if (!DV.playing) return; const svg = $("#dstage svg"); if (svg && d.anim) d.anim(svg, performance.now() / 1000); requestAnimationFrame(() => diagAnimate(d)); }
function diagExport(d) { return diagSvg(d, { view: DV.view, pos: DV.pos, nums: DV.nums, labels: true, status: DV.status, hidden: DV.hidden, titleBlock: true, vb: [0, 0, d.vb[0], d.vb[1]] }).replace("<svg ", `<svg width="${d.vb[0] * 2}" height="${d.vb[1] * 2}" `).replace("</svg>", `<text x="12" y="${d.vb[1] - 12}" font-family="Arial" font-size="11" fill="#55595e">${esc(d.fig + " " + d.title)} · ${esc(VERIFY_LABEL[d.verify][0])} · Source: ${esc(d.source.label)}</text></svg>`); }
function diagPng(d) { const img = new Image(), url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(diagExport(d)); img.onload = () => { const c = document.createElement("canvas"); c.width = d.vb[0] * 2; c.height = d.vb[1] * 2; const g = c.getContext("2d"); g.fillStyle = DSHEET; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => b && b.arrayBuffer().then(buf => saveFile(`${d.id}.png`, new Uint8Array(buf), "image/png"))); }; img.src = url; }

/* Callout label: the catalogue ref on catalogue-backed diagrams (letters for tools and non-catalogue items), else the item number. */
function diagLabel(d, p) {
  if (!d.cms) return d.parts.indexOf(p) + 1;
  if (p.ref) return cmsBase(String(p.ref).split(/,\s*/)[0]);
  return String.fromCharCode(65 + d.parts.filter(x => !x.ref).indexOf(p));
}
/* ---------- side panel: parts list, selected part, workflow links, source ---------- */
function diagSideHtml(d) {
  const sp = DV.sel && d.parts.find(p => p.k === DV.sel), inv = sp && sp.part ? S.parts[sp.part] : null;
  const invIds = [...new Set([...(d.inv || []), ...d.parts.map(p => p.part).filter(Boolean)])].filter(id => S.parts[id]);
  const tasks = (d.tasks || []).map(id => S.tasks[id]).filter(Boolean), ins = invIds.flatMap(id => partInspections(id)), purs = invIds.flatMap(id => purchasesForPart(id));
  const docs = invIds.flatMap(id => docsFor("partId", id)), before = docs.filter(x => x.kind === "Before photo" && x.file && x.file.startsWith("data:image")), after = docs.filter(x => x.kind === "After photo" && x.file && x.file.startsWith("data:image"));
  let h = "";
  if (sp) h += `<div class="tcard stack sel-card"><div class="row" style="justify-content:space-between"><span class="eyebrow">${d.cms ? (sp.ref ? `Catalogue ref ${esc(sp.ref)}` : "Not a catalogue part") : `Item ${d.parts.indexOf(sp) + 1}${sp.ref ? ` · diagram ref ${esc(sp.ref)}` : ""}`}</span>${sp.verify ? verPill(sp.verify) : ""}</div><h2 class="vtitle">${esc(sp.name)}</h2>${sp.pn ? `<div class="pnrow"><span>Suzuki part no.</span><code>${sp.pn.map(fmtPn).join(", ")}</code></div>` : ""}${sp.cat ? `<small class="faint">Catalogue name: ${esc(sp.cat)}</small>` : ""}${sp.note ? `<p style="margin:0">${sp.note}</p>` : ""}
    ${inv ? `<div class="row" style="justify-content:space-between"><span><span class="mono">${inv.id}</span> ${esc(inv.name)}</span>${partPill(inv)}</div>${ME.canWrite ? `<div class="statusbtns">${[["Not started", "Untouched", "red"], ["In progress", "In progress", "amber"], ["Work complete", "Done, needs a check", "amber"]].map(([v, l, c]) => `<button class="sbtn ${inv.status === v ? "on" : ""}" data-pst="${v}" data-pid="${inv.id}"><i style="background:${COL[c]}"></i>${l}</button>`).join("")}</div><button class="btn sm tan" id="dApprove" data-pid="${inv.id}">${ic("shield")} Record inspection pass</button><p class="hint-text" style="text-align:left;margin:0">Restored & approved (green) needs the work complete <b>and</b> a passed inspection.</p>` : ""}<div class="row"><button class="btn sm" data-open="parts|${inv.id}">Open in inventory</button></div>` : `<p class="hint-text" style="text-align:left">Not linked to its own inventory record.</p>`}
    <div class="row">${askBtn(`In the "${d.title}" diagram for my 1977 GS750 I'm looking at the ${sp.name}${sp.ref ? ` (diagram ref ${sp.ref})` : ""}. What does it do, how does it come off and go back on, and what wear or damage should I look for?`, sp.name)}</div></div>`;
  if (!sp) h += `<div class="tcard stack"><h3 class="vh">Questions about this diagram?</h3><p class="hint-text" style="text-align:left;margin:0">Click a part for questions about it, or ask about the whole assembly.</p><div class="row">${askBtn(`Explain the "${d.title}" diagram for my 1977 GS750 like I'm new to this: what the assembly does, what order it comes apart and goes back together, and what usually wears out. Parts shown: ${d.parts.map(x => x.name).join(", ")}.`, d.title)}</div></div>`;
  h += `<div class="tcard stack"><h3 class="vh">Parts list</h3><ol class="dplist">${d.parts.map((p, i) => `<li class="${DV.sel === p.k ? "on" : ""} ${DV.hidden.has(p.k) ? "off" : ""}"><button class="dpl" data-dp="${p.k}"><i>${esc(diagLabel(d, p))}</i><span>${esc(p.name)}${p.ref ? `<small>ref ${esc(p.ref)}</small>` : ""}</span></button><button class="dpe" data-dh="${p.k}" title="${DV.hidden.has(p.k) ? "Show" : "Hide"}" aria-label="${DV.hidden.has(p.k) ? "Show" : "Hide"} ${esc(p.name)}">${ic(DV.hidden.has(p.k) ? "x" : "eye")}</button></li>`).join("")}</ol></div>`;
  h += diagCatHtml(d);
  h += `<div class="tcard stack"><h3 class="vh">Use it in the restoration</h3>
    <details open><summary>Parts (${invIds.length})</summary><div class="linklist">${invIds.map(id => `<button data-open="parts|${id}"><span class="mono faint">${id}</span><span class="grow">${esc(S.parts[id].name)}</span>${partPill(S.parts[id])}</button>`).join("")}</div></details>
    <details><summary>Tasks (${tasks.length})</summary><div class="linklist">${tasks.map(t => `<button data-open="tasks|${t.id}"><span class="mono faint">${t.id}</span><span class="grow">${esc(t.title)}</span>${taskPill(t)}</button>`).join("") || `<span class="faint">None</span>`}</div></details>
    <details><summary>Inspection checkpoints (${ins.length})</summary><div class="linklist">${ins.map(i => `<button data-open="inspections|${i.id}"><span class="grow">${esc(i.point)}</span>${resPill(i.result)}</button>`).join("") || `<span class="faint">None recorded</span>`}</div></details>
    ${d.tools ? `<details><summary>Tools</summary><p class="dlist">${d.tools.map(esc).join(" · ")}</p></details>` : ""}${d.supplies ? `<details><summary>Supplies</summary><p class="dlist">${d.supplies.map(esc).join(" · ")}</p></details>` : ""}
    <details><summary>Purchases (${purs.length})</summary><div class="linklist">${purs.map(x => `<button data-open="purchases|${x.id}"><span class="grow">${esc(x.item || x.id)}</span><span class="faint">${esc(x.status)}</span></button>`).join("") || `<span class="faint">None</span>`}</div></details>
    <details><summary>Workshop notes</summary><p class="dlist">${invIds.map(id => S.parts[id].notes).filter(Boolean).map(esc).join("<br>") || "No notes on these parts yet."}</p></details>
    <details ${before.length && after.length ? "open" : ""}><summary>Before & after photos (${before.length}/${after.length})</summary>${before.length && after.length ? `<div class="bacomp" style="--x:50%"><img src="${after[0].file}" alt="After"><img class="ba-b" src="${before[0].file}" alt="Before"><input type="range" min="0" max="100" value="50" data-ba aria-label="Compare before and after"><span class="ba-l">Before</span><span class="ba-r">After</span></div>` : `<p class="dlist">Add photos marked “Before photo” and “After photo” to these parts to compare them here.</p>`}${ME.canWrite && invIds[0] ? `<button class="btn sm" id="dUpload" data-pid="${invIds[0]}">${ic("image")} Add photos</button>` : ""}</details></div>`;
  h += `<div class="tcard stack"><h3 class="vh">Source & verification</h3><dl class="kv tight"><dt>Asset ID</dt><dd class="mono">${esc(d.id)}</dd><dt>Shows</dt><dd>${esc(d.assembly)}</dd><dt>Source</dt><dd><a href="${d.source.url}" target="_blank" rel="noopener">${esc(d.source.label)}</a></dd><dt>Fits</dt><dd>${esc(d.compat)}</dd><dt>Status</dt><dd>${verPill(d.verify)}</dd><dt>Notes</dt><dd>${d.notes}</dd></dl></div>`;
  return h;
}
function diagHowTo() {
  return `<ol class="tips num"><li><span>Pick one assembly and one model variant (GS750 (B), 1977, USA). Open its CMSNL diagram and list each item with its reference number.</span></li>
    <li><span>Add an entry to <span class="mono">DIAGRAMS</span> in <span class="mono">diag_data.js</span>: an asset ID, title, source URL, compatibility, verification status (<b>names</b>, <b>schematic</b> or <b>unverified</b>), linked inventory and task IDs, and notes about what is approximate.</span></li>
    <li><span>Give every component its own entry with a <span class="mono">draw()</span> function built from the kit in <span class="mono">diag_draw.js</span> (tubes, springs, bolts, washers, seals, section hatching). One component per entry keeps it selectable.</span></li>
    <li><span>Set exploded positions (or let the auto layout place them along the axis) and assembled positions. Mark outer parts <span class="mono">phantom</span> so inner parts show through in the assembled view.</span></li>
    <li><span>Only add steps that come from a documented order, and say where the order comes from. Never add torque values or clearances. Write VERIFY IN FACTORY SERVICE MANUAL.</span></li>
    <li><span>If you have a real photo or scan, attach it as a document on the part. Photos stay photos; don't redraw them as if they were factory drawings.</span></li></ol>`;
}

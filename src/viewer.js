/* ============ 3D Garage UI (digital twin) ============ */
const partPillPlain = p => `<span class="tip-dot" style="background:${COL[partColor(p)]}"></span>${esc(partStatusLabel(p))}`;
TW.open = new Set(["gs750"]); TW.notesTab = "about";
const confPill = c => { const [l, d] = TW_CONF[c] || TW_CONF.approx; return `<span class="cpill c-${c || "approx"}" title="${esc(d)}">${esc(l)}</span>`; };
const fmtMM = v => (v * 1000).toFixed(0);

/* ---------- tree (progressive disclosure: systems → assemblies → components → parts) ---------- */
function treeRows(n, depth) {
  const kids = n.children.filter(c => c.kind !== "hardware" || TW.open.has(n.id));
  const open = TW.open.has(n.id), p = n.partId ? S.parts[n.partId] : null, hasKids = n.children.length > 0 || (n.kind === "system" && pendingInternals(n).length);
  const dot = n.kind === "missing" ? `<i class="tdot miss"></i>` : `<i class="tdot" style="background:${COL[p ? partColor(p) : "gray"]};opacity:${p ? 1 : .35}"></i>`;
  let h = `<div class="trow ${TW.sel === n ? "on" : ""} ${n.kind === "missing" ? "miss" : ""} ${n.hidden && TW.userHidden && TW.userHidden.has(n) ? "hid" : ""}" style="--d:${depth}" data-tn="${esc(n.id)}" role="treeitem" aria-level="${depth + 1}" ${hasKids ? `aria-expanded="${open}"` : ""}>
    ${hasKids ? `<button class="tcar ${open ? "open" : ""}" data-tog="${esc(n.id)}" aria-label="${open ? "Collapse" : "Expand"}">${ic("chev")}</button>` : `<span class="tcar"></span>`}${dot}<span class="tname">${esc(n.name)}</span>${n.kind === "missing" ? `<em>not modeled</em>` : n.internal && n.kind === "assembly" ? `<em>schematic</em>` : ""}${n.hidden && TW.userHidden && TW.userHidden.has(n) ? `<em>hidden</em>` : ""}</div>`;
  if (open) { kids.forEach(c => h += treeRows(c, depth + 1)); if (n.kind === "system") pendingInternals(n).forEach(k => h += `<div class="trow pend" style="--d:${depth + 1}" data-pend="${k}"><span class="tcar"></span><i class="tdot" style="opacity:.35;background:var(--st-gray)"></i><span class="tname">${esc(TW_ASSY[k].label)}</span><em>inside · click to load</em></div>`); }
  return h;
}
const pendingInternals = sysNode => TW.internalsBuilt ? [] : Object.entries(TW_ASSY).filter(([, a]) => a.internal && a.sys === sysNode.id).map(([k]) => k);
function twinTree() {
  const host = $("#twTree"); if (!host || !TW.ok) return; const q = (TW.treeQ || "").toLowerCase().trim();
  let body;
  if (q) { const hits = [...TW.nodes.values()].filter(n => n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)).slice(0, 80);
    body = hits.length ? hits.map(n => `<div class="trow ${TW.sel === n ? "on" : ""} ${n.kind === "missing" ? "miss" : ""}" style="--d:0" data-tn="${esc(n.id)}"><span class="tcar"></span><i class="tdot" style="background:var(--st-gray);opacity:.4"></i><span class="tname">${esc(n.name)}<small>${esc(nodeAncestors(n).slice(1, -1).map(a => a.name).join(" › "))}</small></span></div>`).join("") : `<div class="empty">Nothing matches “${esc(q)}”.</div>`; }
  else body = treeRows(TW.bikeNode, 0);
  host.innerHTML = body;
  $$("[data-tog]", host).forEach(b => b.onclick = e => { e.stopPropagation(); const id = b.dataset.tog; TW.open.has(id) ? TW.open.delete(id) : TW.open.add(id); twinTree(); });
  $$("[data-tn]", host).forEach(r => { r.onclick = () => { const n = TW.nodes.get(r.dataset.tn); if (!n) return; if (n.kind === "missing") { select(n); return; } nodeAncestors(n).forEach(a => TW.open.add(a.id)); focusTo(n); };
    r.onmouseenter = () => { const n = TW.nodes.get(r.dataset.tn); if (n && n.kind !== "missing") { TW.hover = n; refreshLook(); } }; r.onmouseleave = () => { TW.hover = null; refreshLook(); }; });
  $$("[data-pend]", host).forEach(r => r.onclick = () => { const k = r.dataset.pend; ensureInternals(); const n = TW.nodes.get(k); if (n) { nodeAncestors(n).forEach(a => TW.open.add(a.id)); showInternals(n); focusTo(n); } });
}
function twinTreeSync() { if (TW.sel) nodeAncestors(TW.sel).slice(0, -1).forEach(a => TW.open.add(a.id)); twinTree(); const host = $("#twTree"), on = $("#twTree .trow.on");
  if (host && on) { const top = on.offsetTop - host.offsetTop; if (top < host.scrollTop || top > host.scrollTop + host.clientHeight - 30) host.scrollTop = Math.max(0, top - host.clientHeight / 3); } }

/* ---------- breadcrumb & action bar ---------- */
function crumbHtml() {
  const path = nodeAncestors(TW.sel || TW.ctx || TW.bikeNode);
  return path.map((n, i) => i === path.length - 1 ? `<b>${esc(n.name)}</b>` : `<button data-crumb="${esc(n.id)}">${esc(n.name)}</button>`).join(`<span class="sep">›</span>`);
}
function actionBarHtml() {
  const s = TW.sel, ex = TW.explodeNode, canInt = internalsFor(s || TW.bikeNode).length > 0;
  return `<div class="tw-actions" role="toolbar" aria-label="Model tools">
    <button class="tb" id="tBack" ${TW.focus.length ? "" : "disabled"} title="Put this part back and go up one level">${ic("back")}<span>Back</span></button>
    <button class="tb" id="tFull" ${TW.focus.length ? "" : "disabled"} title="Put everything back and show the whole motorcycle">${ic("bike")}<span>Full bike</span></button>
    <button class="tb ${TW.cleared ? "on" : ""}" id="tClear" ${!s && !TW.cleared ? "disabled" : ""} title="Move only the parts that block your view">${ic("move")}<span>${TW.cleared ? "Put back" : "Clear view"}</span></button>
    <button class="tb ${TW.explodeK > 0 ? "on" : ""}" id="tExp" title="Separate the selected assembly along its assembly directions">${ic("cube")}<span>${TW.explodeK > 0 ? "Collapse" : "Explode"}</span></button>
    <button class="tb ${TW.internalsOn ? "on" : ""}" id="tInt" ${canInt || TW.internalsOn ? "" : "disabled"} title="See inside: makes covers see-through and loads the internal parts">${ic("eye")}<span>${TW.internalsOn ? "Hide internals" : "Show internals"}</span></button>
    <button class="tb ${s && TW.userHidden && TW.userHidden.has(s) ? "on" : ""}" id="tHide" ${s && s !== TW.bikeNode ? "" : "disabled"} title="Hide the selected part. Click again to show it.">${ic(s && TW.userHidden && TW.userHidden.has(s) ? "eye" : "x")}<span>${s && TW.userHidden && TW.userHidden.has(s) ? "Show" : "Hide"}</span></button>
    <button class="tb" id="tUnhide" ${(TW.userHidden && TW.userHidden.size) ? "" : "disabled"}>${ic("undo")}<span>Restore hidden${TW.userHidden && TW.userHidden.size ? ` (${TW.userHidden.size})` : ""}</span></button>
    <button class="tb ${TW.labels ? "on" : ""}" id="tLabels" aria-pressed="${!!TW.labels}" title="Show or hide the numbered part labels">${ic("tag")}<span>${TW.labels ? "Labels on" : "Labels off"}</span></button>
    <button class="tb ${TW.moveMode ? "on" : ""}" id="tMove" title="Drag parts to move them anywhere">${ic("hand")}<span>${TW.moveMode ? "Moving parts" : "Move parts"}</span></button>
    <span class="tsep"></span>
    <button class="tb" id="tHome" ${TW.moved.size ? "" : "disabled"} title="Send every moved part back to its exact assembled position">${ic("back")}<span>Return to assembly</span></button>
    <button class="tb" id="tReset" title="Reset everything: positions, hidden parts, filters and camera">${ic("refresh")}<span>Reset model</span></button>
  </div>
  <div class="tw-anim">
    <label>Explode<input type="range" id="tExpK" min="0" max="100" value="${Math.round((TW.explodeStep == null ? TW.explodeK : 0) * 100)}" aria-label="Explode amount"></label>
    <span class="stepper"><button class="chip" id="tStepB" aria-label="Previous step">‹</button><span id="tStepL">${TW.explodeStep == null ? "Step" : `Step ${TW.explodeStep}/${(ex && ex._ex || []).length}`}</span><button class="chip" id="tStepF" aria-label="Next step">›</button></span>
  </div>`;
}
function bindActions(root) {
  const on = (id, fn) => { const b = $(id, root); if (b) b.onclick = fn; };
  on("#tMove", () => setMoveMode(!TW.moveMode)); on("#tLabels", () => { TW.labels = !TW.labels; updateLabels(); twinPanel(); }); on("#tBack", () => focusBack()); on("#tFull", () => focusExitAll());
  on("#tClear", () => TW.cleared ? unclearView() : clearView(TW.sel));
  on("#tExp", () => { const n = explodeTarget(); if (TW.explodeK > 0) setExplode(TW.explodeNode, 0, 600); else { setExplode(n, 1, 900); explodeFit(n, 900); } });
  on("#tInt", () => TW.internalsOn ? hideInternals() : showInternals(TW.sel || TW.bikeNode));
  on("#tHide", hideSelected); on("#tUnhide", restoreHidden); on("#tHome", () => { returnToAssembly(); setTimeout(twinPanel, 50); }); on("#tReset", resetModel);
  const k = $("#tExpK", root); if (k) k.oninput = () => setExplode(TW.explodeNode && TW.explodeK > 0 ? TW.explodeNode : explodeTarget(), k.value / 100, 160);
  on("#tStepF", () => { const n = TW.explodeNode && TW.explodeStep != null ? TW.explodeNode : explodeTarget(); n._ex = n._ex || explodeDirs(n); setExplode(n, 1, 650, Math.min((TW.explodeStep || 0) + 1, n._ex.length)); });
  on("#tStepB", () => { const n = TW.explodeNode; if (!n || TW.explodeStep == null) return; setExplode(n, 1, 650, Math.max(0, TW.explodeStep - 1)); });
  on("#tPause", () => { TW.paused = !TW.paused; twinPanel(); });
  const sp = $("#tSpeed", root); if (sp) sp.onchange = () => { TW.speed = +sp.value; };
  $$("[data-crumb]", root).forEach(b => b.onclick = () => focusTo(TW.nodes.get(b.dataset.crumb)));
}

/* ---------- info panel ---------- */
function partRecordHtml(pid) {
  const p = S.parts[pid]; if (!p) return `<div class="tcard"><h3 class="vh">Restoration record</h3><p class="hint-text">This piece isn't linked to an inventory record.</p></div>`;
  const ts = tasksForPart(pid), ins = partInspections(pid), purs = purchasesForPart(pid), docs = docsFor("partId", pid).filter(d => d.file && d.file.startsWith("data:image")), cost = partActualCost(pid);
  const meas = ins.filter(i => i.spec || i.min || i.max || i.actual);
  return `<div class="tcard stack"><h3 class="vh">Restoration record</h3>
    <div class="row" style="justify-content:space-between"><span><span class="mono">${esc(p.id)}</span> · ${esc(p.name)}</span>${partPill(p)}</div>
    <dl class="kv tight"><dt>Condition</dt><dd>${esc(p.condition || "—")}</dd><dt>Status</dt><dd>${esc(p.status || "—")}</dd><dt>Inspection</dt><dd>${esc(partInspectionState(p))}</dd>
      <dt>Stored</dt><dd>${esc([p.location, p.bin].filter(Boolean).join(" · ") || "Not recorded")}</dd><dt>Purchases</dt><dd>${purs.length ? purs.map(x => `${esc(x.item || x.id)} <span class="faint">(${esc(x.status)})</span>`).join(", ") : "None"}</dd>
      <dt>Actual cost</dt><dd>${money(cost)}</dd>${p.notes ? `<dt>Notes</dt><dd>${esc(p.notes)}</dd>` : ""}</dl>
    ${ME.canWrite ? `<div><div class="small-label">Where is this part at?</div>${statusButtons(p)}</div><button class="btn sm tan" id="iApprove">${ic("shield")} It passed inspection</button><p class="hint-text" style="text-align:left">Green only shows when the work is complete and the required inspection has passed.</p>` : ""}
    <details ${ts.length ? "" : ""}><summary>Tasks (${ts.length})</summary><div class="linklist">${ts.map(t => `<button data-open="tasks|${t.id}"><span class="mono faint">${t.id}</span><span class="grow">${esc(t.title)}</span>${taskPill(t)}</button>`).join("") || `<span class="faint">None linked</span>`}</div></details>
    <details><summary>Inspections & measurements (${ins.length})</summary><div class="linklist">${ins.map(i => `<button data-open="inspections|${i.id}"><span class="grow">${esc(i.point)}${i.spec || i.min || i.max ? `<small class="faint">spec ${esc(i.spec || "")} ${esc([i.min, i.max].filter(Boolean).join("–"))} ${esc(i.units || "")}${i.actual ? ` · actual ${esc(i.actual)}` : ""}</small>` : ""}</span>${resPill(i.result)}</button>`).join("") || `<span class="faint">None recorded</span>`}</div>${meas.length ? "" : `<p class="hint-text" style="text-align:left">Measurement limits come from the factory manual. Add them on the Measurements page.</p>`}</details>
    <details><summary>Photos (${docs.length})</summary>${docs.length ? `<div class="thumbs">${docs.slice(0, 8).map(d => `<img src="${d.file}" alt="${esc(d.title || "")}" data-open="docs|${d.id}">`).join("")}</div>` : `<span class="faint">No photos yet</span>`}</details>
    <div class="row"><button class="btn sm" data-open="parts|${p.id}">Open full record</button>${askBtn(`I'm looking at the ${p.name} on my 1977 GS750 in the 3D model. What should I check on it and what usually goes wrong?`, p.name, "btn sm ask")}</div></div>`;
}
function twinPanel() {
  const side = $("#vside"); const bar = $("#twBar"); const cr = $("#twCrumb");
  if (cr) { cr.innerHTML = crumbHtml(); bindActions(cr); }
  if (bar) { bar.innerHTML = actionBarHtml(); bindActions(bar); }
  const bk = $("#twBack"); if (bk) { const t = focusTop(); bk.hidden = !t; if (t) { const up = TW.focus.length > 1 ? TW.focus[TW.focus.length - 2].n.name : "full bike"; bk.innerHTML = `<button class="btn sm pri" id="bkBack">${ic("back")} Back to ${esc(up)}</button>${TW.focus.length > 1 ? `<button class="btn sm" id="bkFull">Full bike</button>` : ""}`; $("#bkBack", bk).onclick = () => focusBack(); const f = $("#bkFull", bk); if (f) f.onclick = () => focusExitAll(); } }
  const pop = $("#twOpts"); if (pop && !pop.hidden && !pop.contains(document.activeElement)) { pop.innerHTML = optionsHtml(); bindOptions(pop); }
  if (!side || !TW.ok) return; const st = side.scrollTop;
  const n = TW.sel, T = THREE;
  let h = "";
  if (!n) {
    const cnt = { red: 0, amber: 0, green: 0, gray: 0 }; PROTO.forEach(([, , pid]) => { const p = S.parts[pid]; cnt[p ? partColor(p) : "gray"]++; });
    h += `<div class="tcard stack"><div class="eyebrow">Nothing selected</div><h2 class="vtitle">Click a part on the bike</h2><p style="margin:0">It lifts out so you can look at it, and its details show up here.</p></div>
      <div class="tcard stack"><h3 class="vh">Restoration at a glance</h3><div class="lg">${["red", "amber", "green", "gray"].map(c => `<div class="lgrow"><span class="sw" style="background:${COL[c]}"></span><span style="flex:1">${esc(COLOR_LABEL[c])}</span><b class="num">${cnt[c]}</b></div>`).join("")}</div>
        <button class="btn sm" id="iColors">${TW.statusMode ? "Hide restoration colors" : "Show restoration colors on the bike"}</button></div>
      <div class="tcard stack"><h3 class="vh">Controls</h3><p class="hint-text" style="text-align:left;margin:0">${TW.nav === "orbit" ? "Drag or two-finger swipe to turn the bike, pinch to zoom." : "You move, the bike stays put. Drag or two-finger swipe to look around, pinch or scroll to walk closer, W A S D to walk."} Everything else is under <b>Options</b> in the top-right corner of the model.</p></div>`;
  } else {
    const a = nodeAssy(n), A = a ? TW_ASSY[a.assy] || {} : {}, box = n.kind !== "missing" ? nodeBox(n) : new T.Box3(), sz = box.isEmpty() ? null : box.getSize(new T.Vector3());
    const mats = new Set(); nodeMeshes(n).slice(0, 400).forEach(m => { const b = m.userData.real || m.material; b && b.name && mats.add(b.name); }); if (n.inst) mats.add(n.inst.im.userData.real.name);
    h += `<div class="tcard stack sel-card"><div class="row" style="justify-content:space-between"><span class="eyebrow">${esc(levelName(n.level))}${n.kind === "hardware" ? " · hardware" : ""}</span>${n.kind === "missing" ? `<span class="cpill c-miss">Not modeled</span>` : confPill(n.conf || (a && a.conf))}</div>
      <h2 class="vtitle">${esc(n.name)}</h2><div class="mono idline">${esc(n.id)}</div>
      ${n.parent ? `<div class="hint-text" style="text-align:left">Part of <button class="linkbtn" data-goto="${esc(n.parent.id)}">${esc(n.parent.name)}</button></div>` : ""}
      ${n.blurb ? `<p style="margin:0">${esc(n.blurb)}</p>` : ""}
      ${n.kind === "missing" ? `<div class="banner warn"><div class="grow">Listed in the parts diagram but <b>not modeled yet</b>, so it can't be inspected here. See “Add better models” below.</div></div>` : ""}
      ${(n.conf || a?.conf) === "schematic" ? `<div class="banner"><div class="grow">Schematic: placed to show how the parts relate. Sizes are not measured.</div></div>` : ""}
      ${n.secures ? `<div class="hint-text" style="text-align:left">Secures: ${esc(n.secures)}. Repeated fasteners share one shape but keep their own ID and position.</div>` : ""}
      ${n.children.length ? `<div class="hint-text" style="text-align:left">${n.children.filter(c => c.kind !== "missing").length} pieces inside${n.children.some(c => c.kind === "missing") ? ` · ${n.children.filter(c => c.kind === "missing").length} not modeled` : ""}. Click one of them in the model to pull it out.</div>` : ""}</div>`;
    const twD = twDiagsFor(n, A); if (twD.length) h += `<div class="tcard stack twdiag"><h3 class="vh">${ic("cube")} See the diagram</h3><p class="hint-text" style="text-align:left;margin:0">Open the parts diagram to take ${esc(n.name)} apart step by step and see every Suzuki part number.</p><div class="row" style="gap:6px;flex-wrap:wrap">${twD.map(d => `<button class="btn sm ${d === twD[0] ? "pri" : ""}" data-twdiag="${d.id}">${esc(d.title)}${D3_MODELS[d.id] ? "" : " (2D)"}</button>`).join("")}</div></div>`;
    if (n.kind !== "missing") h += `<div class="tcard stack"><h3 class="vh">Inspect</h3><div class="grid2">
        ${TW.focus.length ? `<button class="btn sm pri" id="iBack">${ic("back")} Back</button>` : `<button class="btn sm pri" id="iOut">Pull it out</button>`}<button class="btn sm" id="iFit">Zoom to it</button>
        <button class="btn sm" id="iExp">${TW.explodeNode === n && TW.explodeK > 0 ? "Collapse assembly" : "Explode assembly"}</button><button class="btn sm" id="iClr">${TW.cleared ? "Put parts back" : "Clear the view"}</button>
        <button class="btn sm" id="iInt" ${internalsFor(n).length || TW.internalsOn ? "" : "disabled"}>${TW.internalsOn ? "Hide internals" : "Show internals"}</button><button class="btn sm" id="iHide">${TW.userHidden && TW.userHidden.has(n) ? "Show it again" : "Hide selected"}</button></div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${["front", "rear", "left", "right", "top", "under"].map(v => `<button class="chip" data-iv="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join("")}</div></div>`;
    if (TW.explodeNode && TW.explodeK > 0 && TW.explodeNode._ex) h += `<div class="tcard stack"><h3 class="vh">Parts list · ${esc(TW.explodeNode.name)}</h3><ol class="plist">${TW.explodeNode._ex.map((it, i) => `<li><button data-goto="${esc(it.k.id)}"><i>${i + 1}</i>${esc(it.k.name)}</button></li>`).join("")}</ol><p class="hint-text" style="text-align:left">Numbers follow the separation order (outermost first). This is a viewing order, not the factory disassembly procedure.</p></div>`;
    h += partRecordHtml(nodePart(n));
    h += `<div class="tcard stack"><h3 class="vh">Model data</h3><dl class="kv tight">
      <dt>Size in model</dt><dd>${sz ? `${fmtMM(sz.x)} × ${fmtMM(sz.y)} × ${fmtMM(sz.z)} mm <span class="faint">(L × H × W, measured from this model, not verified)</span>` : "—"}</dd>
      <dt>Materials</dt><dd>${[...mats].slice(0, 8).map(esc).join(", ") || "—"}</dd>
      <dt>Parent assembly</dt><dd>${esc(a ? a.name : "—")}</dd>
      <dt>Diagram refs</dt><dd>${(A.d || []).map(d => `<a href="${diagUrl(d)}" target="_blank" rel="noopener">${esc(TW_DIAGRAM[d] || "Group " + d)}</a>`).join(", ") || "—"}</dd></dl></div>`;
  }
  side.innerHTML = h; side.scrollTop = st; bindPanel(side);
}
function displayOptsHtml() {
  return `<div class="opt-b two">
    <label class="switch"><input type="checkbox" id="dStatus" ${TW.statusMode ? "checked" : ""}><span></span>Restoration colors</label>
    ${TW.statusMode ? `<p class="hint-text" style="text-align:left"><b style="color:var(--st-red)">Red</b> untouched · <b style="color:var(--st-amber)">amber</b> in progress / awaiting inspection · <b style="color:var(--st-green)">green</b> complete and inspection passed · <b style="color:var(--st-gray)">gray</b> missing or not applicable.</p>` : ""}
    <div class="ofld"><label class="small-label" for="dFilter">Show only</label><select id="dFilter"><option value="">Everything</option>${[["red", "Untouched parts"], ["amber", "Work in progress"], ["failed", "Failed inspections"], ["gray", "Missing parts"], ["green", "Completed parts"]].map(([v, l]) => `<option value="${v}" ${TW.filter === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
    <div class="ofld"><label class="small-label" for="dSys">Subsystem</label><select id="dSys"><option value="">All systems</option>${TW_SYSTEMS.map(([id, nm]) => `<option value="${id}" ${TW.sysFilter === id ? "selected" : ""}>${esc(nm)}</option>`).join("")}</select></div>
    <label class="switch"><input type="checkbox" id="dFast" ${TW.fasteners ? "checked" : ""}><span></span>Show fasteners</label>
    <label class="switch"><input type="checkbox" id="dLabels" ${TW.labels ? "checked" : ""}><span></span>Labels</label>
    <label class="switch"><input type="checkbox" id="dIds" ${TW.techIds ? "checked" : ""}><span></span>Technical IDs on labels</label>
    <div class="ofld"><label class="small-label" for="dLight">Lighting</label><select id="dLight">${Object.entries(LIGHTS).map(([k, L]) => `<option value="${k}" ${TW.light === k ? "selected" : ""}>${L.label}</option>`).join("")}</select></div>
    <div class="ofld"><label class="small-label" for="dQual">Render quality</label><select id="dQual"><option value="high" ${TW.quality === "high" ? "selected" : ""}>High (soft shadows, sharp)</option><option value="perf" ${TW.quality === "perf" ? "selected" : ""}>Performance (laptops)</option></select></div>
    <div class="ofld"><label class="small-label" for="dPaint">Paint</label><select id="dPaint">${Object.entries(PAINTS).map(([k, v]) => `<option value="${v}" ${(+meta().paintHex || PAINTS["Candy blue"]) === v ? "selected" : ""}>${k}</option>`).join("")}</select></div>
    <div class="ofld"><label class="small-label" for="oSpeed">Animation speed</label><div class="row" style="gap:6px;flex-wrap:nowrap"><select id="oSpeed" style="flex:1">${[.25, .5, 1, 1.5, 2, 3].map(v => `<option value="${v}" ${TW.speed === v ? "selected" : ""}>${v}×</option>`).join("")}</select><button class="btn sm" id="oPause">${TW.paused ? "Resume animations" : "Pause animations"}</button></div></div>
    
    <div class="ofld ofull"><label class="small-label">Click selects</label><div class="seg sm" role="group">${[[2, "System"], [3, "Assembly"], [4, "Component"], [5, "Part"]].map(([l, t]) => `<button data-olvl="${l}" class="${TW.level === l ? "on" : ""}">${t}</button>`).join("")}</div></div>
  </div>`;
}
const OPT_TABS = [["display", "Display"], ["controls", "Moving around"], ["about", "About this model"], ["verify", "Verified vs approximate"], ["sources", "Source register"], ["add", "Add better models"]];
function controlsHtml() {
  return `<div class="opt-b"><label class="switch"><input type="checkbox" id="oMove" ${TW.moveMode ? "checked" : ""}><span></span>Move parts by dragging them</label>
    <p class="hint-text" style="text-align:left">With this on, drag any part to put it wherever you like. <b>Return to assembly</b> puts everything back exactly.</p>
    <ul class="howlist left"><li>${ic("rotate")}<span><b>Drag</b> ${TW.nav === "orbit" ? "to turn the bike" : "to look around"}</span></li><li>${ic("move")}<span><b>Right-drag</b> or two fingers to pan</span></li><li>${ic("zoom")}<span><b>Pinch</b> on the trackpad (fingers apart = closer, together = further) or use the mouse wheel. It zooms toward whatever is under the pointer.</span></li>
    <li>${ic("rotate")}<span><b>Two-finger swipe</b> ${TW.swipe === "pan" ? "slides you sideways and up or down. Hold <b>Shift</b> to look around instead." : TW.nav === "orbit" ? "turns around the bike. Hold <b>Shift</b> to slide instead." : "looks around, like turning your head. Hold <b>Shift</b> to slide instead."}</span></li>
    <li>${ic("cube")}<span><b>W A S D</b> or arrow keys fly forward, left, back, right. <b>Q / E</b> go down / up. Hold <b>Shift</b> to go faster. Click the model first so it has the keyboard.</span></li>
    <li>${ic("hand")}<span><b>Alt/Option-click</b> a spot, or hover and press <b>F</b>, to turn around that exact point</span></li><li>${ic("back")}<span><b>Esc</b> steps back out of a part</span></li></ul>
    <label class="small-label" for="oSwipe">Two-finger swipe on a trackpad</label><select id="oSwipe"><option value="orbit" ${TW.swipe !== "pan" ? "selected" : ""}>Turns around the bike</option><option value="pan" ${TW.swipe === "pan" ? "selected" : ""}>Slides the bike</option></select>
    <label class="small-label">Camera views</label><div class="row" style="gap:6px;flex-wrap:wrap">${[["iso", "3/4"], ["left", "Left"], ["right", "Right"], ["front", "Front"], ["rear", "Rear"], ["top", "Top"], ["low", "Low"], ["under", "Under"]].map(([v, l]) => `<button class="chip" data-oview="${v}">${l}</button>`).join("")}</div></div>`;
}
function optionsHtml() {
  const t = TW.optTab || "display";
  const body = t === "display" ? displayOptsHtml() : t === "controls" ? controlsHtml() : `<div class="opt-b notes tw-notes-body">${notesBody(t)}</div>`;
  return `<div class="opt-h"><b>Garage options</b><button class="x" id="oClose" aria-label="Close options">${ic("x")}</button></div><div class="opt-tabs" role="tablist">${OPT_TABS.map(([k, l]) => `<button role="tab" class="${t === k ? "on" : ""}" data-ot="${k}">${l}</button>`).join("")}</div>${body}`;
}
function openOptions(show) { const pop = $("#twOpts"); if (!pop) return; pop.hidden = show === undefined ? !pop.hidden : !show; if (!pop.hidden) { pop.innerHTML = optionsHtml(); bindOptions(pop); } pop.classList.toggle("wide", !["display", "controls"].includes(TW.optTab || "display")); $("#twGear") && $("#twGear").setAttribute("aria-expanded", String(!pop.hidden)); }
function bindOptions(root) {
  bindPanel(root);
  $$("[data-ot]", root).forEach(b => b.onclick = () => { TW.optTab = b.dataset.ot; root.innerHTML = optionsHtml(); bindOptions(root); root.classList.toggle("wide", !["display", "controls"].includes(TW.optTab)); root.scrollTop = 0; });
  const mv = $("#oMove", root); if (mv) mv.onchange = () => setMoveMode(mv.checked);
  const nv = $("#oNav", root); if (nv) nv.onchange = () => { TW.nav = nv.value; lsSet("gs750.nav", nv.value); TW.applyNav && TW.applyNav(); root.innerHTML = optionsHtml(); bindOptions(root); twinPanel(); };
  $$("[data-oview]", root).forEach(b => b.onclick = () => setView(b.dataset.oview));
  const sw = $("#oSwipe", root); if (sw) sw.onchange = () => { TW.swipe = sw.value; lsSet("gs750.swipe", sw.value); root.innerHTML = optionsHtml(); bindOptions(root); };
  const g = $("#nGlb", root); if (g) g.onclick = () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = ".glb,.gltf,model/gltf-binary"; inp.onchange = async () => { const f = inp.files[0]; if (f) loadGlbParts(await f.arrayBuffer(), f.name); }; inp.click(); };
  const c = $("#oClose", root); if (c) c.onclick = () => openOptions(false);
  const sp = $("#oSpeed", root); if (sp) sp.onchange = () => { TW.speed = +sp.value; };
  const pz = $("#oPause", root); if (pz) pz.onclick = () => { TW.paused = !TW.paused; pz.textContent = TW.paused ? "Resume animations" : "Pause animations"; };
  $$("[data-olvl]", root).forEach(b => b.onclick = () => { TW.level = +b.dataset.olvl; $$("[data-olvl]", root).forEach(x => x.classList.toggle("on", x === b)); });
  ['#dStatus'].forEach(id => { const el = $(id, root); if (el) el.addEventListener('change', () => { const pop = $('#twOpts'); pop.innerHTML = optionsHtml(); bindOptions(pop); }); });
}
function bindPanel(root) {
  bindTables(root);
  const on = (id, ev, fn) => { const el = $(id, root); if (el) el.addEventListener(ev, fn); };
  on("#iColors", "click", () => { TW.statusMode = !TW.statusMode; refreshLook(); twinPanel(); twinTree(); });
  on("#iBack", "click", () => focusBack()); on("#iOut", "click", () => focusInto(TW.sel)); on("#iFit", "click", () => fitCamera(TW.sel));
  on("#iExp", "click", () => { const n = TW.sel.children.filter(c => c.obj || c.inst).length > 1 ? TW.sel : explodeTarget(); if (TW.explodeNode === n && TW.explodeK > 0) setExplode(n, 0); else { setExplode(n, 1, 900); explodeFit(n, 900); } });
  on("#iClr", "click", () => TW.cleared ? unclearView() : clearView(TW.sel)); on("#iInt", "click", () => TW.internalsOn ? hideInternals() : showInternals(TW.sel)); on("#iHide", "click", hideSelected);
  $$("[data-iv]", root).forEach(b => b.onclick = () => viewAround(TW.sel, b.dataset.iv));
  $$("[data-goto]", root).forEach(b => b.onclick = () => select(TW.nodes.get(b.dataset.goto), { fit: true }));
  on("#iApprove", "click", () => approveInspection(nodePart(TW.sel)));
  $$("[data-pst]", root).forEach(b => b.onclick = async () => { const pid = nodePart(TW.sel); await quickSet("parts", pid, { status: b.dataset.pst }, `${S.parts[pid].name}: ${b.textContent.trim()}`); });
  on("#dStatus", "change", e => { TW.statusMode = e.target.checked; refreshLook(); twinPanel(); twinTree(); });
  on("#dFilter", "change", e => { TW.filter = e.target.value; refreshLook(); });
  on("#dSys", "change", e => { TW.sysFilter = e.target.value; refreshLook(); });
  on("#dFast", "change", e => { TW.fasteners = e.target.checked; TW.nodes.forEach(x => { if (x.hardwareGroup) x.obj.visible = TW.fasteners && !x.hidden; }); TW.need = true; });
  on("#dLabels", "change", e => { TW.labels = e.target.checked; updateLabels(); });
  on("#dIds", "change", e => { TW.techIds = e.target.checked; updateLabels(); });
  on("#dLight", "change", e => setLighting(e.target.value)); on("#dQual", "change", e => setQuality(e.target.value));
  on("#dPaint", "change", async e => { const hex = +e.target.value; setPaint(TW.bike, hex, meta().stripe || "gold", meta().frameFinish || "Gloss black"); refreshLook(); if (ME.canWrite) { const m = clone(meta()); m.paintHex = hex; await store.put("meta", m, { action: "changed the 3D paint color" }); } });
}
function viewAround(n, v) { const tgt = n ? nodeCenter(n) : new THREE.Vector3(0, .58, 0), r = n ? Math.max(.12, nodeBox(n).getSize(new THREE.Vector3()).length() * 1.15) : 3; const d = new THREE.Vector3(...VIEWS3D[v === "under" ? "under" : v]).normalize(); camTo(tgt.clone().add(d.multiplyScalar(r)), tgt); }

/* ---------- model notes (what is verified, sources, how to add better models) ---------- */
function notesBody(tab) {
  const counts = { nodes: TW.nodes.size, hw: [...TW.nodes.values()].filter(n => n.kind === "hardware").length, miss: [...TW.nodes.values()].filter(n => n.kind === "missing").length };
  let body = "";
  if (tab === "about") body = `<p>This is a procedural model built in the browser with Three.js. It is organized as a real assembly: <b>10 systems, ${Object.keys(TW_ASSY).filter(k => !TW_ASSY[k].internal).length} exterior assemblies and ${Object.keys(TW_ASSY).filter(k => TW_ASSY[k].internal).length} internal assemblies</b>, each with a stable ID, parent, original position and a link to your inventory record. ${TW.ok ? `Right now it holds <b>${counts.nodes}</b> tracked nodes, including <b>${counts.hw}</b> individually tracked fasteners and <b>${counts.miss}</b> “not modeled” placeholders.` : ""}</p>
    <p><b>What it is not:</b> it isn't factory CAD or a 3D scan. No dimension in it has been measured from a real GS750 or taken from the service manual. Overall size follows the published wheelbase, overall dimensions, tire sizes and bore/stroke; everything else is estimated from photos and parts diagrams. Internal parts are schematic. Don't use it for machining, ordering or torque values.</p>
    <p><b>Model designation:</b> GS750 (B), 1977, USA (E03). Parts-diagram groups for the GS750C, N, E and EC were ignored.</p>`;
  if (tab === "verify") body = `<table class="t"><thead><tr><th>Item</th><th>Value used</th><th>Source</th></tr></thead><tbody>${TW_SPECS.map(([a, b, c, u]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td><td>${u ? `<a href="${u}" target="_blank" rel="noopener">${esc(c)}</a>` : esc(c)}</td></tr>`).join("")}</tbody></table>
    <h3 class="vh" style="margin-top:14px">Confidence by assembly</h3><div class="confgrid">${Object.entries(TW_ASSY).map(([k, a]) => `<div><span>${esc(a.label || (PROTO.find(p => p[0] === k) || [])[1] || k)}</span>${confPill(a.conf)}</div>`).join("")}</div>
    <h3 class="vh" style="margin-top:14px">Listed in diagrams but not modeled</h3><ul class="tips">${Object.entries(TW_MISSING).map(([k, l]) => `<li><span><b>${esc((TW_ASSY[k]?.label) || (PROTO.find(p => p[0] === k) || [])[1] || k)}:</b> ${l.map(esc).join(", ")}</span></li>`).join("")}</ul>`;
  if (tab === "sources") body = `<table class="t"><thead><tr><th>Source</th><th>Used for</th></tr></thead><tbody>${TW_SOURCES.map(([t, u, w]) => `<tr><td><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></td><td>${esc(w)}</td></tr>`).join("")}</tbody></table>
    <h3 class="vh" style="margin-top:14px">Parts-diagram groups per assembly</h3><div class="confgrid">${Object.entries(TW_ASSY).map(([k, a]) => `<div><span>${esc(a.label || (PROTO.find(p => p[0] === k) || [])[1] || k)}</span><span>${(a.d || []).map(d => `<a href="${diagUrl(d)}" target="_blank" rel="noopener">${esc(TW_DIAGRAM[d] || d)}</a>`).join(", ")}</span></div>`).join("")}</div>`;
  if (tab === "add") body = `<ol class="tips num"><li><span><b>Model one component at a time</b> in Blender or CAD, in metres, with the same axes as this model: +X forward, +Y up, +Z to the rider's left, origin on the ground under the bike's centre.</span></li>
    <li><span><b>Name each object with the component ID</b> shown in the info panel (for example <span class="mono">carbs.carb-1.float-bowl</span> or <span class="mono">head</span> for a whole assembly).</span></li>
    <li><span><b>Export as GLB</b> with PBR materials (metal/roughness). Keep repeated bolts as instances.</span></li>
    <li><span><b>Load it below.</b> Any object whose name matches an ID replaces that node's built-in shape and keeps its selection, status color, explode and isolate behaviour. Unmatched objects are listed so you can rename them.</span></li>
    <li><span>Update the confidence in the source register once a part is checked against the factory manual and real measurements.</span></li></ol>
    <div class="row"><button class="btn sm" id="nGlb" ${TW.ok ? "" : "disabled"}>Load a GLB with named parts…</button>${TW.glbReport ? `<span class="hint-text">${esc(TW.glbReport)}</span>` : ""}</div>`;
  return body;
}
function loadGlbParts(buf, name) {
  if (!THREE.GLTFLoader) { toast("The model loader didn't load.", "err"); return; }
  new THREE.GLTFLoader().parse(buf, "", gltf => { let matched = 0; const unmatched = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(o => { if (!o.name || o === gltf.scene) return; const n = TW.nodes.get(o.name); if (!n) { if (o.isMesh) unmatched.push(o.name); return; }
      if (!n.obj) return; matched++; nodeMeshes(n).forEach(m => m.visible = false); const holder = o.clone(true); holder.matrixAutoUpdate = true; o.matrixWorld.decompose(holder.position, holder.quaternion, holder.scale);
      n.obj.attach(holder); holder.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.userData.real = m.material; mkNode({ id: `${n.id}.glb.${slug(m.name || "mesh")}`, name: (m.name || "GLB mesh") + " (GLB)", level: Math.min(5, n.level + 1), kind: "part", obj: m, parent: n, assy: n.assy, conf: "approx" }); orig(TW.nodes.get(`${n.id}.glb.${slug(m.name || "mesh")}`) || {}); } }); });
    TW.glbReport = `${name}: ${matched} node(s) replaced${unmatched.length ? `, ${unmatched.length} unmatched (${unmatched.slice(0, 5).join(", ")}${unmatched.length > 5 ? "…" : ""})` : ""}.`;
    toast(TW.glbReport); refreshLook(); twinTree(); const h = $("#twOpts"); if (h && !h.hidden) { h.innerHTML = optionsHtml(); bindOptions(h); } }, err => toast("Couldn't read that file as GLB: " + (err && err.message || "unknown error"), "err"));
}

/* ---------- page ---------- */
function statusButtons(p) {
  const opts = [["Not started", "Not started", "red"], ["In progress", "Working on it", "amber"], ["Awaiting parts", "Waiting for parts", "amber"], ["Work complete", "Done, needs a check", "amber"], ["Missing", "Missing", "gray"]];
  return `<div class="statusbtns" role="group" aria-label="Set where this part is at">${opts.map(([v, l, c]) => `<button class="sbtn ${p.status === v ? "on" : ""}" data-pst="${v}"><i style="background:${COL[c]}"></i>${l}</button>`).join("")}</div>`;
}
VIEWS.viewer = {
  render() {
    const fallback = !window.THREE || !THREE.RoundedBoxGeometry || !webglOK() || TW.forceFallback;
    if (fallback) return `${pageHead("viewer")}<div class="fallback-wrap"><img src="img/hero.svg" alt="1977 Suzuki GS750 illustration" class="fb-hero"><div class="banner warn"><div class="grow"><b>The interactive 3D model can't run on this device</b> (WebGL is off or the 3D files didn't load). You can still open every assembly from this list.</div></div>
      <div class="fallback">${PROTO.map(([k, l, pid]) => { const p = S.parts[pid], c = p ? partColor(p) : "gray"; return `<button data-open="parts|${pid}"><i class="dot" style="background:${COL[c]}"></i><span>${esc(l)}</span><small>${p ? esc(partStatusLabel(p)) : ""}</small></button>`; }).join("")}</div></div>
      <section class="tw-notes"><div class="tw-notes-body">${notesBody("about")}</div></section>`;
    return `<h1 class="sr-only">3D garage</h1>
    <div class="twin">
      <aside class="tw-tree"><div class="tw-tree-h"><input type="search" id="twQ" placeholder="Find a part or ID…" value="${esc(TW.treeQ || "")}" aria-label="Find a part"></div><div id="twTree" role="tree" class="tw-tree-b"><div class="loading"><span class="spinner"></span>Building…</div></div></aside>
      <div class="tw-main"><div class="tw-crumb" id="twCrumb"></div>
        <div class="stage" id="stage"><div class="loading"><span class="spinner"></span>Building the 3D model…</div>
          <div class="hud">${[["iso", "3/4"], ["left", "Left"], ["right", "Right"], ["front", "Front"], ["rear", "Rear"], ["top", "Top"], ["low", "Low"]].map(([v, l]) => `<button class="chip" data-view="${v}">${l}</button>`).join("")}</div>
          <button class="tw-gear tw-fs" id="twFull" title="Full screen">${ic("expand")}<span>Full screen</span></button>
          <button class="tw-gear" id="twGear" aria-haspopup="true" aria-expanded="false" title="Garage options">${ic("gear")}<span>Options</span></button>
          <div class="tw-opts" id="twOpts" hidden role="dialog" aria-label="Garage options"></div>
          <div class="tw-back" id="twBack" hidden></div>
          <div class="labels"></div><div class="tip" hidden></div></div>
        <div class="tw-bar" id="twBar"></div></div>
      <aside class="vside tw-info" id="vside"></aside></div>
    `;
  },
  bind(root) {
    bindTables(root);
    const stage = $("#stage", root); if (!stage) return;
    const gear = $("#twGear", root); if (gear) gear.onclick = e => { e.stopPropagation(); openOptions(); };
    const fsb = $("#twFull", root); if (fsb) fsb.onclick = () => toggleFull();
    if (!TW.fsHook) { TW.fsHook = () => syncFull(); document.addEventListener("fullscreenchange", TW.fsHook); document.addEventListener("webkitfullscreenchange", TW.fsHook); }
    if (!TW.docClick) { TW.docClick = e => { const pop = $("#twOpts"); if (pop && !pop.hidden && !e.target.closest("#twOpts,#twGear")) openOptions(false); }; document.addEventListener("pointerdown", TW.docClick); }
    const q = $("#twQ", root); q.oninput = () => { TW.treeQ = q.value; twinTree(); };
    setTimeout(() => { if (!initTwin(stage)) { TW.forceFallback = true; render(true); return; } stage.querySelector(".loading")?.remove();
      $$("[data-view]", stage).forEach(b => b.onclick = () => setView(b.dataset.view)); twinTree(); twinPanel(); 
      if (TW.pending) { const k = TW.pending; TW.pending = null; const nn = TW.nodes.get(k); if (nn) setTimeout(() => { select(nn); isolate(nn); }, 350); } }, 30);
  },
  live() { if (!TW.ok || !TW.el || !TW.el.isConnected) return false; refreshLook(); if (!document.activeElement || !document.activeElement.closest || !document.activeElement.closest("#vside,.tw-tree")) { twinPanel(); twinTree(); } return true; },
  teardown() { const m = $(".tw-main"); if (m && isFull() && !m.classList.contains("pseudo-full")) { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} } document.body.classList.remove("tw-fullon"); teardownTwin(); },
};
function openIn3D(groupKey) { if (R.sec === "viewer" && TW.ok) { const n = TW.nodes.get(groupKey); if (!n) return; if (TW.isolated) restoreIsolation(true); select(n); isolate(n); } else { TW.pending = groupKey; go("viewer"); } }
function twinEscape() { if (!TW.ok) return false; const m = $(".tw-main"); if (m && m.classList.contains("pseudo-full") && !TW.focus.length && !TW.internalsOn && !TW.cleared) { toggleFull(); return true; } if (TW.isolated) { restoreIsolation(); return true; } if (TW.internalsOn) { hideInternals(); return true; } if (TW.cleared) { unclearView(); return true; } if (TW.sel) { select(null); return true; } return false; }
const _go = go;
go = function (sec, f) { if (R.sec === "viewer" && sec !== "viewer") teardownTwin(); _go(sec, f); };
function partFinderLinks(p) { return shopLinksFor(p).map(s => `<a class="shoplink" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}<span>${esc(s.short)}</span></a>`).join(""); }

function setMoveMode(on) { TW.moveMode = !!on; if (TW.el) TW.el.classList.toggle("moving", TW.moveMode); twinPanel(); const pop = $("#twOpts"); if (pop && !pop.hidden) { pop.innerHTML = optionsHtml(); bindOptions(pop); }
  toast(TW.moveMode ? "Move mode on: drag any part. Return to assembly puts it all back." : "Move mode off: click parts to pull them out again."); }

/* full screen: just the model, its toolbar and the corner buttons. Uses the browser's full screen when allowed, otherwise fills the window. */
function isFull() { const m = $(".tw-main"); return !!m && (document.fullscreenElement === m || document.webkitFullscreenElement === m || m.classList.contains("pseudo-full")); }
function syncFull() { const m = $(".tw-main"), b = $("#twFull"); if (!m || !b) return; const on = isFull(); document.body.classList.toggle("tw-fullon", on); b.innerHTML = `${ic(on ? "shrink" : "expand")}<span>${on ? "Exit full screen" : "Full screen"}</span>`; b.title = on ? "Exit full screen (Esc)" : "Full screen"; TW.need = true; }
function toggleFull() {
  const m = $(".tw-main"); if (!m) return;
  if (isFull()) { if (m.classList.contains("pseudo-full")) m.classList.remove("pseudo-full"); else (document.exitFullscreen || document.webkitExitFullscreen).call(document); syncFull(); return; }
  const req = m.requestFullscreen || m.webkitRequestFullscreen; const fallback = () => { m.classList.add("pseudo-full"); syncFull(); };
  if (!req) { fallback(); return; } try { const r = req.call(m); if (r && r.catch) r.then(syncFull).catch(fallback); else setTimeout(() => { if (!isFull()) fallback(); }, 300); } catch (e) { fallback(); }
}

/* 3D garage -> parts diagrams: the assembly's CMSNL pages, best name match first */
function twDiagsFor(n, A) {
  const ids = []; let a = n; while (a) { const AA = TW_ASSY[a.assy] || (a === n ? A : null); if (AA && AA.d) AA.d.forEach(b => ids.includes(b) || ids.push(b)); a = a.parent; }
  (A && A.d || []).forEach(b => ids.includes(b) || ids.push(b));
  const words = s => String(s || "").toLowerCase().replace(/[^a-z ]/g, " ").split(/\s+/).filter(w => w.length > 3).map(w => w.replace(/s$/, ""));
  const nw = new Set(words(n.name)); const score = d => words(d.title).filter(w => nw.has(w)).length;
  const ds = ids.map(b => (typeof DIAGRAMS !== "undefined" ? DIAGRAMS : []).find(x => x.blk === "BLCK" + String(b).padStart(4, "0"))).filter(Boolean);
  return ds.map((d, i) => [d, score(d), i]).sort((x, y) => y[1] - x[1] || x[2] - y[2]).map(x => x[0]);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-twdiag]"); if (!b) return; DV.ret = "viewer"; DV.id = null; go("diagram-" + b.dataset.twdiag); });

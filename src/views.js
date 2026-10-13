/* ============ charts (inline SVG, drawn to scale) ============ */
const COL = { red: "var(--st-red)", amber: "var(--st-amber)", green: "var(--st-green)", gray: "var(--st-gray)", navy: "var(--navy-2)", tan: "var(--tan-2)", blue: "var(--blue)" };
function hbars(rows, opts = {}) {
  // HTML bars: rows [{label, segs:[{v,color,name}], right}] on one shared scale; optional reference line (e.g. budget)
  const max = opts.max || Math.max(1, ...rows.map(r => r.segs.reduce((s, x) => s + x.v, 0)), opts.line || 0);
  const w = v => Math.max(0, Math.min(100, v / max * 100));
  return `<div class="hb" role="img" aria-label="${esc(opts.aria || "bar chart")}" style="--lw:${opts.lw || 130}px">${rows.map(r => { const tot = r.segs.reduce((s, x) => s + x.v, 0); return `<div class="hb-row"><span class="hb-l">${esc(r.label)}</span><span class="hb-t">${r.segs.map(sg => sg.v > 0 ? `<i style="width:${w(sg.v)}%;background:${sg.color}" title="${esc((sg.name || "") + " " + (opts.money ? money(sg.v) : sg.v))}"></i>` : "").join("")}${opts.line ? `<b class="hb-line" style="left:${w(opts.line)}%"></b>` : ""}</span><span class="hb-v num">${esc(r.right ?? (opts.money ? money(tot) : String(tot)))}</span></div>`; }).join("")}${opts.line ? `<div class="hb-row hb-cap"><span></span><span class="hb-t" style="background:none;height:auto"><span style="position:absolute;left:${w(opts.line)}%;transform:translateX(-${w(opts.line) > 70 ? 100 : 0}%);white-space:nowrap">${esc(opts.lineLabel || "")}</span></span><span></span></div>` : ""}</div>`;
}
const legend = items => `<div class="legend">${items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join("")}</div>`;

/* ============ setup / empty project ============ */
function setupPanel() {
  // Public website (no shared database): load the workbook automatically so visitors land on the real site.
  if (ME.mode !== "shared" && !window.__autoSeed) { window.__autoSeed = 1; setTimeout(() => loadBaseline(false, true), 0); return `<div class="ph"><div><h1>Loading the project…</h1><p>Setting up the restoration workbook in this browser.</p></div></div>`; }
  return `<div class="ph"><div><h1>Set up Revora</h1><p>The project database is empty. Load your restoration workbook to start: 93 tasks across phases A–N, 49 parts, 22 inspections, 16 quality gates, 20 pre-start safety checks, the module procedures, sources and maintenance items.</p></div></div>
  <div class="panel blue stack"><div class="row"><button class="btn pri" id="loadBase">${ic("download")} Load the restoration workbook</button><button class="btn" id="importJson">Import a JSON backup instead</button></div>
  <div id="loadProg" class="muted"></div>
  <p class="muted" style="margin:0">${ME.mode === "shared" ? "Records go into this page's shared database, so everyone you share the page with sees the same data." : "This copy is running without the shared database, so records are saved in this browser only."}</p></div>`;
}
async function loadBaseline(replace, quiet) {
  const prog = $("#loadProg"); let data;
  try { const r = await fetch("baseline.json", { cache: "no-store" }); if (!r.ok) throw 0; data = await r.json(); }
  catch (e) { toast("Couldn't load the workbook file. Use Import JSON backup instead.", "err"); if (quiet) render(true); return; }
  const writes = [];
  Object.entries(data).forEach(([c, rows]) => rows.forEach(rec => { if (replace || !S[c][rec.id]) writes.push({ c, rec }); }));
  if (!writes.length) { toast("Everything in the workbook is already loaded."); return; }
  prog && (prog.textContent = `Writing 0 of ${writes.length} records…`);
  await store.bulk(writes, (d, t) => { if (prog) prog.textContent = `Writing ${d} of ${t} records…`; });
  if (!quiet) { logActivity("meta", { id: "project", name: "Project" }, null, "loaded the restoration workbook (" + writes.length + " records)"); toast("Loaded " + writes.length + " records from the workbook"); }
  render(true);
}
function importJson(mode) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "application/json,.json";
  inp.onchange = async () => {
    const f = inp.files[0]; if (!f) return; let data;
    try { data = JSON.parse(await f.text()); } catch (e) { toast("That file isn't valid JSON.", "err"); return; }
    if (data && data.collections) data = data.collections;
    const known = Object.keys(data || {}).filter(k => COLLS.includes(k));
    if (!known.length) { toast("No GS750 HQ records found in that file.", "err"); return; }
    const writes = []; known.forEach(c => { const rows = Array.isArray(data[c]) ? data[c] : Object.values(data[c]); rows.forEach(rec => rec && rec.id && writes.push({ c, rec })); });
    confirmBox(`Import ${writes.length} records?`, `<p style="margin:0">Records with the same ID will be overwritten with the file's version. Records not in the file are kept.</p>`, "Import", async () => {
      await store.bulk(writes, (d, t) => setSave("busy", d + "/" + t)); toast("Imported " + writes.length + " records"); render(true);
    }, false);
  };
  inp.click();
}
function bindSetup(root) { $("#loadBase", root) && ($("#loadBase", root).onclick = () => loadBaseline(false)); $("#importJson", root) && ($("#importJson", root).onclick = () => importJson()); }
const isEmptyProject = () => !Object.keys(S.tasks).length && !Object.keys(S.parts).length;

/* ============ OVERVIEW ============ */
function partCounts() {
  const ps = sorted("parts"); const c = { total: ps.length, red: 0, amber: 0, green: 0, gray: 0, awaiting: 0, inwork: 0, missdam: 0 };
  ps.forEach(p => { const k = partColor(p); c[k]++; if (k === "amber") { if (p.status === "Work complete") c.awaiting++; else c.inwork++; } if (n(p.qtyMissing) > 0 || n(p.qtyDamaged) > 0 || p.status === "Missing" || ["Damaged", "Unusable", "Missing"].includes(p.condition)) c.missdam++; });
  return c;
}
function exampleBanner() { const ex = COLLS.reduce((s, c) => s + all(c).filter(r => r.example).length, 0); return ex ? `<div class="banner warn"><div class="grow"><b>${ex} example records are mixed in.</b> They're marked EXAMPLE and aren't your restoration data. Remove them in Settings when you're done exploring.</div><button class="btn sm" data-go="settings">Settings</button></div>` : ""; }

VIEWS.overview = {
  render() {
    if (isEmptyProject()) return setupPanel();
    const m = meta(), pc = partCounts(), f = finance(), prog = overallProgress(), cur = currentPhase();
    const ts = sorted("tasks"), open = ts.filter(t => !tasksClosed(t)), overdue = ts.filter(isOverdue), safety = safetyUnresolved();
    const kpi = (label, v, sub, color, goSec, filt) => `<button class="kpi ${color || ""}" data-go="${goSec}${filt ? "|" + esc(JSON.stringify(filt)) : ""}"><span class="l">${esc(label)}</span><span class="v">${v}</span>${sub ? `<span class="s">${sub}</span>` : ""}</button>`;
    const stCounts = TASK_STATUS.map(s => [s, ts.filter(t => t.status === s).length]);
    const modRows = Object.keys(MODULES).filter(k => k !== "general").map(k => { const p = sorted("parts").filter(x => x.module === k), t = ts.filter(x => x.module === k && x.status !== "Cancelled"); const tp = t.length ? t.filter(tasksDone).length / t.length : 0; const pp = p.length ? p.filter(x => partColor(x) === "green").length / p.length : 0; return { label: MODULES[k], segs: [{ v: Math.round(tp * 100), color: COL.navy, name: "Tasks complete %" }], right: pct(tp) + " · " + p.filter(x => partColor(x) === "green").length + "/" + p.length + " parts" }; });
    const rec = recommendedTasks(5);
    const t0 = today(), soon = addDays(t0, 21);
    const deadlines = [...ts.filter(t => t.due && !tasksClosed(t) && t.due <= soon).map(t => ({ d: t.due, c: "tasks", id: t.id, t: t.title, k: "Task due" })),
      ...sorted("purchases").filter(p => p.expected && ["Ordered", "Shipped"].includes(p.status) && p.expected <= soon).map(p => ({ d: p.expected, c: "purchases", id: p.id, t: p.description, k: "Delivery" })),
      ...sorted("purchases").filter(p => p.returnBy && p.returnBy >= t0 && p.returnBy <= soon).map(p => ({ d: p.returnBy, c: "purchases", id: p.id, t: p.description, k: "Return by" })),
      ...sorted("issues").filter(i => i.target && !["Resolved", "Closed"].includes(i.status) && i.target <= soon).map(i => ({ d: i.target, c: "issues", id: i.id, t: i.description, k: "Issue target" }))].sort((a, b) => a.d.localeCompare(b.d)).slice(0, 8);
    const act = sorted("activity").sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 10);
    return `<div class="row center"><button class="btn sm" data-new="tasks">${ic("plus")} Task</button><button class="btn sm" data-new="parts">${ic("plus")} Part</button><button class="btn sm" data-new="expenses">${ic("dollar")} Log expense</button><button class="btn sm tan" id="qPhoto">${ic("image")} Upload photo</button></div>
    <div class="panel"><div class="row" style="justify-content:space-between"><h2 class="sec left" style="margin:0">Restoration progress</h2><span class="num" style="font-family:var(--f-cond);font-size:20px;font-weight:600">${pct(prog)}</span></div>
      <div class="progress" style="margin-top:8px" role="progressbar" aria-valuenow="${Math.round(prog * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${prog * 100}%;background:var(--st-green)"></i></div>
      <p class="muted" style="margin:6px 0 0;font-size:12px">Completed task hours as a share of all estimated task hours. Parts: ${pc.green} of ${pc.total} restored and approved.</p></div>
    <div class="kpis">
      ${kpi("Parts cataloged", pc.total, "in inventory", "", "inventory", {})}
      ${kpi("Restored & approved", pc.green, "work + inspection passed", "green", "inventory", { color: "green" })}
      ${kpi("Untouched", pc.red, "not started", "red", "inventory", { color: "red" })}
      ${kpi("Being worked on", pc.inwork, "in progress / awaiting parts", "amber", "inventory", { flag: "inwork" })}
      ${kpi("Awaiting inspection", pc.awaiting, "work done, not approved", "amber", "inventory", { flag: "awaiting" })}
      ${kpi("Missing or damaged", pc.missdam, "qty or condition flagged", "gray", "inventory", { flag: "missdam" })}
      ${kpi("Open tasks", open.length, ts.length + " total", "", "tasks", { flag: "open" })}
      ${kpi("Overdue tasks", overdue.length, overdue.length ? "past due date" : "none overdue", overdue.length ? "red" : "", "tasks", { flag: "overdue" })}
      ${kpi("Safety issues open", safety, "critical issues, failed checks", safety ? "red" : "green", "gates", {})}
      ${kpi("Actual spending", money(f.paid), "paid expenses", "", "budget", {})}
      ${kpi("Committed", money(f.committed), "ordered or invoiced, unpaid", "", "purchasing", {})}
      ${kpi("Budget remaining", money(f.remaining), "of " + money(f.total) + " incl. contingency", f.remaining < 0 ? "red" : "", "budget", {})}
      ${kpi("Forecast total", money(f.forecast), "paid + committed + planned", f.forecast > f.total ? "red" : "", "budget", {})}
      ${kpi("Labor hours", (Math.round(f.hours * 10) / 10).toLocaleString(), "logged work sessions", "", "team", {})}
    </div>
    <div class="grid g3">
      <div class="panel stack"><h2 class="sec">Spending vs budget</h2>${hbars([{ label: "Paid", segs: [{ v: f.paid, color: COL.navy, name: "Paid" }] }, { label: "Committed", segs: [{ v: f.committed, color: COL.tan, name: "Committed" }] }, { label: "Planned", segs: [{ v: f.planned, color: COL.blue, name: "Planned" }] }, { label: "Forecast", segs: [{ v: f.paid, color: COL.navy, name: "Paid" }, { v: f.committed, color: COL.tan, name: "Committed" }, { v: f.planned, color: COL.blue, name: "Planned" }] }], { money: 1, lw: 80, line: f.total, lineLabel: "Budget " + money(f.total), aria: "Spending versus budget" })}</div>
      <div class="panel stack"><h2 class="sec">Completion by subsystem</h2>${hbars(modRows, { max: 100, lw: 170, aria: "Task completion by subsystem" })}</div>
      <div class="panel stack"><h2 class="sec">Task status</h2>${hbars([{ label: "All tasks", segs: stCounts.map(([s, v]) => ({ v, color: COL[TASK_COLOR[s]] || COL.gray, name: s })), right: ts.length + "" }], { lw: 70, aria: "Task status" })}
        <div class="legend">${stCounts.filter(x => x[1]).map(([s, v]) => `<span><i style="background:${COL[TASK_COLOR[s]]}"></i>${esc(s)} ${v}</span>`).join("")}</div></div>
    </div>
    <div class="grid g3">
      <div class="panel stack"><h2 class="sec">Next recommended tasks</h2>${rec.length ? `<div class="linklist">${rec.map(t => `<button data-open="tasks|${t.id}"><span class="mono faint">${t.id}</span><span class="grow">${esc(t.title)}</span>${t.safety === "Critical" ? sevPill("Critical") : ""}</button>`).join("")}</div><p class="muted" style="margin:0;font-size:12px">All prerequisites complete; ordered by phase, then priority.</p>` : `<div class="empty">No tasks are ready. Check blocked tasks.</div>`}</div>
      <div class="panel stack"><h2 class="sec">Upcoming deadlines</h2>${deadlines.length ? `<div class="linklist">${deadlines.map(d => `<button data-open="${d.c}|${d.id}"><span class="mono faint" style="width:76px">${fmtDate(d.d).replace(/, \d{4}/, "")}</span><span class="grow">${esc(d.t)}</span><span class="tag">${d.k}</span></button>`).join("")}</div>` : `<div class="empty"><b>No dates in the next 3 weeks</b>Give tasks due dates and orders expected-delivery dates to see them here.</div>`}</div>
      <div class="panel stack"><h2 class="sec">Recent team activity</h2>${act.length ? `<div class="feed">${act.map(a => `<div><time>${fmtTime(a.ts)}</time><span><b>${esc(a.by)}</b> ${esc(a.summary)} ${SCHEMA[a.coll] && S[a.coll]?.[a.rid] ? `<button class="btn sm" data-open="${a.coll}|${esc(a.rid)}">${esc(a.rid)}</button>` : `<span class="mono faint">${esc(a.rid)}</span>`}</span></div>`).join("")}</div>` : `<div class="empty">Changes by the team show up here.</div>`}</div>
    </div>`;
  },
  bind(root) { bindSetup(root); bindTables(root); $("#qPhoto", root) && ($("#qPhoto", root).onclick = () => uploadPhotos({})); }
};

/* ============ INVENTORY ============ */
const invSel = new Set();
function filteredParts() {
  const f = fstate("inventory"); const q = (f.q || "").toLowerCase();
  return sorted("parts").concat(f.arch ? all("parts").filter(p => p.archived) : []).filter(p => {
    if (q && ![p.id, p.name, p.oemPn, p.location, p.bin, p.subsystem, p.category].join(" ").toLowerCase().includes(q)) return false;
    if (f.module && p.module !== f.module) return false; if (f.subsystem && p.subsystem !== f.subsystem) return false;
    if (f.status && p.status !== f.status) return false; if (f.condition && p.condition !== f.condition) return false;
    if (f.assignee && p.assignee !== f.assignee) return false; if (f.color && partColor(p) !== f.color) return false;
    if (f.flag === "inwork" && !(partColor(p) === "amber" && p.status !== "Work complete")) return false;
    if (f.flag === "awaiting" && !(partColor(p) === "amber" && p.status === "Work complete")) return false;
    if (f.flag === "missdam" && !(n(p.qtyMissing) > 0 || n(p.qtyDamaged) > 0 || p.status === "Missing" || ["Damaged", "Unusable", "Missing"].includes(p.condition))) return false;
    return true;
  });
}
const PART_COLS = () => [
  { k: "id", label: "ID", get: p => `<span class="mono">${esc(p.id)}</span>` },
  { k: "name", label: "Part", get: p => `<b style="font-weight:500">${esc(p.name)}</b>${p.oemPn ? `<div class="mono faint">${esc(p.oemPn)}${p.pnVerified ? "" : " · unverified"}</div>` : ""}`, cls: "wrap" },
  { k: "subsystem", label: "Subsystem" },
  { k: "status", label: "Status", get: partPill, sort: p => ["red", "amber", "green", "gray"].indexOf(partColor(p)) },
  { k: "condition", label: "Condition" },
  { k: "qty", label: "Found / exp.", get: p => `<span class="num">${n(p.qtyFound)} / ${n(p.qtyExpected)}</span>${n(p.qtyMissing) ? ` <span class="pill red plain">${n(p.qtyMissing)} missing</span>` : ""}`, sort: p => n(p.qtyFound) - n(p.qtyExpected) },
  { k: "insp", label: "Inspection", get: p => resPill(partInspectionState(p)), sort: p => partInspectionState(p) },
  { k: "location", label: "Location / bin", get: p => esc([p.location, p.bin].filter(Boolean).join(" · ")) || `<span class="faint">—</span>` },
  { k: "assignee", label: "Assigned", get: p => refName("team", p.assignee), sort: p => S.team[p.assignee]?.name || "" },
  { k: "priority", label: "Priority", sort: p => PRI_RANK[p.priority] ?? 9 },
  { k: "estCost", label: "Est. cost", get: p => `<span class="num">${n(p.estCost) ? money(p.estCost) : "—"}</span>`, sort: p => n(p.estCost), cls: "r" },
  { k: "actual", label: "Actual", get: p => { const a = partActualCost(p.id); return `<span class="num">${a ? money(a) : "—"}</span>`; }, sort: p => partActualCost(p.id), cls: "r" },
];
VIEWS.inventory = {
  render() {
    const rows = filteredParts(), f = fstate("inventory"), view = R.view.inventory || "cards";
    const subs = [...new Set(all("parts").map(p => p.subsystem).filter(Boolean))].sort();
    return `<div class="ph"><div><h1>Parts inventory</h1><p>${sorted("parts").length} parts cataloged. Part numbers stay blank until verified against the parts fiche for this exact bike.</p></div>
      <div class="act"><button class="btn" id="invCsv">${ic("download")} Export CSV</button><button class="btn" id="invPrint">Printable list</button><button class="btn pri" data-new="parts">${ic("plus")} Add part</button></div></div>
      ${filterBar("inventory", [{ k: "q", type: "search", label: "Search name, part no., ID, location" }, { k: "module", label: "Module", opts: optsOf(Object.keys(MODULES), MODULES) }, { k: "subsystem", label: "Subsystem", opts: optsOf(subs) },
        { k: "color", label: "Color status", opts: Object.entries(COLOR_LABEL) }, { k: "status", label: "Status", opts: optsOf(PART_STATUS) }, { k: "condition", label: "Condition", opts: optsOf(SCHEMA.parts.fields.find(x => x.k === "condition").opts) }, { k: "assignee", label: "Assigned", opts: teamOpts() },
        { k: "flag", label: "Flag", opts: [["inwork", "Being worked on"], ["awaiting", "Awaiting inspection"], ["missdam", "Missing or damaged"]] }, { k: "arch", label: "Archived", opts: [["1", "Include archived"]] }])}
      <div class="row"><span class="muted">${rows.length} shown</span><span class="spacer"></span>
        ${invSel.size ? `<span class="pill blue plain">${invSel.size} selected</span><select id="bulkField" aria-label="Field to bulk update"><option value="status">Set status</option><option value="assignee">Set assignee</option><option value="location">Set location</option><option value="module">Set module</option><option value="cleaning">Set cleaning</option><option value="priority">Set priority</option></select><span id="bulkValHost"></span><button class="btn sm pri" id="bulkApply">Apply</button><button class="btn sm" id="bulkClear">Clear selection</button>` : (view === "table" ? `<span class="faint" style="font-size:12.5px">Tick rows to update many at once.</span>` : "")}
        <div class="tabs"><button class="${view === "cards" ? "on" : ""}" data-iv="cards">Pictures</button><button class="${view === "table" ? "on" : ""}" data-iv="table">Table</button></div></div>
      ${view === "cards" ? (rows.length ? `<div class="cards">${rows.map(p => `<button class="card" data-open="parts|${p.id}"><div class="pimg">${partImg(p)}</div><b style="font-size:15px">${esc(p.name)}</b><div class="row">${partPill(p)}<span class="mono faint">${p.id}</span></div><div class="row muted" style="font-size:12px"><span>${esc(p.subsystem)}</span><span>·</span><span>${esc(p.condition)}</span><span>·</span><span>${n(p.qtyFound)}/${n(p.qtyExpected)}</span></div>${p.location || p.bin ? `<div class="faint" style="font-size:12px">${esc([p.location, p.bin].filter(Boolean).join(" · "))}</div>` : ""}</button>`).join("")}</div>` : `<div class="empty"><b>No parts match</b>Clear filters or add a part.</div>`)
        : table("inv", rows, PART_COLS(), { coll: "parts", select: invSel, emptyTitle: "No parts match these filters", defSort: { k: "id", dir: "asc" } })}`;
  },
  bind(root) {
    bindTables(root); bindFilters(root, "inventory");
    $$("[data-iv]", root).forEach(b => b.onclick = () => { R.view.inventory = b.dataset.iv; lsSet("gs750.route", { sec: R.sec, tab: R.tab, view: R.view }); render(false); });
    $$("[data-sel]", root).forEach(c => c.onchange = () => { c.checked ? invSel.add(c.dataset.sel) : invSel.delete(c.dataset.sel); render(false); });
    const sa = $("[data-selall]", root); if (sa) sa.onchange = () => { filteredParts().forEach(p => sa.checked ? invSel.add(p.id) : invSel.delete(p.id)); render(false); };
    const bf = $("#bulkField", root);
    const vh = () => { const k = bf.value; const fd = SCHEMA.parts.fields.find(x => x.k === k); $("#bulkValHost").innerHTML = fd.type === "select" ? `<select id="bulkVal" aria-label="New value">${(fd.opts).map(o => `<option value="${esc(o)}">${esc(fd.lbl ? fd.lbl[o] : o)}</option>`).join("")}</select>` : fd.type === "ref" ? `<select id="bulkVal" aria-label="New value"><option value="">— none —</option>${teamOpts().map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select>` : `<input id="bulkVal" aria-label="New value" placeholder="New value" style="padding:4px 6px">`; };
    if (bf) { vh(); bf.onchange = vh;
      $("#bulkApply").onclick = async () => { const k = bf.value, v = $("#bulkVal").value, ids = [...invSel]; await store.bulk(ids.map(id => ({ c: "parts", rec: Object.assign(clone(S.parts[id]), { [k]: v }) })));
        logActivity("parts", { id: ids.length + " parts", name: "bulk" }, null, `bulk-set ${k} = ${v} on ${ids.join(", ")}`); toast(`Updated ${ids.length} parts`); invSel.clear(); render(false); };
      $("#bulkClear").onclick = () => { invSel.clear(); render(false); }; }
    $("#invCsv").onclick = () => saveFile("gs750-inventory-" + today() + ".csv", csvOf(filteredParts(), [{ k: "id", label: "ID" }, { k: "name", label: "Name" }, { k: "oemPn", label: "OEM part no." }, { label: "Part no. verified", get: p => p.pnVerified ? "Yes" : "No" }, { k: "category", label: "Category" }, { k: "subsystem", label: "Subsystem" }, { k: "parent", label: "Parent" },
      { k: "qtyExpected", label: "Qty expected" }, { k: "qtyFound", label: "Qty found" }, { k: "qtyServiceable", label: "Qty serviceable" }, { k: "qtyDamaged", label: "Qty damaged" }, { k: "qtyMissing", label: "Qty missing" }, { k: "condition", label: "Condition" }, { k: "status", label: "Restoration status" }, { label: "Color status", get: p => COLOR_LABEL[partColor(p)] },
      { label: "Inspection", get: partInspectionState }, { k: "cleaning", label: "Cleaning" }, { k: "replacement", label: "Replacement required" }, { k: "classification", label: "Classification" }, { k: "location", label: "Location" }, { k: "bin", label: "Bin" }, { label: "Assigned", get: p => S.team[p.assignee]?.name || "" },
      { label: "Linked tasks", get: p => tasksForPart(p.id).map(t => t.id) }, { label: "Linked purchases", get: p => purchasesForPart(p.id).map(x => x.id) }, { k: "estCost", label: "Est. cost" }, { label: "Actual cost", get: p => partActualCost(p.id) }, { k: "workRequired", label: "Work required" }, { k: "notes", label: "Notes" }, { k: "createdAt", label: "Created" }, { k: "updatedAt", label: "Updated" }]), "text/csv");
    $("#invPrint").onclick = () => { const rows = filteredParts(); const html = `<!doctype html><meta charset="utf-8"><title>GS750 inventory ${today()}</title><style>body{font:12px system-ui;margin:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:4px 6px;text-align:left}th{background:#EAF4F8}h1{font-size:16px}</style><h1>${esc(meta().projectName)} · Parts inventory · ${fmtDate(today())}</h1><p>${rows.length} parts. Filters: ${esc(JSON.stringify(fstate("inventory")))}</p><table><tr><th>ID</th><th>Part</th><th>Subsystem</th><th>Status</th><th>Condition</th><th>Found/Exp</th><th>Location / bin</th><th>Assigned</th><th>✓</th></tr>${rows.map(p => `<tr><td>${p.id}</td><td>${esc(p.name)}</td><td>${esc(p.subsystem)}</td><td>${esc(partStatusLabel(p))}</td><td>${esc(p.condition)}</td><td>${n(p.qtyFound)}/${n(p.qtyExpected)}</td><td>${esc([p.location, p.bin].filter(Boolean).join(" · "))}</td><td>${esc(S.team[p.assignee]?.name || "")}</td><td></td></tr>`).join("")}</table>`; saveFile("gs750-inventory-print-" + today() + ".html", html, "text/html"); };
  }
};

/* ============ TASKS ============ */
function filteredTasks(sec = "tasks") {
  const f = fstate(sec), q = (f.q || "").toLowerCase();
  return sorted("tasks").filter(t => {
    if (q && ![t.id, t.title, t.subsystem, t.instructions].join(" ").toLowerCase().includes(q)) return false;
    if (f.phase && t.phase !== f.phase) return false; if (f.module && t.module !== f.module) return false; if (f.status && t.status !== f.status) return false;
    if (f.assignee && t.assignee !== f.assignee) return false; if (f.safety && t.safety !== f.safety) return false;
    if (f.flag === "open" && tasksClosed(t)) return false; if (f.flag === "overdue" && !isOverdue(t)) return false;
    if (f.flag === "ready" && (tasksClosed(t) || openPrereqs(t).length)) return false; if (f.flag === "blockedprereq" && (tasksClosed(t) || !openPrereqs(t).length)) return false;
    if (f.flag === "approval" && !(t.status === "Complete" && t.approval !== "Approved")) return false;
    return true;
  });
}
const taskCols = (inline = true) => [
  { k: "id", label: "ID", get: t => `<span class="mono">${t.id}</span>` },
  { k: "title", label: "Task", get: t => `${esc(t.title)}${openPrereqs(t).length && !tasksClosed(t) ? `<div class="faint" style="font-size:11.5px">Waits on ${openPrereqs(t).slice(0, 4).join(", ")}${openPrereqs(t).length > 4 ? "…" : ""}</div>` : ""}`, cls: "wrap" },
  { k: "phase", label: "Phase" },
  { k: "status", label: "Status", get: t => inline && ME.canWrite ? `<select data-inline="tasks|${t.id}|status" aria-label="Status of ${t.id}">${TASK_STATUS.map(s => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}</select>` : taskPill(t), sort: t => TASK_STATUS.indexOf(t.status) },
  { k: "safety", label: "Safety", get: t => sevPill(t.safety), sort: t => SEV.indexOf(t.safety) },
  { k: "assignee", label: "Assigned", get: t => refName("team", t.assignee), sort: t => S.team[t.assignee]?.name || "" },
  { k: "estHours", label: "Est. h", get: t => `<span class="num">${n(t.estHours) || "—"}</span>`, sort: t => n(t.estHours), cls: "r" },
  { k: "actual", label: "Logged h", get: t => `<span class="num">${taskHours(t.id) || "—"}</span>`, sort: t => taskHours(t.id), cls: "r" },
  { k: "due", label: "Due", get: t => t.due ? `<span class="${isOverdue(t) ? "pill red plain" : ""}">${fmtDate(t.due)}</span>` : `<span class="faint">—</span>` },
  { k: "approval", label: "Approval", get: t => t.status === "Complete" ? resPill(t.approval === "Approved" ? "Pass" : t.approval === "Rejected" ? "Fail" : "Pending").replace(/>(Pass|Fail|Pending)</, ">" + t.approval + "<") : `<span class="faint">—</span>` },
];
function bindInline(root) {
  $$("[data-inline]", root).forEach(sel => { sel.onclick = e => e.stopPropagation(); sel.onchange = async () => { const [c, id, k] = sel.dataset.inline.split("|"); await quickSet(c, id, { [k]: sel.value }, `${id}: ${SCHEMA[c].fields.find(x => x.k === k)?.label || k} → ${sel.value}`); }; });
}
VIEWS.tasks = {
  render() {
    const tab = R.tab.tasks || "list", rows = filteredTasks();
    const head = `<div class="ph"><div><h1>Tasks & checklists</h1><p>${sorted("tasks").filter(t => !tasksClosed(t)).length} open of ${sorted("tasks").length}. A task can't be approved until its prerequisites are complete.</p></div>
      <div class="act"><button class="btn" id="taskCsv">${ic("download")} Export CSV</button><button class="btn pri" data-new="tasks">${ic("plus")} Add task</button></div></div>
      <div class="tabs">${[["list", "List"], ["board", "Board"], ["phase", "By phase"], ["tools", "Tools & supplies"]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>`;
    if (tab === "tools") return head + `<div class="row"><span class="muted">${sorted("tools").length} tools and supplies. Use verified torque values and calibrated tools where a measurement decides acceptance.</span><span class="spacer"></span><button class="btn pri" data-new="tools">${ic("plus")} Add tool</button></div>` + table("tools", sorted("tools"), [{ k: "id", label: "ID", get: t => `<span class="mono">${t.id}</span>` }, { k: "name", label: "Tool / material", cls: "wrap" }, { k: "category", label: "Category" }, { k: "qty", label: "Qty" }, { k: "available", label: "Available" }, { k: "status", label: "Status" }, { k: "cost", label: "Cost", get: t => n(t.cost) ? money(t.cost) : "—", cls: "r" }, { k: "usage", label: "Usage", cls: "wrap" }], { coll: "tools" });
    const fb = filterBar("tasks", [{ k: "q", type: "search", label: "Search tasks" }, { k: "phase", label: "Phase", opts: sorted("phases").map(p => [p.id, p.id + " · " + p.name]) }, { k: "module", label: "Module", opts: optsOf(Object.keys(MODULES), MODULES) }, { k: "status", label: "Status", opts: optsOf(TASK_STATUS) }, { k: "assignee", label: "Assigned", opts: teamOpts() }, { k: "safety", label: "Safety", opts: optsOf(SEV) }, { k: "flag", label: "Show", opts: [["open", "Open only"], ["ready", "Ready to start"], ["blockedprereq", "Waiting on prerequisites"], ["overdue", "Overdue"], ["approval", "Complete, needs approval"]] }]);
    if (tab === "board") return head + fb + `<div class="board">${TASK_STATUS.map(s => { const ts = rows.filter(t => t.status === s); return `<div class="col" data-drop="${s}"><h4><span>${s}</span><span>${ts.length}</span></h4>${ts.slice(0, 60).map(t => `<button class="tcard" draggable="${ME.canWrite}" data-drag="${t.id}" data-open="tasks|${t.id}"><span class="row" style="justify-content:space-between"><span class="mono faint">${t.id}</span>${t.safety === "Critical" ? sevPill("Critical") : ""}</span><span>${esc(t.title)}</span>${openPrereqs(t).length && !tasksClosed(t) ? `<span class="faint" style="font-size:11px">Waits on ${openPrereqs(t).length} task(s)</span>` : ""}${t.assignee ? `<span class="faint" style="font-size:11px">${refName("team", t.assignee)}</span>` : ""}</button>`).join("")}${ts.length > 60 ? `<span class="faint">+${ts.length - 60} more (filter to narrow)</span>` : ""}</div>`; }).join("")}</div><p class="faint" style="margin:0;font-size:12px">Drag a card to another column to change its status.</p>`;
    if (tab === "phase") return head + fb + sorted("phases").map(ph => { const ts = rows.filter(t => t.phase === ph.id); if (!ts.length) return ""; const st = phaseStats(ph); return `<div class="stack"><div class="row"><span class="phase letter" style="all:unset;width:28px;height:28px;border-radius:5px;display:grid;place-items:center;background:var(--tan);color:#2B2216;font-family:var(--f-cond);font-weight:600">${ph.id}</span><h3>${esc(ph.name)}</h3><span class="muted">${st.done}/${st.total} complete · ${pct(st.pct)}</span></div>${table("tp-" + ph.id, ts, taskCols(), { coll: "tasks" })}</div>`; }).join("");
    return head + fb + `<div class="muted">${rows.length} shown</div>` + table("tasks", rows, taskCols(), { coll: "tasks", emptyTitle: "No tasks match" });
  },
  bind(root) {
    bindTables(root); bindFilters(root, "tasks"); bindInline(root);
    $$("[data-tab]", root).forEach(b => b.onclick = () => { R.tab.tasks = b.dataset.tab; lsSet("gs750.route", { sec: R.sec, tab: R.tab, view: R.view }); render(false); });
    $$("[data-drag]", root).forEach(c => c.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", c.dataset.drag)));
    $$("[data-drop]", root).forEach(col => { col.addEventListener("dragover", e => { e.preventDefault(); col.classList.add("drop"); }); col.addEventListener("dragleave", () => col.classList.remove("drop")); col.addEventListener("drop", e => { e.preventDefault(); col.classList.remove("drop"); const id = e.dataTransfer.getData("text/plain"); if (id && S.tasks[id] && S.tasks[id].status !== col.dataset.drop) quickSet("tasks", id, { status: col.dataset.drop }, `${id} → ${col.dataset.drop}`); }); });
    $("#taskCsv") && ($("#taskCsv").onclick = () => saveFile("gs750-tasks-" + today() + ".csv", csvOf(filteredTasks(), [{ k: "id", label: "ID" }, { k: "title", label: "Title" }, { k: "phase", label: "Phase" }, { k: "module", label: "Module" }, { k: "subsystem", label: "Subsystem" }, { k: "status", label: "Status" }, { k: "priority", label: "Priority" }, { k: "safety", label: "Safety" }, { label: "Assigned", get: t => S.team[t.assignee]?.name || "" }, { k: "estHours", label: "Est hours" }, { label: "Logged hours", get: t => taskHours(t.id) }, { k: "estCost", label: "Est cost" }, { k: "start", label: "Start" }, { k: "due", label: "Due" }, { k: "prereqs", label: "Prerequisites" }, { k: "partIds", label: "Parts" }, { k: "approval", label: "Approval" }, { label: "Reviewer", get: t => S.team[t.reviewer]?.name || "" }, { k: "completedAt", label: "Completed" }, { k: "instructions", label: "Instructions" }, { k: "expected", label: "Expected result" }]), "text/csv"));
  }
};

/* ============ ROADMAP ============ */
function phaseGraph() {
  const phs = sorted("phases"), st = Object.fromEntries(phs.map(p => [p.id, phaseStats(p)]));
  const layer = {}; const L = id => { if (layer[id] != null) return layer[id]; layer[id] = 0; const d = st[id]?.deps || []; layer[id] = d.length ? Math.max(...d.map(x => (x === id ? -1 : L(x)))) + 1 : 0; return layer[id]; };
  phs.forEach(p => L(p.id));
  const cols = {}; phs.forEach(p => (cols[layer[p.id]] = cols[layer[p.id]] || []).push(p));
  const nL = Object.keys(cols).length, maxRows = Math.max(...Object.values(cols).map(c => c.length));
  const cw = 96, rh = 46, W = nL * cw + 20, H = maxRows * rh + 20; const pos = {};
  Object.entries(cols).forEach(([l, ps]) => ps.forEach((p, i) => pos[p.id] = { x: 10 + l * cw, y: 10 + i * rh + (maxRows - ps.length) * rh / 2 }));
  let g = `<defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--faint)"/></marker></defs>`;
  phs.forEach(p => (st[p.id].deps || []).forEach(d => { const a = pos[d], b = pos[p.id]; if (a && b) g += `<path d="M${a.x + 66} ${a.y + 15} C ${a.x + 84} ${a.y + 15}, ${b.x - 18} ${b.y + 15}, ${b.x - 2} ${b.y + 15}" fill="none" stroke="var(--faint)" stroke-width="1.2" marker-end="url(#arr)"/>`; }));
  phs.forEach(p => { const s = st[p.id], c = pos[p.id]; const col = s.pct >= 1 ? "var(--st-green)" : s.done > 0 || p.approval === "In progress" ? "var(--st-amber)" : s.ready ? "var(--blue)" : "var(--gray-bg)";
    g += `<g data-ph="${p.id}" style="cursor:pointer"><rect x="${c.x}" y="${c.y}" width="66" height="30" rx="5" fill="var(--surface)" stroke="var(--line-2)"/><rect x="${c.x}" y="${c.y + 26}" width="${66 * s.pct}" height="4" fill="var(--st-green)"/><rect x="${c.x}" y="${c.y}" width="6" height="30" rx="2" fill="${col}"/><text x="${c.x + 14}" y="${c.y + 19}" class="lbl" style="font-weight:600;font-family:var(--f-cond)">${p.id}</text><text x="${c.x + 30}" y="${c.y + 19}" class="num">${pct(s.pct)}</text><title>${esc(p.name)}: ${s.done}/${s.total} tasks</title></g>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:none" role="img" aria-label="Phase dependency diagram">${g}</svg>`;
}
VIEWS.roadmap = {
  render() {
    const phs = sorted("phases");
    return `<div class="ph"><div><h1>Restoration roadmap</h1><p>Phases come from your workbook. Arrows show real task dependencies between phases, so phases without a path between them can run in parallel. Blue edge = tasks ready to start now.</p></div></div>
    <div class="panel"><h2 class="sec">Phase dependencies</h2><div class="depgraph">${phaseGraph()}</div>${legend([["var(--st-green)", "Complete"], ["var(--st-amber)", "Under way"], ["var(--blue)", "Has tasks ready to start"], ["var(--gray-bg)", "Waiting on earlier work"]])}</div>
    <div class="panel" style="padding:0">${phs.map(p => { const s = phaseStats(p); return `<div class="phase" data-open="phases|${p.id}" tabindex="0"><span class="letter">${p.id}</span><div style="min-width:0"><div class="row"><b style="font-weight:500">${esc(p.name)}</b>${resPill(p.approval === "Approved" ? "Passed" : p.approval === "Not started" ? "Not started" : "In review").replace(/>(Passed|Not started|In review)</, ">" + p.approval + "<")}</div>
      <div class="progress" style="margin-top:6px;height:6px"><i style="width:${s.pct * 100}%;background:var(--st-green)"></i></div>
      <div class="meta"><span>${s.done}/${s.total} tasks · ${s.remaining} remaining</span><span>${s.ready} ready now</span><span>${s.partsNeeded} part orders open</span><span>Est. ${money(s.est)} · actual ${money(s.actual)}</span><span>${s.start || s.finish ? fmtDate(s.start) + " → " + fmtDate(s.finish) : "No dates set"}</span><span>${s.deps.length ? "Depends on " + s.deps.join(", ") : "No upstream phases"}</span></div></div>
      <span class="num" style="font-family:var(--f-cond);font-size:18px;font-weight:600">${pct(s.pct)}</span></div>`; }).join("")}</div>`;
  },
  bind(root) { bindTables(root); $$("[data-ph]", root).forEach(g => g.onclick = () => openRecord("phases", g.dataset.ph)); $$(".phase", root).forEach(p => p.onkeydown = e => { if (e.key === "Enter") p.click(); }); }
};

/* ============ MODULES (engine, fuel, electrical, chassis, finish) ============ */
function moduleView(mod) {
  return {
    render() {
      const sec = R.sec, tab = R.tab[sec] || (mod === "finish" ? "finishes" : "steps");
      const parts = sorted("parts").filter(p => p.module === mod), tasks = sorted("tasks").filter(t => t.module === mod), steps = sorted("steps").filter(s => s.module === mod).sort((a, b) => n(a.seq) - n(b.seq));
      const pids = new Set(parts.map(p => p.id)); const ins = sorted("inspections").filter(i => pids.has(i.partId));
      const fins = mod === "finish" ? sorted("finishes") : [];
      const tp = tasks.filter(t => t.status !== "Cancelled"), done = tp.filter(tasksDone).length;
      const est = tasks.reduce((s, t) => s + n(t.estCost), 0) + parts.reduce((s, p) => s + n(p.estCost), 0);
      const act = parts.reduce((s, p) => s + partActualCost(p.id), 0);
      const tabs = (mod === "finish" ? [["finishes", "Finish records"], ["photos", "Before & after"]] : [["steps", "Procedure"]]).concat([["tasks", "Tasks"], ["parts", "Parts"], ["inspections", "Inspections"]]);
      let body = "";
      if (tab === "steps") body = table("steps-" + mod, steps, [{ k: "seq", label: "#", sort: s => n(s.seq) }, { k: "id", label: "Step", get: s => `<span class="mono">${s.id}</span>` }, { k: "workPackage", label: "Work package" }, { k: "title", label: "Task / inspection", get: s => `<b style="font-weight:500">${esc(s.title)}</b><div class="faint" style="font-size:12px">${esc(s.procedure)}</div>`, cls: "wrap" },
        { k: "status", label: "Status", get: s => ME.canWrite ? `<select data-inline="steps|${s.id}|status" aria-label="Status">${TASK_STATUS.map(x => `<option ${x === s.status ? "selected" : ""}>${x}</option>`).join("")}</select>` : taskPill(s) },
        { k: "result", label: "Pass/fail", get: s => ME.canWrite ? `<select data-inline="steps|${s.id}|result" aria-label="Result">${RESULT.map(x => `<option ${x === s.result ? "selected" : ""}>${x}</option>`).join("")}</select>` : resPill(s.result) },
        { k: "evidence", label: "Evidence required", cls: "wrap" }, { k: "manualRef", label: "Manual ref.", get: s => specCell(s.manualRef) }, { k: "taskId", label: "Task", get: s => s.taskId ? `<button class="btn sm" data-open="tasks|${s.taskId}">${s.taskId}</button>` : "" }], { coll: "steps", emptyTitle: "No procedure steps for this module" });
      if (tab === "tasks") body = table("mt-" + mod, tasks, taskCols(), { coll: "tasks" });
      if (tab === "parts") body = table("mp-" + mod, parts, PART_COLS(), { coll: "parts" });
      if (tab === "inspections") body = table("mi-" + mod, ins, INS_COLS(), { coll: "inspections", emptyTitle: "No inspections linked to this module's parts", empty: "Add one from a part's detail panel." });
      if (tab === "finishes") body = table("fin", fins, [{ k: "id", label: "ID", get: f => `<span class="mono">${f.id}</span>` }, { k: "component", label: "Component" }, { k: "work", label: "Work", cls: "wrap" }, { k: "process", label: "Product / process", cls: "wrap" }, { k: "protect", label: "Must protect", cls: "wrap" },
        { k: "status", label: "Status", get: f => ME.canWrite ? `<select data-inline="finishes|${f.id}|status" aria-label="Status">${TASK_STATUS.map(x => `<option ${x === f.status ? "selected" : ""}>${x}</option>`).join("")}</select>` : taskPill(f) }, { k: "qc", label: "QC", get: f => resPill(f.qc) }, { k: "approvedBy", label: "Approved by", get: f => refName("team", f.approvedBy) }], { coll: "finishes" });
      if (tab === "photos") { const ds = sorted("docs").filter(d => ["Before photo", "After photo", "During photo"].includes(d.kind) && (pids.has(d.partId) || fins.some(f => f.partId && f.partId === d.partId))); const byPart = {}; ds.forEach(d => (byPart[d.partId || "—"] = byPart[d.partId || "—"] || []).push(d));
        body = Object.keys(byPart).length ? Object.entries(byPart).map(([pid, list]) => `<div class="panel stack"><div class="row"><h3>${refName("parts", pid)}</h3><span class="spacer"></span><button class="btn sm" data-up="${esc(pid)}|Before photo">+ Before</button><button class="btn sm" data-up="${esc(pid)}|After photo">+ After</button></div><div class="grid g2"><div><h2 class="sec">Before</h2>${thumbs(list.filter(d => d.kind === "Before photo"))}</div><div><h2 class="sec">After</h2>${thumbs(list.filter(d => d.kind === "After photo"))}</div></div></div>`).join("") : `<div class="empty"><b>No before/after photos yet</b>Open a part and use Upload photo, or set the photo type to Before or After.</div>`; }
      return `<div class="ph"><div><h1>${esc(SEC[sec].t)}</h1><p>${MODULE_INTRO[mod]}</p></div><div class="act">${mod === "finish" ? `<button class="btn pri" data-new="finishes">${ic("plus")} Finish record</button>` : `<button class="btn pri" data-new="steps|${esc(JSON.stringify({ module: mod, seq: steps.length + 1 }))}">${ic("plus")} Procedure step</button>`}</div></div>
      <div class="panel blue row center" style="gap:18px"><img src="img/${MODULE_IMG[mod]}.svg" alt="" style="width:min(260px,100%);border-radius:12px"><div class="stack" style="gap:6px;align-items:center;max-width:42ch"><b>See it in 3D</b><span class="hint-text">Pull this area out of the bike, spin it around and spread the pieces apart.</span><button class="btn pri" data-3d="${MODULE_GROUP[mod]}">${ic("cube")} Open in 3D</button></div></div>
      <div class="kpis">
        <button class="kpi" data-mtab="parts"><span class="l">Parts approved</span><span class="v">${parts.filter(p => partColor(p) === "green").length}/${parts.length}</span><span class="s">${parts.filter(p => partColor(p) === "red").length} untouched</span></button>
        <button class="kpi" data-mtab="tasks"><span class="l">Tasks complete</span><span class="v">${done}/${tp.length}</span><span class="s">${tasks.filter(t => !tasksClosed(t) && !openPrereqs(t).length).length} ready now</span></button>
        ${mod !== "finish" ? `<button class="kpi" data-mtab="steps"><span class="l">Procedure steps</span><span class="v">${steps.filter(s => s.status === "Complete").length}/${steps.length}</span><span class="s">${steps.filter(s => s.result === "Fail").length} failed</span></button>` : `<button class="kpi" data-mtab="finishes"><span class="l">Finish records</span><span class="v">${fins.filter(f => f.qc === "Pass").length}/${fins.length}</span><span class="s">QC passed</span></button>`}
        <button class="kpi" data-mtab="inspections"><span class="l">Inspections</span><span class="v">${ins.filter(i => i.result === "Pass").length}/${ins.length}</span><span class="s">${ins.filter(i => i.result === "Fail").length} failed · ${ins.filter(i => i.result === "Pending").length} pending</span></button>
        <div class="kpi" style="cursor:default"><span class="l">Cost est. / actual</span><span class="v">${money(act)}</span><span class="s">of ${money(est)} estimated</span></div>
      </div>
      <div class="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>${body}`;
    },
    bind(root) {
      bindTables(root); bindInline(root);
      $$("[data-tab],[data-mtab]", root).forEach(b => b.onclick = () => { R.tab[R.sec] = b.dataset.tab || b.dataset.mtab; render(false); });
      $$("[data-up]", root).forEach(b => b.onclick = () => { const [pid, kind] = b.dataset.up.split("|"); uploadPhotos({ partId: pid === "—" ? "" : pid, kind }); });
      $$("[data-3d]", root).forEach(b => b.onclick = () => openIn3D(b.dataset["3d"]));
    }
  };
}
const MODULE_INTRO = {
  engine: "Assessment, teardown, measurement, machine-shop decisions, assembly and pre-start prep. Measure before deciding scope; every limit comes from the factory service manual.",
  fuel: "Carburetor identification and rebuild, tank corrosion, tap and lines, intake boots, synchronization and leak testing. Carb settings come only from the manual for your exact carbs.",
  electrical: "Harness, connectors, grounds, continuity, ignition, charging, switches, lighting and gauges. Wire colors and values come only from the verified wiring diagram.",
  chassis: "Frame, steering, swingarm, forks, shocks, wheels, bearings, tires, chain, brakes and axles. Most items here are safety-critical and need an independent check.",
  finish: "Degreasing, corrosion removal, paint and powder, tank and bodywork, exhaust, chrome and seat. Record products and protect machined, bearing and sealing surfaces.",
};
["engine", "fuel", "electrical", "chassis", "finish"].forEach(m => VIEWS[m] = moduleView(m));

/* ============ INSPECTIONS ============ */
const INS_COLS = () => [
  { k: "id", label: "ID", get: i => `<span class="mono">${i.id}</span>` }, { k: "point", label: "Inspection point", get: i => `${esc(i.point)}${i.safetyCritical ? ` <span class="pill red plain">Safety</span>` : ""}`, cls: "wrap" },
  { k: "partId", label: "Part", get: i => refName("parts", i.partId) }, { k: "spec", label: "Factory spec", get: i => specCell(i.spec) },
  { k: "limits", label: "Min / max", get: i => i.min || i.max ? `<span class="num">${esc(i.min || "—")} / ${esc(i.max || "—")}</span>` : `<span class="faint">—</span>` },
  { k: "actual", label: "Actual", get: i => i.actual ? `<span class="num">${esc(i.actual)} ${esc(i.units)}</span>` : `<span class="faint">${esc(i.units || "—")}</span>` },
  { k: "result", label: "Result", get: i => resPill(i.result) + (i.result === "Fail" && i.reinspection ? ` <span class="tag">Reinsp. ${esc(i.reinspection)}</span>` : ""), sort: i => RESULT.indexOf(i.result) },
  { k: "technician", label: "Technician", get: i => refName("team", i.technician) }, { k: "date", label: "Date", get: i => fmtDate(i.date) || `<span class="faint">—</span>` }];
VIEWS.inspections = {
  render() {
    const f = fstate("inspections"), q = (f.q || "").toLowerCase();
    const rows = sorted("inspections").filter(i => (!q || [i.id, i.point, i.component, i.partId, S.parts[i.partId]?.name].join(" ").toLowerCase().includes(q)) && (!f.result || i.result === f.result) && (!f.part || i.partId === f.part) && (!f.safety || (f.safety === "1") === !!i.safetyCritical) && (!f.spec || (f.spec === "verify") === (!i.spec || i.spec === VERIFY)));
    const unv = sorted("inspections").filter(i => !i.spec || i.spec === VERIFY).length;
    return `<div class="ph"><div><h1>Inspections & measurements</h1><p>Several measurements per part are fine. No torque values, wear limits, clearances, wire colors or carb settings are filled in by the app: anything unverified shows <span class="verify">VERIFY IN FSM</span>.</p></div><div class="act"><button class="btn" id="insCsv">${ic("download")} Export CSV</button><button class="btn pri" data-new="inspections">${ic("plus")} Add inspection</button></div></div>
    ${unv ? `<div class="banner warn"><div class="grow">${unv} inspection${unv > 1 ? "s" : ""} still need the factory specification and manual page entered.</div><button class="btn sm" id="fVerify">Show them</button></div>` : ""}
    ${filterBar("inspections", [{ k: "q", type: "search", label: "Search inspections" }, { k: "result", label: "Result", opts: optsOf(RESULT) }, { k: "part", label: "Part", opts: sorted("parts").map(p => [p.id, p.id + " " + p.name]) }, { k: "safety", label: "Safety-critical", opts: [["1", "Safety-critical only"], ["0", "Not safety-critical"]] }, { k: "spec", label: "Spec", opts: [["verify", "Spec unverified"], ["ok", "Spec entered"]] }])}
    ${table("ins", rows, INS_COLS(), { coll: "inspections", emptyTitle: "No inspections match" })}`;
  },
  bind(root) { bindTables(root); bindFilters(root, "inspections"); $("#fVerify") && ($("#fVerify").onclick = () => { fstate("inspections").spec = "verify"; render(false); });
    $("#insCsv").onclick = () => saveFile("gs750-inspections-" + today() + ".csv", csvOf(sorted("inspections"), ["id", "partId", "component", "point", "procedure", "spec", "min", "max", "actual", "units", "tool", "date", "result", "corrective", "reinspection", "manualRef", "evidence", "notes"].map(k => ({ k, label: k })).concat([{ label: "technician", get: i => S.team[i.technician]?.name || "" }, { label: "reviewer", get: i => S.team[i.reviewer]?.name || "" }])), "text/csv"); }
};

/* ============ PURCHASING ============ */
const PUR_COLOR = { Research: "gray", Quote: "gray", Requested: "red", Ordered: "amber", Shipped: "amber", Delivered: "amber", Inspected: "green", Returned: "gray", Cancelled: "gray" };
VIEWS.purchasing = {
  render() {
    const tab = R.tab.purchasing || "orders", f = fstate("purchasing"), q = (f.q || "").toLowerCase(), alerts = purchaseAlerts();
    const rows = sorted("purchases").filter(p => (!q || [p.id, p.description, p.supplier, p.partId, p.oemPn].join(" ").toLowerCase().includes(q)) && (!f.status || p.status === f.status));
    const fin = finance();
    let body;
    if (tab === "quotes") {
      const groups = {}; sorted("purchases").filter(p => p.partId).forEach(p => (groups[p.partId] = groups[p.partId] || []).push(p));
      const g = Object.entries(groups).filter(([, l]) => l.length > 1 || l.some(p => p.status === "Quote"));
      body = g.length ? g.map(([pid, list]) => { const priced = list.filter(p => landed(p) > 0); const best = priced.sort((a, b) => landed(a) - landed(b))[0]; return `<div class="panel stack"><div class="row"><h3>${refName("parts", pid)}</h3><span class="muted">${list.length} quotes/orders</span><span class="spacer"></span><button class="btn sm" data-new="purchases|${esc(JSON.stringify({ partId: pid, status: "Quote", description: S.parts[pid]?.name || "" }))}">+ Add quote</button></div>
        ${table("q-" + pid, list.sort((a, b) => landed(a) - landed(b)), [{ k: "id", label: "ID", get: p => `<span class="mono">${p.id}</span>` }, { k: "supplier", label: "Supplier", get: p => esc(p.supplier || "—") + (best && p.id === best.id ? ` <span class="pill green plain">Lowest delivered</span>` : "") }, { k: "sourceType", label: "Type" }, { k: "unitPrice", label: "Unit", get: p => money2(p.unitPrice), cls: "r" }, { k: "qty", label: "Qty", cls: "r" }, { k: "shipping", label: "Ship + tax + fees", get: p => money2(n(p.shipping) + n(p.tax) + n(p.fees)), cls: "r" }, { k: "landed", label: "Delivered total", get: p => `<b class="num">${money2(landed(p))}</b>`, sort: landed, cls: "r" }, { k: "status", label: "Status", get: p => pill(PUR_COLOR[p.status], p.status) }, { k: "fitment", label: "Fitment", get: p => resPill(p.fitment === "Verified" ? "Pass" : p.fitment === "Failed" ? "Fail" : "Pending").replace(/>(Pass|Fail|Pending)</, ">" + p.fitment + "<") }], { coll: "purchases" })}</div>`; }).join("")
        : `<div class="empty"><b>No quotes to compare yet</b>Add two or more quotes linked to the same part. The comparison uses total delivered cost (price × qty + shipping + tax + fees), not unit price.</div>`;
    } else body = filterBar("purchasing", [{ k: "q", type: "search", label: "Search description, supplier, part" }, { k: "status", label: "Status", opts: optsOf(PUR_STATUS) }]) + table("pur", rows, [{ k: "id", label: "ID", get: p => `<span class="mono">${p.id}</span>` }, { k: "description", label: "Description", cls: "wrap" }, { k: "partId", label: "Part", get: p => refName("parts", p.partId) }, { k: "sourceType", label: "Type" }, { k: "supplier", label: "Supplier", get: p => esc(p.supplier || "—") },
      { k: "qty", label: "Qty", cls: "r" }, { k: "landed", label: "Delivered total", get: p => landed(p) ? `<span class="num">${money2(landed(p))}</span>` : `<span class="faint">no price</span>`, sort: landed, cls: "r" },
      { k: "status", label: "Status", get: p => ME.canWrite ? `<select data-inline="purchases|${p.id}|status" aria-label="Status">${PUR_STATUS.map(s => `<option ${s === p.status ? "selected" : ""}>${s}</option>`).join("")}</select>` : pill(PUR_COLOR[p.status], p.status), sort: p => PUR_STATUS.indexOf(p.status) },
      { k: "expected", label: "Expected", get: p => fmtDate(p.expected) || `<span class="faint">—</span>` }, { k: "qc", label: "QC", get: p => resPill(p.qc) }], { coll: "purchases", emptyTitle: "No purchase requests match" });
    return `<div class="ph"><div><h1>Parts purchasing</h1><p>Requests, quotes and orders. Prices and links are only what your team enters; nothing is looked up or guessed.</p></div><div class="act"><button class="btn" id="purCsv">${ic("download")} Export CSV</button><button class="btn pri" data-new="purchases">${ic("plus")} Purchase request</button></div></div>
    <div class="kpis"><div class="kpi" style="cursor:default"><span class="l">Committed (unpaid)</span><span class="v">${money(fin.committed)}</span><span class="s">ordered, not yet expensed</span></div><div class="kpi" style="cursor:default"><span class="l">Planned purchases</span><span class="v">${money(fin.plannedPurch)}</span><span class="s">lowest open quote per part</span></div><div class="kpi" style="cursor:default"><span class="l">Open requests</span><span class="v">${sorted("purchases").filter(p => ["Research", "Quote", "Requested"].includes(p.status)).length}</span><span class="s">not ordered yet</span></div><div class="kpi" style="cursor:default"><span class="l">In transit</span><span class="v">${sorted("purchases").filter(p => ["Ordered", "Shipped"].includes(p.status)).length}</span><span class="s">ordered or shipped</span></div></div>
    ${alerts.length ? `<div class="banner bad"><div class="grow"><b>${alerts.length} purchasing alert${alerts.length > 1 ? "s" : ""}</b><ul style="margin:4px 0 0;padding-left:18px">${alerts.map(a => `<li><b>${esc(a.kind)}:</b> ${a.p ? `<button class="btn sm" data-open="purchases|${a.p.id}">${a.p.id}</button> ${esc(a.p.description)} · ` : ""}${esc(a.msg)}</li>`).join("")}</ul></div></div>` : `<div class="banner good"><div class="grow">No delayed orders, uninspected deliveries, duplicates or budget overruns.</div></div>`}
    <div class="tabs">${[["orders", "Requests & orders"], ["quotes", "Quote comparison"]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>${body}`;
  },
  bind(root) { bindTables(root); bindFilters(root, "purchasing"); bindInline(root); $$("[data-tab]", root).forEach(b => b.onclick = () => { R.tab.purchasing = b.dataset.tab; render(false); });
    $("#purCsv").onclick = () => saveFile("gs750-purchases-" + today() + ".csv", csvOf(sorted("purchases"), ["id", "partId", "taskId", "description", "sourceType", "oemPn", "qty", "supplier", "url", "unitPrice", "shipping", "tax", "fees"].map(k => ({ k, label: k })).concat([{ label: "deliveredTotal", get: landed }], ["quoteDate", "orderDate", "expected", "delivered", "status", "tracking", "returnBy", "warranty", "fitment", "fitmentSource", "qc", "receipt", "notes"].map(k => ({ k, label: k })))), "text/csv"); }
};

/* ============ BUDGET ============ */
VIEWS.budget = {
  render() {
    const f = finance(), m = meta(), exp = sorted("expenses").sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const byMod = {}, byPh = {}, byCat = {};
    exp.filter(e => e.status === "Paid").forEach(e => { const t = S.tasks[e.taskId] || S.tasks[S.purchases[e.purchaseId]?.taskId]; const p = S.parts[e.partId] || S.parts[S.purchases[e.purchaseId]?.partId]; const mod = (t && t.module) || (p && p.module) || "general"; byMod[mod] = (byMod[mod] || 0) + n(e.amount); const ph = t ? t.phase : "—"; byPh[ph] = (byPh[ph] || 0) + n(e.amount); const c = e.category || "Uncategorized"; byCat[c] = (byCat[c] || 0) + n(e.amount); });
    const rowsOf = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, segs: [{ v, color: COL.navy }] }));
    const ef = fstate("budget"), q = (ef.q || "").toLowerCase();
    const reg = exp.filter(e => (!q || [e.id, e.description, e.vendor, e.category].join(" ").toLowerCase().includes(q)) && (!ef.status || e.status === ef.status) && (!ef.cat || e.category === ef.cat));
    return `<div class="ph"><div><h1>Budget & expenses</h1><p>Paid expenses, unpaid commitments and planned costs are tracked separately. Linking an expense to its purchase order stops the order from being counted twice.</p></div><div class="act"><button class="btn" id="expCsv">${ic("download")} Export CSV</button><button class="btn pri" data-new="expenses">${ic("plus")} Log expense</button></div></div>
    ${f.forecast > f.total ? `<div class="banner bad"><div class="grow"><b>Forecast is over budget by ${money(f.forecast - f.total)}.</b> Review planned purchases or approve a budget change.</div></div>` : ""}
    <div class="kpis">
      <div class="kpi" style="cursor:default"><span class="l">Original budget</span><span class="v">${money(f.base)}</span><span class="s">${f.changes ? (f.changes > 0 ? "+" : "") + money(f.changes) + " approved changes" : "no changes"}</span></div>
      <div class="kpi" style="cursor:default"><span class="l">Contingency</span><span class="v">${money(f.contingency)}</span><span class="s">${n(m.contingencyPct)}% · total ${money(f.total)}</span></div>
      <div class="kpi green" style="cursor:default"><span class="l">Paid</span><span class="v">${money(f.paid)}</span><span class="s">actual cash out</span></div>
      <div class="kpi amber" style="cursor:default"><span class="l">Committed</span><span class="v">${money(f.committed)}</span><span class="s">${money(f.committedOrders)} orders + ${money(f.unpaidInvoices)} unpaid bills</span></div>
      <div class="kpi" style="cursor:default"><span class="l">Planned</span><span class="v">${money(f.planned)}</span><span class="s">${money(f.plannedPurch)} quotes + ${money(f.plannedTasks)} task estimates</span></div>
      <div class="kpi ${f.forecast > f.total ? "red" : ""}" style="cursor:default"><span class="l">Forecast total</span><span class="v">${money(f.forecast)}</span><span class="s">${f.forecastRemaining >= 0 ? money(f.forecastRemaining) + " headroom" : money(-f.forecastRemaining) + " over"}</span></div>
      <div class="kpi ${f.remaining < 0 ? "red" : ""}" style="cursor:default"><span class="l">Budget remaining</span><span class="v">${money(f.remaining)}</span><span class="s">total − paid − committed</span></div>
      <div class="kpi" style="cursor:default"><span class="l">Labor hours</span><span class="v">${Math.round(f.hours * 10) / 10}</span><span class="s">${m.showLaborValue ? "≈ " + money(f.laborValue) + " labor value" : "labor value hidden"}</span></div>
    </div>
    <div class="grid g2">
      <div class="panel stack"><h2 class="sec">Budget position</h2>${hbars([{ label: "Forecast", segs: [{ v: f.paid, color: COL.navy, name: "Paid" }, { v: f.committed, color: COL.tan, name: "Committed" }, { v: f.planned, color: COL.blue, name: "Planned" }] }], { money: 1, lw: 70, line: f.total, lineLabel: "Budget incl. contingency " + money(f.total) })}${legend([[COL.navy, "Paid"], [COL.tan, "Committed"], [COL.blue, "Planned"]])}</div>
      <div class="panel stack"><h2 class="sec">Approved budget changes</h2>${(m.budgetChanges || []).length ? `<div class="linklist">${m.budgetChanges.map((c, i) => `<div style="display:flex;gap:8px;padding:6px 10px;border-bottom:1px solid var(--line)"><span class="grow" style="flex:1">${esc(c.reason)} <span class="faint">${fmtDate(c.date)}</span></span><b class="num">${c.amount > 0 ? "+" : ""}${money(c.amount)}</b>${ME.canWrite ? `<button class="btn sm" data-rmchg="${i}" aria-label="Remove change">×</button>` : ""}</div>`).join("")}</div>` : `<span class="muted">None yet.</span>`}
        ${ME.canWrite ? `<div class="row"><input id="chgAmt" type="number" step="any" placeholder="Amount (±)" style="width:120px;padding:5px 8px;border:1px solid var(--line-2);border-radius:5px" aria-label="Change amount"><input id="chgWhy" placeholder="Reason" style="flex:1;min-width:140px;padding:5px 8px;border:1px solid var(--line-2);border-radius:5px" aria-label="Reason"><button class="btn sm" id="chgAdd">Add change</button></div>` : ""}
        <p class="faint" style="margin:0;font-size:12px">Base budget and contingency % are in Settings.</p></div>
    </div>
    <div class="grid g3">
      <div class="panel stack"><h2 class="sec">Paid by subsystem</h2>${Object.keys(byMod).length ? hbars(rowsOf(Object.fromEntries(Object.entries(byMod).map(([k, v]) => [MODULES[k] || k, v]))), { money: 1, lw: 160 }) : `<span class="muted">No paid expenses yet.</span>`}</div>
      <div class="panel stack"><h2 class="sec">Paid by phase</h2>${Object.keys(byPh).length ? hbars(rowsOf(Object.fromEntries(Object.entries(byPh).map(([k, v]) => [k === "—" ? "Unlinked" : k + " · " + (S.phases[k]?.name || ""), v]))), { money: 1, lw: 190 }) : `<span class="muted">Link expenses to tasks to see this.</span>`}</div>
      <div class="panel stack"><h2 class="sec">Paid by category</h2>${Object.keys(byCat).length ? hbars(rowsOf(byCat), { money: 1, lw: 160 }) : `<span class="muted">No paid expenses yet.</span>`}</div>
    </div>
    <h2 class="sec" style="margin:0">Transaction register</h2>
    ${filterBar("budget", [{ k: "q", type: "search", label: "Search expenses" }, { k: "status", label: "Payment", opts: optsOf(["Paid", "Unpaid"]) }, { k: "cat", label: "Category", opts: optsOf([...new Set(exp.map(e => e.category).filter(Boolean))]) }])}
    ${table("exp", reg, [{ k: "date", label: "Date", get: e => fmtDate(e.date) }, { k: "id", label: "ID", get: e => `<span class="mono">${e.id}</span>${e.example ? ` <span class="tag">EXAMPLE</span>` : ""}` }, { k: "description", label: "Description", cls: "wrap" }, { k: "category", label: "Category" }, { k: "vendor", label: "Vendor" }, { k: "links", label: "Linked", get: e => [e.purchaseId, e.taskId, e.partId].filter(Boolean).map(x => `<span class="mono faint">${esc(x)}</span>`).join(" ") || `<span class="faint">—</span>` }, { k: "status", label: "Payment", get: e => pill(e.status === "Paid" ? "green" : "amber", e.status) }, { k: "amount", label: "Amount", get: e => `<b class="num">${money2(e.amount)}</b>`, sort: e => n(e.amount), cls: "r" }], { coll: "expenses", emptyTitle: "No expenses logged", empty: "Use Log expense when money is spent." })}`;
  },
  bind(root) { bindTables(root); bindFilters(root, "budget");
    $$("[data-rmchg]", root).forEach(b => b.onclick = async () => { const m = clone(meta()); m.budgetChanges.splice(+b.dataset.rmchg, 1); await store.put("meta", m, { action: "removed a budget change" }); });
    $("#chgAdd") && ($("#chgAdd").onclick = async () => { const a = n($("#chgAmt").value), why = $("#chgWhy").value.trim(); if (!a || !why) { toast("Enter an amount and a reason.", "err"); return; } const m = clone(meta()); m.budgetChanges = [...(m.budgetChanges || []), { amount: a, reason: why, date: today(), by: whoName(), approved: true }]; await store.put("meta", m, { action: `added budget change ${money(a)}: ${why}` }); toast("Budget change added"); });
    $("#expCsv").onclick = () => saveFile("gs750-expenses-" + today() + ".csv", csvOf(sorted("expenses"), ["id", "date", "description", "category", "vendor", "amount", "status", "purchaseId", "taskId", "partId", "receipt", "notes"].map(k => ({ k, label: k }))), "text/csv"); }
};

/* ============ TEAM ============ */
VIEWS.team = {
  render() {
    const tm = sorted("team"), logs = sorted("worklogs").sort((a, b) => String(b.date).localeCompare(String(a.date))), act = sorted("activity").sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 40);
    return `<div class="ph"><div><h1>Team & work log</h1><p>${ME.mode === "shared" ? "Edit rights come from how the page is shared (Contributor or above can edit). Roles below decide who may sign off inspections and gates." : "Running in this browser only: other people won't see these records. Share the published page so the team uses one shared database."}</p></div><div class="act"><button class="btn" data-new="team">${ic("plus")} Team member</button><button class="btn pri" data-new="worklogs">${ic("plus")} Log work session</button></div></div>
    <div class="panel blue row"><label for="actAs" class="muted">I'm working as</label><select id="actAs"><option value="">${esc(ME.name || "Myself")}</option>${tm.map(t => `<option value="${t.id}" ${ME.actingAs === t.id ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select><span class="faint" style="font-size:12px">Used to attribute changes and prefill work sessions on this device.</span></div>
    ${tm.length ? `<div class="cards">${tm.map(t => { const open = sorted("tasks").filter(x => x.assignee === t.id && !tasksClosed(x)).length, hrs = logs.filter(l => l.memberId === t.id).reduce((s, l) => s + n(l.hours), 0); return `<button class="card" data-open="team|${t.id}"><div class="row"><b style="font-weight:500">${esc(t.name)}</b>${t.example ? `<span class="tag">EXAMPLE</span>` : ""}</div><span class="tag" style="align-self:flex-start">${esc(t.role)}</span><div class="row muted" style="font-size:12px"><span>${open} open tasks</span><span>·</span><span class="num">${Math.round(hrs * 10) / 10} h logged</span></div></button>`; }).join("")}</div>` : `<div class="panel"><div class="empty"><b>No team members yet</b>Add each person working on the bike, with a role. Inspectors and owners can sign off inspections and gates.</div></div>`}
    <div class="grid g2" style="align-items:start">
      <div class="stack"><h2 class="sec">Work sessions</h2>${table("logs", logs, [{ k: "date", label: "Date", get: l => fmtDate(l.date) }, { k: "memberId", label: "Who", get: l => refName("team", l.memberId) }, { k: "taskId", label: "Task", get: l => l.taskId ? `<span class="mono">${esc(l.taskId)}</span>` : "—" }, { k: "hours", label: "Hours", get: l => `<span class="num">${n(l.hours)}</span>`, sort: l => n(l.hours), cls: "r" }, { k: "work", label: "Work performed", cls: "wrap" }, { k: "handoff", label: "Handoff", get: l => l.handoff ? "→ " + refName("team", l.handoff) : "" }], { coll: "worklogs", emptyTitle: "No work sessions logged", empty: "Log each session with hours, what was done and any handoff notes." })}</div>
      <div class="panel stack"><h2 class="sec">All recent changes</h2>${act.length ? `<div class="feed">${act.map(a => `<div><time>${fmtTime(a.ts)}</time><span><b>${esc(a.by)}</b> ${esc(a.summary)} <span class="mono faint">${esc(a.rid)}</span> ${esc((a.title || "").slice(0, 50))}</span></div>`).join("")}</div>` : `<span class="muted">No changes yet.</span>`}</div>
    </div>`;
  },
  bind(root) { bindTables(root); $("#actAs").onchange = e => { ME.actingAs = e.target.value; lsSet("gs750.actingAs", ME.actingAs); renderNav(); toast("Working as " + whoName()); }; }
};

/* ============ DOCS ============ */
VIEWS.docs = {
  render() {
    const tab = R.tab.docs || "gallery", f = fstate("docs"), q = (f.q || "").toLowerCase();
    const ds = sorted("docs").filter(d => (!q || [d.id, d.title, d.caption, d.tags, d.partId, d.taskId, d.folder].join(" ").toLowerCase().includes(q)) && (!f.kind || d.kind === f.kind) && (!f.part || d.partId === f.part));
    let body;
    if (tab === "sources") body = `<div class="row"><span class="muted">Catalogs and diagrams are references, not factory service manual specifications.</span><span class="spacer"></span><button class="btn pri" data-new="sources">${ic("plus")} Add source</button></div>` + table("src", sorted("sources"), [{ k: "id", label: "ID", get: s => `<span class="mono">${s.id}</span>` }, { k: "title", label: "Source", get: s => `${esc(s.title)}${s.url ? `<div><a href="${esc(s.url)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${esc(s.publisher || s.url)}</a></div>` : ""}`, cls: "wrap" }, { k: "applies", label: "Applies to" }, { k: "subject", label: "Subject", cls: "wrap" }, { k: "verification", label: "Verification", cls: "wrap" }], { coll: "sources" });
    else if (tab === "folders") body = `<div class="panel help"><h3>Recommended folder structure</h3><p class="muted" style="margin:0">Keep full-size originals in a shared drive with this layout, then link or upload compressed copies here. Name files <span class="mono">YYYY-MM-DD_PartID_short-description.jpg</span>.</p>
      <pre class="mono" style="background:var(--panel);padding:12px;border-radius:6px;overflow-x:auto;margin:0">/GS750/
  00_Admin/        identity photos (blur serial numbers in shared copies), title, notes
  01_Inventory/    tray and bag photos, labels, counts
  02_Engine/       teardown, measurements, machine-shop reports
  03_Fuel/         carb markings, jets, float heights, tank interior
  04_Electrical/   harness routing, connectors, wiring diagrams
  05_Chassis/      frame, forks, wheels, brakes
  06_Finish/       before / after, products, cure records
  07_Assembly/     routing, torque records, fastener locations
  08_Testing/      pre-start, first start, road-test evidence
  09_Receipts/     invoices and receipts by date
  10_Manuals/      factory manual, parts fiche, service bulletins</pre></div>`;
    else body = filterBar("docs", [{ k: "q", type: "search", label: "Search title, tag, caption" }, { k: "kind", label: "Type", opts: optsOf(DOC_KINDS) }, { k: "part", label: "Part", opts: sorted("parts").map(p => [p.id, p.id + " " + p.name]) }]) +
      (ds.length ? `<div class="gallery">${ds.map(d => `<button class="ph-card" data-open="docs|${d.id}"><div class="img">${d.file && d.file.startsWith("data:image") ? `<img src="${d.file}" alt="${esc(d.title)}" loading="lazy">` : d.file ? "Document" : d.link ? "Linked file" : d.planned ? "Planned shot" : "No file"}</div><div class="cap"><b style="font-weight:500">${esc(d.title || d.id)}</b><span class="faint">${esc(d.kind)}${d.partId ? " · " + esc(d.partId) : ""}${d.taskId ? " · " + esc(d.taskId) : ""}</span></div></button>`).join("")}</div>` : `<div class="empty"><b>No photos match</b>Upload photos or clear filters.</div>`);
    return `<div class="ph"><div><h1>Photos & documents</h1><p>Images are compressed to about 1280 px so they fit the shared database. Store full-size originals and large PDFs in your drive and link them.</p></div><div class="act"><button class="btn" id="docCsv">${ic("download")} Documentation index</button><button class="btn" data-new="docs">${ic("plus")} Add link / note</button><button class="btn pri" id="docUp">${ic("image")} Upload photos</button></div></div>
    <div class="tabs">${[["gallery", "Gallery"], ["sources", "Reference sources"], ["folders", "Folder structure"]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>${body}`;
  },
  bind(root) { bindTables(root); bindFilters(root, "docs"); $$("[data-tab]", root).forEach(b => b.onclick = () => { R.tab.docs = b.dataset.tab; render(false); }); $("#docUp").onclick = () => uploadPhotos({});
    $("#docCsv").onclick = () => saveFile("gs750-documentation-index-" + today() + ".csv", csvOf(sorted("docs"), [{ k: "id", label: "ID" }, { k: "title", label: "Title" }, { k: "kind", label: "Type" }, { k: "date", label: "Date" }, { k: "partId", label: "Part" }, { k: "taskId", label: "Task" }, { k: "inspectionId", label: "Inspection" }, { k: "purchaseId", label: "Purchase" }, { k: "folder", label: "Folder" }, { k: "fileName", label: "File name" }, { label: "Stored here", get: d => d.file ? "Yes" : "No" }, { k: "link", label: "Link" }, { k: "tags", label: "Tags" }, { k: "caption", label: "Caption" }]), "text/csv"); }
};

/* ============ PROBLEMS & DECISIONS ============ */
VIEWS.problems = {
  render() {
    const tab = R.tab.problems || "issues", iss = sorted("issues"), dec = sorted("decisions");
    const hot = iss.filter(i => ["High", "Critical"].includes(i.severity) && !["Resolved", "Closed"].includes(i.status));
    const f = fstate("problems");
    const rowsI = iss.filter(i => (!f.status || i.status === f.status) && (!f.sev || i.severity === f.sev) && (!f.type || i.type === f.type));
    return `<div class="ph"><div><h1>Problems & decisions</h1><p>Log damaged or missing parts, wear, faults, delays and safety concerns. Record the big choices once so nobody re-argues them.</p></div><div class="act"><button class="btn" data-new="decisions">${ic("plus")} Decision</button><button class="btn pri" data-new="issues">${ic("plus")} Problem</button></div></div>
    ${hot.length ? `<div class="banner bad"><div class="grow"><b>${hot.length} unresolved high-severity problem${hot.length > 1 ? "s" : ""}</b><div class="linklist" style="margin-top:6px;background:var(--surface)">${hot.map(i => `<button data-open="issues|${i.id}"><span class="mono faint">${i.id}</span><span class="grow">${esc(i.description)}</span>${sevPill(i.severity)}</button>`).join("")}</div></div></div>` : ""}
    <div class="tabs">${[["issues", `Problems (${iss.filter(i => !["Resolved", "Closed"].includes(i.status)).length} open)`], ["decisions", `Decisions (${dec.filter(d => d.status !== "Decided").length} open)`]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>
    ${tab === "issues" ? filterBar("problems", [{ k: "status", label: "Status", opts: optsOf(["Open", "In progress", "Resolved", "Closed"]) }, { k: "sev", label: "Severity", opts: optsOf(SEV) }, { k: "type", label: "Type", opts: optsOf(SCHEMA.issues.fields.find(x => x.k === "type").opts) }]) + table("iss", rowsI, [{ k: "id", label: "ID", get: i => `<span class="mono">${i.id}</span>` }, { k: "description", label: "Problem", cls: "wrap" }, { k: "type", label: "Type" }, { k: "severity", label: "Severity", get: i => sevPill(i.severity), sort: i => SEV.indexOf(i.severity) }, { k: "safety", label: "Safety" }, { k: "owner", label: "Owner", get: i => i.owner ? refName("team", i.owner) : esc(i.ownerRole || "—") }, { k: "target", label: "Target", get: i => fmtDate(i.target) || "—" }, { k: "costImpact", label: "Cost impact", get: i => n(i.costImpact) ? money(i.costImpact) : "—", cls: "r" }, { k: "status", label: "Status", get: i => resPill(i.status) }], { coll: "issues", emptyTitle: "No problems logged" })
      : table("dec", dec, [{ k: "id", label: "ID", get: d => `<span class="mono">${d.id}</span>` }, { k: "topic", label: "Decision", cls: "wrap" }, { k: "options", label: "Options", cls: "wrap" }, { k: "choice", label: "Choice", get: d => esc(d.choice) || `<span class="faint">undecided</span>`, cls: "wrap" }, { k: "decisionFrom", label: "Needed from" }, { k: "status", label: "Status", get: d => resPill(d.status) }], { coll: "decisions" })}`;
  },
  bind(root) { bindTables(root); bindFilters(root, "problems"); $$("[data-tab]", root).forEach(b => b.onclick = () => { R.tab.problems = b.dataset.tab; render(false); }); }
};

/* ============ GATES ============ */
VIEWS.gates = {
  render() {
    const m = meta(), bl = roadReadyBlockers(), ready = m.roadReady && !bl.length, gates = sorted("gates"), checks = sorted("checks");
    const tab = R.tab.gates || "gates";
    return `<div class="ph"><div><h1>Safety & quality gates</h1><p>Finishing a task and approving it are separate steps. Safety-critical approvals need a documented result, a reviewer and a date. The bike can't be marked road-ready while any required check has failed or is still open.</p></div></div>
    <div class="banner ${ready ? "good" : bl.length ? "bad" : "warn"}"><div class="grow">
      ${ready ? `<b>Road-ready.</b> Approved by ${esc(m.roadReadyBy)} on ${fmtDate(m.roadReadyDate)}.` : m.roadReady && bl.length ? `<b>Road-ready status is suspended.</b> A check has failed or reopened since it was approved.` : `<b>Not road-ready.</b> ${bl.length} item${bl.length === 1 ? "" : "s"} must pass first.`}
      ${bl.length ? `<details style="margin-top:6px"><summary style="cursor:pointer">Show what's blocking</summary><div class="linklist" style="margin-top:6px;background:var(--surface);max-height:260px;overflow:auto">${bl.map(b => `<button data-open="${b.c}|${esc(b.id)}"><span class="grow">${esc(b.t)}</span></button>`).join("")}</div></details>` : ""}</div>
      ${ME.canWrite ? (m.roadReady ? `<button class="btn" id="rrRevoke">Withdraw road-ready</button>` : `<button class="btn pri" id="rrMark" ${bl.length ? "disabled" : ""} title="${bl.length ? "Blocked until every required gate and safety check passes" : ""}">Mark road-ready</button>`) : ""}</div>
    <div class="tabs">${[["gates", `Quality gates (${gates.filter(g => g.status === "Passed").length}/${gates.length} passed)`], ["checks", `Pre-start & road checks (${checks.filter(c => c.result === "Pass").length}/${checks.length})`]].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? "on" : ""}">${l}</button>`).join("")}</div>
    ${tab === "gates" ? `<div class="panel" style="padding:0"><div class="gatebox">${gates.map(g => { const out = gateOutstanding(g); return `<div class="gaterow" data-open="gates|${g.id}" tabindex="0"><span class="mono muted">${g.id}</span><div style="min-width:0"><b style="font-weight:500">${esc(g.name)}</b><div class="faint" style="font-size:12px">${out.length ? out.length + " required task(s) open" : "All required tasks complete"}${g.reviewer ? " · reviewed by " + refName("team", g.reviewer) : ""}${g.blocks ? " · blocks next phase" : ""}</div></div>${resPill(g.status)}</div>`; }).join("")}</div></div>`
      : table("chk", checks, [{ k: "id", label: "ID", get: c => `<span class="mono">${c.id}</span>` }, { k: "system", label: "System" }, { k: "check", label: "Check", get: c => `${esc(c.check)}<div class="faint" style="font-size:12px">${esc(c.criteria)}</div>`, cls: "wrap" }, { k: "criticality", label: "Criticality", get: c => sevPill(c.criticality) }, { k: "links", label: "Links", get: c => `<span class="mono faint">${esc(c.links)}</span>` }, { k: "result", label: "Result", get: c => resPill(c.result) + (c.result === "Fail" && c.reinspection ? ` <span class="tag">Reinsp. ${esc(c.reinspection)}</span>` : ""), sort: c => RESULT.indexOf(c.result) }, { k: "inspector", label: "Inspector", get: c => refName("team", c.inspector) }, { k: "date", label: "Date", get: c => fmtDate(c.date) || "—" }], { coll: "checks" })}`;
  },
  bind(root) { bindTables(root); $$("[data-tab]", root).forEach(b => b.onclick = () => { R.tab.gates = b.dataset.tab; render(false); }); $$(".gaterow", root).forEach(r => r.onkeydown = e => { if (e.key === "Enter") r.click(); });
    $("#rrMark") && ($("#rrMark").onclick = () => modal(`<h3>Mark the bike road-ready</h3><p class="muted" style="margin:0">Every required gate and safety check has passed. Record who approved it.</p><div class="fld"><label for="rrBy">Approved by</label><select id="rrBy"><option value="">— choose —</option>${sorted("team").filter(t => /Owner|Inspector/.test(t.role)).map(t => `<option value="${esc(t.name)}">${esc(t.name)} (${esc(t.role)})</option>`).join("")}</select>${!sorted("team").some(t => /Owner|Inspector/.test(t.role)) ? `<span class="err">Add a team member with the Owner or Inspector role first.</span>` : ""}</div><div class="fld"><label for="rrDate">Date</label><input id="rrDate" type="date" value="${today()}"></div><div class="row"><button class="btn" data-x>Cancel</button><button class="btn pri" data-ok>Approve</button></div>`, md => {
      md.querySelector("[data-x]").onclick = closeModal;
      md.querySelector("[data-ok]").onclick = async () => { const by = $("#rrBy").value, d = $("#rrDate").value; if (!by || !d) { toast("Choose the approver and date.", "err"); return; } if (roadReadyBlockers().length) { toast("Something changed: road-ready is blocked again.", "err"); closeModal(); return; } const m = clone(meta()); Object.assign(m, { roadReady: true, roadReadyBy: by, roadReadyDate: d }); await store.put("meta", m, { action: "marked the bike road-ready" }); closeModal(); toast("Marked road-ready"); };
    }));
    $("#rrRevoke") && ($("#rrRevoke").onclick = () => confirmBox("Withdraw road-ready status?", "<p style='margin:0'>The bike will show as not road-ready until it's approved again.</p>", "Withdraw", async () => { const m = clone(meta()); Object.assign(m, { roadReady: false, roadReadyBy: "", roadReadyDate: "" }); await store.put("meta", m, { action: "withdrew road-ready status" }); })); }
};

/* ============ MAINTENANCE ============ */
VIEWS.maintenance = {
  render() {
    const rows = sorted("maintenance").sort((a, b) => (a.planned === b.planned ? String(b.date).localeCompare(String(a.date)) : a.planned ? 1 : -1));
    return `<div class="ph"><div><h1>Maintenance log</h1><p>Service history after the restoration. Intervals are filled in only from the factory manual or your rebuilder's written instructions; until then they read VERIFY.</p></div><div class="act"><button class="btn" id="mntCsv">${ic("download")} Export CSV</button><button class="btn pri" data-new="maintenance">${ic("plus")} Log service</button></div></div>
    ${table("mnt", rows, [{ k: "id", label: "ID", get: r => `<span class="mono">${r.id}</span>` }, { k: "service", label: "Service", get: r => `${esc(r.service)}${r.planned ? ` <span class="tag">Planned</span>` : ""}`, cls: "wrap" }, { k: "date", label: "Date", get: r => r.planned ? "—" : fmtDate(r.date) }, { k: "odometer", label: "Odometer" }, { k: "interval", label: "Interval", get: r => specCell(r.interval) }, { k: "technician", label: "Technician", get: r => refName("team", r.technician) }, { k: "cost", label: "Cost", get: r => n(r.cost) ? money2(r.cost) : "—", cls: "r" }, { k: "next", label: "Next due", get: r => [fmtDate(r.nextDate), r.nextMiles ? r.nextMiles + " mi" : ""].filter(Boolean).join(" / ") || "—" }], { coll: "maintenance" })}`;
  },
  bind(root) { bindTables(root); $("#mntCsv").onclick = () => saveFile("gs750-maintenance-" + today() + ".csv", csvOf(sorted("maintenance"), ["id", "date", "odometer", "service", "interval", "partsUsed", "cost", "nextDate", "nextMiles", "source", "notes"].map(k => ({ k, label: k }))), "text/csv"); }
};

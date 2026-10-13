/* ============ SETTINGS & DATA ============ */
VIEWS.settings = {
  render() {
    const m = meta();
    const inp = (k, label, type = "text", extra = "") => `<div class="fld"><label for="set-${k}">${esc(label)}</label><input id="set-${k}" data-mk="${k}" type="${type}" value="${esc(m[k] ?? "")}" ${type === "number" ? 'step="any"' : ""} ${ME.canWrite ? "" : "disabled"} ${extra}></div>`;
    const counts = COLLS.filter(c => c !== "activity" && c !== "meta").map(c => [c, all(c).length]);
    const exN = COLLS.reduce((s, c) => s + all(c).filter(r => r.example).length, 0);
    return `<div class="ph"><div><h1>Settings & data</h1><p>Project details, budget settings and data management.</p></div></div>
    <div class="grid g2" style="align-items:start">
      <div class="panel stack"><h2 class="sec">Project & motorcycle</h2><form class="form" id="setForm">
        ${inp("projectName", "Project name")}${inp("bike", "Motorcycle")}
        <div class="fld full"><label for="set-variant">Model variant</label><input id="set-variant" data-mk="variant" value="${esc(m.variant || "")}" ${ME.canWrite ? "" : "disabled"}><span class="hint">1977 catalogs split GS750B and GS750E/EC and other model letters. Confirm from frame and engine IDs before using part numbers, wiring diagrams or carb settings.</span></div>
        ${inp("frameNo", "Frame number (keep private)")}${inp("engineNo", "Engine number (keep private)")}${inp("color", "Color / paint code")}
        <div class="fld"><label for="set-units">Measurement units</label><select id="set-units" data-mk="units" ${ME.canWrite ? "" : "disabled"}>${[["in", "Inches / ft-lb"], ["mm", "Millimetres / N·m"]].map(([v, l]) => `<option value="${v}" ${m.units === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="fld full"><h2 class="sec" style="margin:8px 0 0">Budget</h2></div>
        ${inp("baseBudget", "Original budget (USD)", "number", 'min="0"')}${inp("contingencyPct", "Contingency %", "number", 'min="0" max="100"')}
        ${inp("laborRate", "Default labor rate (optional)", "number", 'min="0"')}
        <div class="fld"><label>&nbsp;</label><label class="chk"><input type="checkbox" data-mk="showLaborValue" ${m.showLaborValue ? "checked" : ""} ${ME.canWrite ? "" : "disabled"}> Show estimated labor value</label></div>
        <div class="fld full"><label for="set-cats">Expense categories (one per line)</label><textarea id="set-cats" data-mk="expenseCategories" ${ME.canWrite ? "" : "disabled"}>${esc((m.expenseCategories || []).join("\n"))}</textarea></div>
      </form>${ME.canWrite ? `<div class="row"><button class="btn pri" id="setSave">Save settings</button><span class="muted" id="setMsg"></span></div>` : ""}</div>
      <div class="stack">
        ${vehSettingsHtml()}
        <div class="panel stack"><h2 class="sec">Where your data lives</h2>
          ${ME.mode === "shared" ? `<p style="margin:0">Records are stored in this page's shared database. Everyone you share the page with sees the same data and changes appear live. People with Contributor access or above can edit; Viewers and Commenters can only read. ${ME.canWrite ? "" : "<b>You have view-only access.</b>"}</p>` : `<p style="margin:0"><b>This copy keeps data in this browser only.</b> It does not sync between people or devices. Export a backup regularly, and open the published page to use the shared team database.</p>`}
          <p class="muted" style="margin:0;font-size:12.5px">${counts.map(([c, v]) => `${SCHEMA[c]?.plural || c}: ${v}`).join(" · ")}</p></div>
        <div class="panel stack"><h2 class="sec">Backup & export</h2>
          <div class="row"><button class="btn pri" id="bkJson">${ic("download")} Full backup (JSON)</button><button class="btn" id="bkImport">Import backup</button></div>
          <div class="row">${["parts", "tasks", "inspections", "purchases", "expenses", "worklogs", "issues", "gates", "checks"].map(c => `<button class="btn sm" data-csv="${c}">${esc(SCHEMA[c].plural)} CSV</button>`).join("")}</div>
          <p class="muted" style="margin:0;font-size:12.5px">The JSON backup holds every record, including compressed photos. Import merges by ID: matching records are replaced, others are kept.</p></div>
        <div class="panel stack"><h2 class="sec">Workbook & example data</h2>
          <div class="row"><button class="btn" id="reBase">Restore missing workbook records</button>${exN ? `<button class="btn" id="exRemove">Remove ${exN} example records</button>` : `<button class="btn" id="exAdd">Add example records</button>`}</div>
          <p class="muted" style="margin:0;font-size:12.5px">Restoring only adds workbook records that were deleted; it never overwrites your edits. Example records are tagged EXAMPLE and can be removed in one step.</p></div>
        <div class="panel stack" style="border-color:var(--red)"><h2 class="sec" style="color:var(--red)">Reset project</h2><p style="margin:0;font-size:13px">Deletes every record and reloads the original workbook. A full backup downloads first.</p><div><button class="btn danger" id="resetAll" ${ME.canWrite ? "" : "disabled"}>Reset to workbook…</button></div></div>
      </div>
    </div>`;
  },
  bind(root) {
    bindVehSettings(root);
    $("#setSave") && ($("#setSave").onclick = async () => {
      const m = clone(meta()); let bad = "";
      $$("[data-mk]", root).forEach(el => { const k = el.dataset.mk; if (el.type === "checkbox") m[k] = el.checked; else if (k === "expenseCategories") m[k] = el.value.split("\n").map(s => s.trim()).filter(Boolean); else if (el.type === "number") { if (el.value !== "" && (!isFinite(+el.value) || +el.value < 0)) bad = el.previousElementSibling.textContent; m[k] = n(el.value); } else m[k] = el.value.trim(); });
      if (bad) { toast(bad + " must be a positive number.", "err"); return; }
      if (m.contingencyPct > 100) { toast("Contingency can't exceed 100%.", "err"); return; }
      if (!m.projectName) { toast("Project name can't be empty.", "err"); return; }
      await store.put("meta", m, { action: "updated project settings" }); toast("Settings saved");
    });
    $("#bkJson").onclick = backupJson;
    $("#bkImport").onclick = () => importJson();
    $$("[data-csv]", root).forEach(b => b.onclick = () => { const c = b.dataset.csv, rows = sorted(c); const keys = ["id", ...SCHEMA[c].fields.map(f => f.k), "createdAt", "updatedAt", "updatedBy"]; saveFile(`gs750-${c}-${today()}.csv`, csvOf(rows, keys.map(k => ({ k, label: k }))), "text/csv"); });
    $("#reBase").onclick = () => loadBaseline(false);
    $("#exAdd") && ($("#exAdd").onclick = addExamples);
    $("#exRemove") && ($("#exRemove").onclick = () => confirmBox("Remove example records?", "<p style='margin:0'>Only records tagged EXAMPLE are deleted.</p>", "Remove", async () => { const del = []; COLLS.forEach(c => all(c).filter(r => r.example).forEach(r => del.push([c, r.id]))); for (const [c, id] of del) await store.del(c, id, { noLog: true }); toast("Removed " + del.length + " example records"); }));
    $("#resetAll").onclick = () => modal(`<h3>Reset the whole project?</h3><p style="margin:0">Every record, photo and log entry will be deleted for everyone, then the original workbook is reloaded. A backup file is saved first. Type <b>RESET</b> to confirm.</p><input id="rsConf" autocomplete="off" style="padding:6px 8px;border:1px solid var(--line-2);border-radius:5px" aria-label="Type RESET"><div class="row"><button class="btn" data-x>Cancel</button><button class="btn danger" data-ok>Back up and reset</button></div>`, md => {
      md.querySelector("[data-x]").onclick = closeModal;
      md.querySelector("[data-ok]").onclick = async () => { if ($("#rsConf").value !== "RESET") { toast("Type RESET to confirm.", "err"); return; } closeModal(); await backupJson(); const del = []; COLLS.forEach(c => all(c).forEach(r => del.push([c, r.id]))); setSave("busy"); for (const [c, id] of del) await store.del(c, id, { noLog: true }); await loadBaseline(true); };
    });
  }
};
async function backupJson() { const out = { app: "GS750 Restoration HQ", version: 1, exportedAt: nowISO(), collections: {} }; COLLS.forEach(c => out.collections[c] = all(c)); await saveFile("gs750-backup-" + today() + ".json", JSON.stringify(out, null, 1), "application/json"); }
async function addExamples() {
  const t1 = { id: "TM-EX1", name: "Example: lead mechanic", role: ROLES[1], experience: "Experienced", rate: 0, skills: "Engine teardown, carbs", example: true };
  const t2 = { id: "TM-EX2", name: "Example: inspector", role: ROLES[2], experience: "Professional", rate: 0, skills: "Brakes, frames, sign-off", example: true };
  const w = [{ c: "team", rec: t1 }, { c: "team", rec: t2 },
    { c: "worklogs", rec: { id: "LAB-EX01", memberId: "TM-EX1", date: today(), hours: 2.5, taskId: "A-003", work: "Example session: photographed trays 1–6 before handling.", approval: "Pending", example: true } },
    { c: "expenses", rec: { id: "TXN-EX01", date: today(), description: "Example: storage bins and labels", category: "Miscellaneous", vendor: "Example vendor", amount: 42.5, status: "Paid", example: true } },
    { c: "purchases", rec: { id: "PUR-EX01", description: "Example quote: carb rebuild kit (set of 4)", partId: "INV-0011", taskId: "I-004", status: "Quote", qty: 1, supplier: "Example supplier A", unitPrice: 120, shipping: 12, tax: 0, fees: 0, fitment: "Pending", qc: "Pending", example: true, notes: "Example only. Not a real price." } },
    { c: "purchases", rec: { id: "PUR-EX02", description: "Example quote: carb rebuild kit (set of 4)", partId: "INV-0011", taskId: "I-004", status: "Quote", qty: 1, supplier: "Example supplier B", unitPrice: 105, shipping: 25, tax: 6, fees: 0, fitment: "Pending", qc: "Pending", example: true, notes: "Example only. Not a real price." } }];
  await store.bulk(w); toast("Added " + w.length + " example records");
}

/* ============ HELP ============ */
VIEWS.help = { render() { return `<div class="ph"><div><h1>Help & workflow</h1><p>How the team uses Revora from teardown to first ride.</p></div></div>
  <div class="panel help">
  <h3>The order of work</h3>
  <ol><li><b>Confirm the bike.</b> Task A-001: record frame and engine IDs and the exact variant in Settings. Part numbers, wiring diagrams and carb settings depend on it.</li>
  <li><b>Get the references.</b> The factory service manual and the parts fiche for your variant (C-001, C-002). Until a value comes from the manual, inspections show <span class="verify">VERIFY IN FSM</span>.</li>
  <li><b>Inventory and photograph</b> everything before cleaning (phase A–B). Give each tray, bag and assembly a location and bin number.</li>
  <li><b>Assess before deciding.</b> Measure, then decide repair or replace. Log surprises under Problems; log big choices under Decisions.</li>
  <li><b>Work the modules</b> in parallel where the roadmap allows. The roadmap's arrows are the real dependencies.</li>
  <li><b>Pass the gates.</b> Each quality gate needs its tasks complete, a documented result, a reviewer and a date.</li>
  <li><b>Pre-start and road checks.</b> Every critical check must pass before the bike can be marked road-ready.</li></ol>
  <h3>What the part colors mean</h3>
  <p>${pill("red", "Red")} untouched or not yet restored. ${pill("amber", "Amber")} in progress, waiting on parts, or work done but inspection not passed. ${pill("green", "Green")} work complete <i>and</i> every linked inspection passed. ${pill("gray", "Gray")} missing or not applicable. Marking work complete alone never turns a part green.</p>
  <h3>Daily routine</h3>
  <ul><li>Pick a task from <b>Next recommended tasks</b> on the Overview, or filter Tasks by “Ready to start”.</li><li>Open the part from the 3D view or inventory, set it to In progress, and upload photos as you go.</li><li>At the end of a session, <b>Log work session</b> with hours, what you did, and handoff notes for the next person.</li><li>Log every expense when it's paid, linked to its purchase order so it isn't counted twice.</li></ul>
  <h3>Money</h3><p><b>Paid</b> is cash out. <b>Committed</b> is ordered but not yet expensed, plus unpaid bills. <b>Planned</b> is the lowest open quote per part plus cost estimates on open tasks. Forecast = paid + committed + planned.</p>
  <h3>Sharing and access</h3><p>${ME.mode === "shared" ? "Share this page from the artifact's share menu. Contributors and above can edit; Viewers can only read. Everyone sees the same records live." : "This copy saves to this browser only. Use the published page for shared team data."} Roles in the Team list decide who signs off; edit rights come from the share menu.</p>
  <h3>Backups</h3><p>Settings → Full backup (JSON) saves every record and photo. Import merges a backup by ID. Do this before big changes.</p>
  <h3>Replacing the 3D model</h3><p>The built-in bike is a simplified prototype made of selectable groups, not factory CAD. On the 3D page, load a GLB file with separately named meshes, then map each mesh to a part ID. Meshes named with a part ID (for example <span class="mono">INV-0012_tank</span>) map automatically. The mapping is saved with the project; the GLB file itself stays in your browser, so each device loads it once.</p>
  <h3>Keyboard</h3><p><span class="mono">/</span> focuses search · <span class="mono">Esc</span> closes panels · <span class="mono">Ctrl/⌘ + Enter</span> saves a form · <span class="mono">Enter</span> opens a focused row.</p>
  </div>`; } };

/* ============ DRAWER EXTRAS ============ */
const DRAWER_EXTRA = {};
const busyDraft = () => { if (drawerState.dirty) { toast("Save or discard your edits first.", "err"); return true; } return false; };
/* Suzuki part numbers for every catalogue item that belongs to this record, from the diagrams' CMSNL data. */
function partCatalogueHtml(id) {
  if (typeof DIAGRAMS === "undefined") return "";
  const rows = []; DIAGRAMS.forEach(d => d.cms && d.parts.forEach(x => { if (x.part === id && x.pn) rows.push({ d, x }); }));
  if (!rows.length) return "";
  return `<div><h2 class="sec left">Suzuki part numbers</h2><div class="linklist">${rows.map(({ d, x }) => `<button type="button" data-godiag="${d.id}|${x.k}"><span class="mono faint">ref ${esc(String(x.ref))}</span><span class="grow">${esc(x.name)}<small class="faint" style="display:block">${esc(d.title)}</small></span><code>${esc(x.pn.map(fmtPn).join(", "))}</code></button>`).join("")}</div><p class="hint-text" style="text-align:left;margin:4px 0 0">From the CMSNL catalogue for the GS750B 1977 USA. Current numbers after Suzuki's replacements.</p></div>`;
}
document.addEventListener("click", e => { const b = e.target.closest("[data-godiag]"); if (!b) return; const [id, k] = b.dataset.godiag.split("|"); closeDrawer(); DV.id = null; go("diagram-" + id); DV.sel = k; render(true); });
DRAWER_EXTRA.parts = (p, isNew) => {
  if (isNew) return { head: "" };
  const ts = tasksForPart(p.id), ins = partInspections(p.id), purs = purchasesForPart(p.id), ds = docsFor("partId", p.id), kids = sorted("parts").filter(x => x.parent === p.id);
  const color = partColor(S.parts[p.id] || p), insState = partInspectionState(p);
  const meas = ins.filter(i => i.actual);
  const g3 = (PROTO.find(x => x[2] === p.id) || [])[0];
  return {
    head: partPill(S.parts[p.id] || p),
    top: `${PART_IMG[p.id] ? `<div style="text-align:center;background:var(--stage-bg);border-radius:14px;padding:6px"><img src="${PART_IMG[p.id]}" alt="" style="max-height:200px"></div>` : ""}
    ${g3 ? `<div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn" id="q3d">${ic("cube")} See it in 3D</button>${scanBtn(GROUP_DIAG[g3], "Scan these parts", "btn")}</div>` : ""}
    ${askBtn(`Tell me about the ${p.name} on a 1977 GS750: what it does, what usually wears out, and how to inspect it.`, p.name, "btn ask")}
    ${partCatalogueHtml(p.id)}
    <div class="panel blue stack" style="padding:12px">
      <div class="row"><span class="sw" style="background:${COL[color]}"></span><b>${esc(COLOR_LABEL[color])}</b><span class="muted">· inspection: ${esc(insState)}</span></div>
      ${ME.canWrite ? `<div class="row"><label for="qStatus" class="muted">Change status</label><select id="qStatus">${PART_STATUS.map(s => `<option ${s === S.parts[p.id].status ? "selected" : ""}>${s}</option>`).join("")}</select>
        <button class="btn sm tan" id="qApprove">${ic("shield")} Approve inspection</button></div>
      <div class="row"><button class="btn sm" id="qInsp">${ic("plus")} Inspection</button><button class="btn sm" id="qTask">${ic("plus")} Task</button><button class="btn sm" id="qPhoto">${ic("image")} Upload photo</button><button class="btn sm" id="qPur">${ic("cart")} Purchase request</button><button class="btn sm" id="qIssue">${ic("alert")} Problem</button></div>` : ""}
      ${S.parts[p.id].status === "Work complete" && color !== "green" ? `<p style="margin:0;font-size:12.5px" class="muted">Work is complete. This part turns green once its inspection passes${ins.some(i => i.result === "Pending") ? " (" + ins.filter(i => i.result === "Pending").length + " pending)" : ""}.</p>` : ""}
    </div>
    <dl class="kv"><dt>Estimated cost</dt><dd class="num">${money2(p.estCost)}</dd><dt>Actual cost</dt><dd class="num">${money2(partActualCost(p.id))} <span class="faint">(paid expenses linked to this part or its orders)</span></dd><dt>Purchase status</dt><dd>${purs.length ? purs.map(x => `${x.id} ${x.status}`).join(", ") : "No purchases"}</dd><dt>Assigned</dt><dd>${refName("team", p.assignee)}</dd>${p.parent ? `<dt>Part of</dt><dd>${refLink("parts", p.parent)}</dd>` : ""}</dl>
    <div><h2 class="sec">Photos (${ds.length})</h2>${thumbs(ds)}</div>`,
    bottom: `<div><h2 class="sec">Linked tasks (${ts.length})</h2>${ts.length ? `<div class="linklist">${ts.map(t => `<button type="button" data-open="tasks|${t.id}"><span class="mono faint">${t.id}</span><span class="grow">${esc(t.title)}</span>${taskPill(t)}</button>`).join("")}</div>` : `<span class="faint">No tasks link this part.</span>`}</div>
      <div><h2 class="sec">Inspections (${ins.length})</h2>${ins.length ? `<div class="linklist">${ins.map(i => `<button type="button" data-open="inspections|${i.id}"><span class="mono faint">${i.id}</span><span class="grow">${esc(i.point)}${i.safetyCritical ? " · safety" : ""}</span>${resPill(i.result)}</button>`).join("")}</div>` : `<span class="faint">No inspections yet.</span>`}</div>
      <div><h2 class="sec">Measurements (${meas.length})</h2>${meas.length ? table("pm-" + p.id, meas, [{ k: "point", label: "Point" }, { k: "spec", label: "Spec", get: i => specCell(i.spec) }, { k: "actual", label: "Actual", get: i => esc(i.actual + " " + (i.units || "")) }, { k: "result", label: "Result", get: i => resPill(i.result) }], { coll: "inspections" }) : `<span class="faint">No measurements recorded.</span>`}</div>
      <div><h2 class="sec">Purchases (${purs.length})</h2>${purs.length ? `<div class="linklist">${purs.map(x => `<button type="button" data-open="purchases|${x.id}"><span class="mono faint">${x.id}</span><span class="grow">${esc(x.description)} ${landed(x) ? "· " + money2(landed(x)) : ""}</span>${pill(PUR_COLOR[x.status], x.status)}</button>`).join("")}</div>` : `<span class="faint">None.</span>`}</div>
      <div><h2 class="sec">Where to find this part</h2><div class="stack" style="gap:6px">${partFinderLinks(p)}</div></div>
      ${kids.length ? `<div><h2 class="sec">Sub-parts</h2><div class="linklist">${kids.map(k => `<button type="button" data-open="parts|${k.id}"><span class="mono faint">${k.id}</span><span class="grow">${esc(k.name)}</span>${partPill(k)}</button>`).join("")}</div></div>` : ""}`,
    bind(host) {
      $("#q3d", host) && ($("#q3d", host).onclick = () => { const k = (PROTO.find(x => x[2] === p.id) || [])[0]; closeDrawer(); openIn3D(k); });
      const q = $("#qStatus", host); if (!q) return;
      q.onchange = async () => { if (busyDraft()) { q.value = S.parts[p.id].status; return; } await quickSet("parts", p.id, { status: q.value }, `${p.id} → ${q.value}`); };
      $("#qApprove", host).onclick = () => { if (!busyDraft()) approveInspection(p.id); };
      $("#qInsp", host).onclick = () => { if (!busyDraft()) openRecord("inspections", null, { partId: p.id, component: p.name, safetyCritical: ["High", "Critical"].includes(p.priority) }); };
      $("#qTask", host).onclick = () => { if (!busyDraft()) openRecord("tasks", null, { partIds: [p.id], module: p.module, subsystem: p.subsystem, title: "" }); };
      $("#qPhoto", host).onclick = () => uploadPhotos({ partId: p.id });
      $("#qPur", host).onclick = () => { if (!busyDraft()) openRecord("purchases", null, { partId: p.id, description: p.name }); };
      $("#qIssue", host).onclick = () => { if (!busyDraft()) openRecord("issues", null, { partId: p.id }); };
    }
  };
};
function approveInspection(pid) {
  const p = S.parts[pid], pend = partInspections(pid).filter(i => i.result === "Pending" || (i.result === "Fail" && i.reinspection !== "Pass"));
  const crit = ["High", "Critical"].includes(p.priority);
  const team = sorted("team");
  modal(`<h3>Approve inspection · ${esc(p.id)} ${esc(p.name)}</h3>
    ${p.status !== "Work complete" ? `<div class="banner warn"><div class="grow">Status is “${esc(p.status)}”. The part stays amber until its status is Work complete.</div></div>` : ""}
    ${pend.length ? `<p style="margin:0">Record the result of each open inspection:</p>${pend.map(i => `<div class="fld"><label for="ap-${i.id}">${esc(i.id)} · ${esc(i.point)}${i.safetyCritical ? " (safety-critical)" : ""}</label><select id="ap-${i.id}" data-ap="${i.id}"><option value="">Leave as ${esc(i.result === "Fail" ? "failed" : "pending")}</option><option value="Pass" selected>${i.result === "Fail" ? "Reinspection passed" : "Pass"}</option><option value="Fail">Fail</option><option value="N/A">Not applicable</option></select></div>`).join("")}`
    : `<p style="margin:0">No open inspections on this part. This records a new final inspection with a Pass result.</p><div class="fld"><label for="apPoint">Inspection point</label><input id="apPoint" value="Final restoration inspection"></div><div class="fld"><label for="apActual">Measurement or observation (optional)</label><input id="apActual"></div>`}
    <div class="fld"><label for="apRev">Reviewer${crit || pend.some(i => i.safetyCritical) ? " (required: safety-critical)" : ""}</label><select id="apRev"><option value="">— none —</option>${team.map(t => `<option value="${t.id}" ${ME.actingAs === t.id ? "selected" : ""}>${esc(t.name)} · ${esc(t.role)}</option>`).join("")}</select>${!team.length ? `<span class="hint">Add team members to record reviewers.</span>` : ""}</div>
    <div class="fld"><label for="apNote">Notes</label><textarea id="apNote"></textarea></div>
    <div class="row"><button class="btn" data-x>Cancel</button><button class="btn pri" data-ok>Save result</button></div>`, m => {
    m.querySelector("[data-x]").onclick = closeModal;
    m.querySelector("[data-ok]").onclick = async () => {
      const rev = $("#apRev").value, note = $("#apNote").value.trim();
      const writes = [];
      if (pend.length) {
        $$("[data-ap]", m).forEach(sel => { if (!sel.value) return; const i = clone(S.inspections[sel.dataset.ap]); if (i.result === "Fail" && sel.value === "Pass") i.reinspection = "Pass"; else i.result = sel.value; i.reviewer = rev || i.reviewer; i.date = i.date || today(); i.technician = i.technician || ME.actingAs || ""; if (note) i.notes = (i.notes ? i.notes + "\n" : "") + note; writes.push(i); });
      } else writes.push(blank("inspections", { partId: pid, component: p.name, point: $("#apPoint").value || "Final restoration inspection", actual: $("#apActual").value, result: "Pass", reviewer: rev, technician: ME.actingAs || "", safetyCritical: crit, procedure: "Visual and functional check after restoration work.", notes: note }));
      for (const w of writes) { const e = validate("inspections", w); if (Object.keys(e).length) { toast(w.id + ": " + Object.values(e)[0], "err"); return; } }
      closeModal(); for (const w of writes) await store.put("inspections", w, { action: "inspection " + w.result.toLowerCase() + (w.reinspection === "Pass" ? " (reinspected)" : "") });
      const np = S.parts[pid]; toast(partColor(np) === "green" ? `${pid} approved: now green` : `${pid}: inspection recorded (${partStatusLabel(np)})`);
    };
  });
}
DRAWER_EXTRA.tasks = (t, isNew) => {
  if (isNew) return {};
  const open = openPrereqs(t), pts = (t.partIds || []).map(id => S.parts[id]).filter(Boolean), ds = docsFor("taskId", t.id), logs = sorted("worklogs").filter(w => w.taskId === t.id);
  const ins = sorted("inspections").filter(i => (t.partIds || []).includes(i.partId)); const deps = sorted("tasks").filter(x => (x.prereqs || []).includes(t.id));
  const st = S.tasks[t.id];
  return {
    head: taskPill(st) + (st.status === "Complete" ? resPill(st.approval === "Approved" ? "Pass" : "Pending").replace(/>(Pass|Pending)</, ">" + (st.approval === "Approved" ? "Approved" : "Not approved") + "<") : ""),
    top: `${open.length && !tasksClosed(st) ? `<div class="banner warn"><div class="grow"><b>Waiting on ${open.length} prerequisite${open.length > 1 ? "s" : ""}.</b> This task can't be approved until they're complete.<div class="row" style="margin-top:6px">${open.map(id => refLink("tasks", id)).join("")}</div></div></div>` : ""}
      ${ME.canWrite ? `<div class="panel blue row" style="padding:10px"><label class="muted" for="tqStatus">Status</label><select id="tqStatus">${TASK_STATUS.map(s => `<option ${s === st.status ? "selected" : ""}>${s}</option>`).join("")}</select>${st.status === "Complete" && st.approval !== "Approved" ? `<button class="btn sm tan" id="tqApprove" ${open.length ? "disabled" : ""}>${ic("shield")} Approve</button>` : ""}<button class="btn sm" id="tqLog">${ic("plus")} Log work</button><button class="btn sm" id="tqPhoto">${ic("image")} Evidence</button></div>` : ""}
      <div><h2 class="sec left">How to do it</h2>${howtoList(st, true)}</div>
      <dl class="kv"><dt>Labor</dt><dd class="num">${n(st.estHours)} h estimated · ${taskHours(t.id)} h logged in ${logs.length} session${logs.length === 1 ? "" : "s"}</dd><dt>Safety</dt><dd>${sevPill(st.safety)}</dd>${st.manualRef ? `<dt>Manual</dt><dd>${specCell(st.manualRef)}</dd>` : ""}${deps.length ? `<dt>Unlocks</dt><dd>${deps.map(d => `<span class="mono">${d.id}</span>`).join(", ")}</dd>` : ""}</dl>`,
    bottom: `<div><h2 class="sec">Linked parts (${pts.length})</h2>${pts.length ? `<div class="linklist">${pts.map(p => `<button type="button" data-open="parts|${p.id}"><span class="mono faint">${p.id}</span><span class="grow">${esc(p.name)}</span>${partPill(p)}</button>`).join("")}</div>` : `<span class="faint">No parts linked.</span>`}</div>
      ${ins.length ? `<div><h2 class="sec">Inspections on these parts</h2><div class="linklist">${ins.map(i => `<button type="button" data-open="inspections|${i.id}"><span class="mono faint">${i.id}</span><span class="grow">${esc(i.point)}</span>${resPill(i.result)}</button>`).join("")}</div></div>` : ""}
      <div><h2 class="sec">Evidence (${ds.length})</h2>${thumbs(ds)}</div>
      <div><h2 class="sec">Comments</h2>${(st.comments || []).length ? `<div class="feed">${st.comments.map(c => `<div><time>${fmtTime(c.ts)}</time><span><b>${esc(c.by)}</b> ${esc(c.text)}</span></div>`).join("")}</div>` : `<span class="faint">No comments.</span>`}
        ${ME.canWrite ? `<div class="row" style="margin-top:6px"><input id="tqComment" placeholder="Add a comment or handoff note" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--line-2);border-radius:5px" aria-label="Comment"><button type="button" class="btn sm" id="tqAddC">Post</button></div>` : ""}</div>`,
    bind(host) {
      const s = $("#tqStatus", host); if (!s) return;
      s.onchange = async () => { if (busyDraft()) { s.value = st.status; return; } await quickSet("tasks", t.id, { status: s.value }, `${t.id} → ${s.value}`); };
      $("#tqApprove", host) && ($("#tqApprove", host).onclick = () => { if (busyDraft()) return; const team = sorted("team"); modal(`<h3>Approve ${esc(t.id)}</h3><div class="fld"><label for="taRev">Reviewer</label><select id="taRev"><option value="">— choose —</option>${team.map(x => `<option value="${x.id}">${esc(x.name)} · ${esc(x.role)}</option>`).join("")}</select>${!team.length ? `<span class="err">Add a team member first.</span>` : ""}</div><div class="row"><button class="btn" data-x>Cancel</button><button class="btn pri" data-ok>Approve</button></div>`, m => { m.querySelector("[data-x]").onclick = closeModal; m.querySelector("[data-ok]").onclick = async () => { const r = $("#taRev").value; if (!r) { toast("Choose a reviewer.", "err"); return; } closeModal(); await quickSet("tasks", t.id, { approval: "Approved", reviewer: r }, t.id + " approved"); }; }); });
      $("#tqLog", host).onclick = () => { if (!busyDraft()) openRecord("worklogs", null, { taskId: t.id }); };
      $("#tqPhoto", host).onclick = () => uploadPhotos({ taskId: t.id, kind: "Inspection evidence" });
      const add = async () => { const v = $("#tqComment", host).value.trim(); if (!v || busyDraft()) return; const rec = clone(S.tasks[t.id]); rec.comments = [...(rec.comments || []), { ts: nowISO(), by: whoName(), text: v }]; await store.put("tasks", rec, { action: "commented: " + v.slice(0, 60) }); };
      $("#tqAddC", host).onclick = add; $("#tqComment", host).onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); add(); } };
    }
  };
};
DRAWER_EXTRA.inspections = (i, isNew) => ({
  head: isNew ? "" : resPill(S.inspections[i.id]?.result),
  top: `${!i.spec || i.spec === VERIFY ? `<div class="banner warn"><div class="grow">Specification not verified. Enter the value and page from the factory service manual for this exact bike. Don't use forum or generic values.</div></div>` : ""}
    ${!isNew ? `<div><h2 class="sec">Evidence</h2>${thumbs(docsFor("inspectionId", i.id))}${ME.canWrite ? `<div style="margin-top:6px"><button type="button" class="btn sm" id="iqPhoto">${ic("image")} Attach photo or document</button></div>` : ""}</div>` : ""}`,
  bind(host) { $("#iqPhoto", host) && ($("#iqPhoto", host).onclick = () => uploadPhotos({ inspectionId: i.id, partId: i.partId, kind: "Inspection evidence" })); }
});
DRAWER_EXTRA.purchases = (p, isNew) => {
  const others = p.partId ? sorted("purchases").filter(x => x.partId === p.partId && x.id !== p.id) : [];
  const exp = sorted("expenses").filter(e => e.purchaseId === p.id);
  return { head: isNew ? "" : pill(PUR_COLOR[S.purchases[p.id]?.status], S.purchases[p.id]?.status),
    top: `<dl class="kv"><dt>Delivered total</dt><dd class="num"><b>${money2(landed(p))}</b> <span class="faint">price × qty + shipping + tax + fees</span></dd>${others.length ? `<dt>Other quotes</dt><dd>${others.map(o => `${o.id} ${esc(o.supplier || "")} ${money2(landed(o))}`).join(" · ")}</dd>` : ""}<dt>Expensed</dt><dd>${exp.length ? exp.map(e => `${e.id} ${money2(e.amount)} ${e.status}`).join(", ") : "Not yet"}</dd></dl>
      ${!isNew && ME.canWrite && !exp.length && ORDERED.includes(S.purchases[p.id]?.status) ? `<button type="button" class="btn sm" id="pqExp">${ic("dollar")} Log payment for this order</button>` : ""}
      ${!isNew ? `<div><h2 class="sec">Receipt & supplier documents</h2>${thumbs(docsFor("purchaseId", p.id))}${ME.canWrite ? `<div style="margin-top:6px"><button type="button" class="btn sm" id="pqDoc">${ic("image")} Attach receipt</button></div>` : ""}</div>` : ""}`,
    bind(host) { $("#pqExp", host) && ($("#pqExp", host).onclick = () => { if (!busyDraft()) openRecord("expenses", null, { purchaseId: p.id, partId: p.partId, taskId: p.taskId, description: p.description, vendor: p.supplier, amount: Math.round(landed(p) * 100) / 100, category: "Replacement parts", status: "Paid" }); }); $("#pqDoc", host) && ($("#pqDoc", host).onclick = () => uploadPhotos({ purchaseId: p.id, partId: p.partId, kind: "Receipt" })); } };
};
DRAWER_EXTRA.docs = (d) => ({ top: d.file ? (d.file.startsWith("data:image") ? `<img src="${d.file}" alt="${esc(d.title)}" style="border-radius:6px;border:1px solid var(--line)">` : `<button type="button" class="btn" id="dqDl">${ic("download")} Save ${esc(d.fileName || "file")}</button>`) : d.link ? `<a href="${esc(d.link)}" target="_blank" rel="noopener">Open linked file</a>` : (d.planned ? `<div class="banner"><div class="grow">Planned shot from the photo register. Upload the photo, or link the file in your drive.</div></div>` : ""),
  bind(host) { $("#dqDl", host) && ($("#dqDl", host).onclick = async () => { const b = await (await fetch(d.file)).blob(); saveFile(d.fileName || d.id, b, b.type); }); if (ME.canWrite && !d.file) { const up = document.createElement("button"); up.type = "button"; up.className = "btn sm"; up.innerHTML = ic("image") + " Attach file to this record"; up.onclick = () => { const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*"; inp.onchange = async () => { try { const data = await compressImage(inp.files[0]); const rec = clone(S.docs[d.id]); rec.file = data; rec.fileName = inp.files[0].name; rec.planned = false; await store.put("docs", rec); } catch (e) { toast("Couldn't use that image.", "err"); } }; inp.click(); }; host.querySelector(".body").insertBefore(up, host.querySelector("#recForm")); } } });
DRAWER_EXTRA.gates = (g, isNew) => { if (isNew) return {}; const out = gateOutstanding(g); return { head: resPill(S.gates[g.id]?.status), top: `<div class="banner ${out.length ? "warn" : "good"}"><div class="grow">${out.length ? `<b>${out.length} required task(s) still open.</b> The gate can't pass until they're complete.<div class="row" style="margin-top:6px">${out.slice(0, 24).map(id => `<button type="button" class="btn sm" data-open="tasks|${id}">${id}</button>`).join("")}</div>` : "All required tasks are complete. Record the result, reviewer and date to pass the gate."}</div></div>` }; };
DRAWER_EXTRA.checks = (c, isNew) => ({ head: isNew ? "" : resPill(S.checks[c.id]?.result), top: c.criticality === "Critical" ? `<p class="muted" style="margin:0;font-size:12.5px">Critical check: a pass or fail needs the inspector and date. A failure blocks road-ready until a reinspection passes.</p>` : "" });
DRAWER_EXTRA.phases = (ph) => { const s = phaseStats(ph); return { top: `<dl class="kv"><dt>Progress</dt><dd>${s.done}/${s.total} tasks · ${pct(s.pct)} by hours</dd><dt>Depends on</dt><dd>${s.deps.join(", ") || "none"}</dd><dt>Budget</dt><dd>est. ${money(s.est)} · actual ${money(s.actual)}</dd></dl><div class="linklist">${s.tasks.map(t => `<button type="button" data-open="tasks|${t.id}"><span class="mono faint">${t.id}</span><span class="grow">${esc(t.title)}</span>${taskPill(t)}</button>`).join("")}</div>` }; };
DRAWER_EXTRA.team = (t, isNew) => { if (isNew) return {}; const ts = sorted("tasks").filter(x => x.assignee === t.id && !tasksClosed(x)); return { top: `<div><h2 class="sec">Open tasks (${ts.length})</h2>${ts.length ? `<div class="linklist">${ts.map(x => `<button type="button" data-open="tasks|${x.id}"><span class="mono faint">${x.id}</span><span class="grow">${esc(x.title)}</span>${taskPill(x)}</button>`).join("")}</div>` : `<span class="faint">None assigned.</span>`}</div>` }; };
DRAWER_EXTRA.expenses = (e) => ({ top: e.purchaseId && S.purchases[e.purchaseId] ? `<p class="muted" style="margin:0;font-size:12.5px">Linked to ${esc(e.purchaseId)}: that order now counts as paid, not committed.</p>` : "" });

/* ============ boot ============ */
async function boot() {
  shell(); render(true); chatInit();
  window.addEventListener("hashchange", () => { const h = location.hash.replace("#", ""); if (SEC[h] && h !== R.sec) go(h); });
  await store.init();
  renderNav();
  // prune activity older than 365 days (shared store stays small)
  if (ME.mode === "shared" && ME.canWrite) setTimeout(() => { const cut = new Date(Date.now() - 365 * 864e5).toISOString(); all("activity").filter(a => a.ts < cut).slice(0, 40).forEach(a => store.del("activity", a.id, { noLog: true }).catch(() => {})); }, 8000);
}
function maybeBaselinePrompt() {}


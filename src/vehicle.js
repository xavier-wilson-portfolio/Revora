/* ============ vehicle switcher ============
   Small search box next to the logo. Vehicles in VEHICLES are fully built out and switch the site.
   Anything else shows "not in the library yet", an estimated ready date from the shared request queue,
   and a button to request it. Requests live in meta.vehicleRequests so the whole team sees one queue. */
const VEHICLES = [
  { id: "suzuki-gs750-1977", year: 1977, make: "Suzuki", model: "GS750", variant: "GS750 (B), USA", match: ["gs750", "gs750b"] },
];
const VEH_DAYS_DEFAULT = 5;
const VEH_STATUS = ["Queued", "Being built", "Declined"];
const curVehicle = () => VEHICLES.find(v => v.id === (meta().vehicleId || VEHICLES[0].id)) || VEHICLES[0];
const vehLabel = v => `${v.year} ${v.make} ${v.model}`;
const MAKES = ["Acura", "Aprilia", "Audi", "BMW", "Bultaco", "Buick", "Cadillac", "Can-Am", "Chevrolet", "Chevy", "Chrysler", "Datsun", "Dodge", "Ducati", "Fiat", "Ford", "GMC", "Harley-Davidson", "Harley", "Honda", "Husqvarna", "Indian", "Jaguar", "Jeep", "Kawasaki", "KTM", "Lincoln", "Mazda", "Mercedes-Benz", "Mercedes", "MG", "Mini", "Mitsubishi", "Moto Guzzi", "Norton", "Nissan", "Oldsmobile", "Plymouth", "Pontiac", "Porsche", "Ram", "Royal Enfield", "Saab", "Subaru", "Suzuki", "Toyota", "Triumph", "Vespa", "Volkswagen", "VW", "Volvo", "Yamaha"];
function vehParse(q) {
  const s = q.trim().replace(/\s+/g, " "); if (!s) return null;
  const ym = s.match(/\b(19[0-9]{2}|20[0-2][0-9])\b/), year = ym ? +ym[1] : null;
  let rest = s.replace(ym ? ym[0] : "", " ").replace(/\s+/g, " ").trim();
  const mk = MAKES.slice().sort((a, b) => b.length - a.length).find(m => new RegExp(`^${m.replace(/[-]/g, "[- ]?")}\\b`, "i").test(rest));
  let make = null; if (mk) { make = mk === "Chevy" ? "Chevrolet" : mk === "VW" ? "Volkswagen" : mk === "Harley" ? "Harley-Davidson" : mk === "Mercedes" ? "Mercedes-Benz" : mk; rest = rest.replace(new RegExp(`^${mk.replace(/[-]/g, "[- ]?")}\\b`, "i"), "").trim(); }
  else { const w = rest.split(" "); if (w.length > 1) { make = w[0][0].toUpperCase() + w[0].slice(1).toLowerCase(); rest = w.slice(1).join(" "); } }
  const model = rest ? rest.split(" ").map(w => /\d/.test(w) || w.length <= 3 && /^[a-z]+$/i.test(w) && !/^(the|and)$/i.test(w) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ") : null;
  return { year, make, model, ok: !!(year && make && model), label: [year, make, model].filter(Boolean).join(" ") };
}
const vehKey = p => `${p.year}|${(p.make || "").toLowerCase()}|${(p.model || "").toLowerCase().replace(/[\s-]/g, "")}`;
const vehNorm = x => (x || "").toLowerCase().replace(/[\s-]/g, "");
function vehFind(p) { return VEHICLES.find(v => p.year === v.year && (!p.make || p.make.toLowerCase() === v.make.toLowerCase()) && v.match.map(vehNorm).includes(vehNorm(p.model))); }
function vehQueue() { return (meta().vehicleRequests || []).filter(r => r.status !== "Declined").slice().sort((a, b) => (a.status === "Being built" ? 0 : 1) - (b.status === "Being built" ? 0 : 1) || a.at.localeCompare(b.at)); }
function vehEstimate(key) {
  const q = vehQueue(), days = +meta().vehDays || VEH_DAYS_DEFAULT, i = q.findIndex(r => r.key === key), pos = i < 0 ? q.length + 1 : i + 1;
  const d = new Date(); d.setDate(d.getDate() + pos * days);
  return { pos, ahead: pos - 1, days: pos * days, date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
}
function vehResultHtml(q) {
  const cur = curVehicle();
  if (!q.trim()) return `<div class="vr-cur"><span class="eyebrow">Working on</span><b>${esc(vehLabel(cur))}</b><small>${esc(cur.variant)} · everything on the site is set up for this one</small></div>
    <div class="vr-hint">Type the year, make and model of another vehicle, like <i>1982 Honda CB750</i>.</div>${vehQueueMini()}`;
  const p = vehParse(q); if (!p || !p.ok) return `<div class="vr-hint">Add ${[!p?.year && "the year", !p?.make && "the make", !p?.model && "the model"].filter(Boolean).join(", ").replace(/, ([^,]*)$/, " and $1")}. Example: <i>1982 Honda CB750</i>.</div>`;
  const hit = vehFind(p);
  if (hit) return hit.id === cur.id ? `<div class="vr-ok">${ic("tick")}<div><b>${esc(vehLabel(hit))}</b><small>You're already on this one.</small></div></div>` : `<button class="vr-go" data-veh="${hit.id}">${ic("tick")}<div><b>Switch to ${esc(vehLabel(hit))}</b><small>${esc(hit.variant)}</small></div></button>`;
  const key = vehKey(p), req = (meta().vehicleRequests || []).find(r => r.key === key), est = vehEstimate(key);
  if (req && req.status === "Declined") return `<div class="vr-miss"><b>${esc(p.label)}</b><p>Requested before and not planned right now.</p></div>`;
  const mine = req && req.votes.includes(whoName());
  return `<div class="vr-miss"><span class="eyebrow">Not in the library yet</span><b>${esc(p.label)}</b>
    <p>We don't have this vehicle yet. ${req ? `${req.votes.length} ${req.votes.length === 1 ? "person has" : "people have"} asked for it. ` : ""}${req && req.status === "Being built" ? "It's being built now." : `It would be ${est.pos === 1 ? "next" : `number ${est.pos}`} in line.`}</p>
    <div class="vr-est"><span>Estimated ready</span><b>about ${est.days} days</b><small>around ${est.date}</small></div>
    ${ME.canWrite ? (mine ? `<div class="vr-done">${ic("tick")} You've requested this one.</div>` : `<button class="btn sm pri" data-vreq="${esc(q)}">${req ? "Add my request" : "Request this vehicle"}</button>`) : ""}
    <small class="vr-note">Each vehicle's parts, diagrams, tasks and specs are built and checked by hand, so this date is an estimate from the queue, not a promise.</small></div>`;
}
function vehQueueMini() { const q = vehQueue(); if (!q.length) return ""; return `<div class="vr-q"><span class="eyebrow">Requested so far</span>${q.slice(0, 4).map((r, i) => `<div><span>${i + 1}. ${esc(r.label)}</span><small>${r.status === "Being built" ? "being built" : `~${vehEstimate(r.key).days} days`}</small></div>`).join("")}${q.length > 4 ? `<small>+${q.length - 4} more in Settings</small>` : ""}</div>`; }
async function vehRequest(q) {
  const p = vehParse(q); if (!p || !p.ok) return; const key = vehKey(p), m = clone(meta()); m.vehicleRequests = (m.vehicleRequests || []).map(r => ({ ...r, votes: r.votes.slice() }));
  let r = m.vehicleRequests.find(x => x.key === key);
  if (r) { if (!r.votes.includes(whoName())) r.votes.push(whoName()); }
  else m.vehicleRequests.push({ key, label: p.label, year: p.year, make: p.make, model: p.model, by: whoName(), at: nowISO(), votes: [whoName()], status: "Queued" });
  await store.put("meta", m, { action: `requested vehicle ${p.label}` });
  toast(`Requested ${p.label}. Estimated ready in about ${vehEstimate(key).days} days.`);
}
async function vehSwitch(id) { const v = VEHICLES.find(x => x.id === id); if (!v) return; const m = clone(meta()); m.vehicleId = id; await store.put("meta", m, { action: `switched vehicle to ${vehLabel(v)}` }); toast(`Now working on ${vehLabel(v)}.`); }
function bindVehicleBox() {
  const box = $("#vbox"); if (!box) return;
  box.innerHTML = `<span class="vb-ic">${ic("search")}</span><input id="vq" type="search" autocomplete="off" spellcheck="false" aria-label="Vehicle you're working on: year, make, model" placeholder="${esc(vehLabel(curVehicle()))}"><div class="vpop" id="vpop" hidden></div>`;
  const inp = $("#vq"), pop = $("#vpop");
  const show = () => { pop.innerHTML = vehResultHtml(inp.value); pop.hidden = false; bindPop(); };
  const bindPop = () => {
    $$("[data-vreq]", pop).forEach(b => b.onclick = async e => { e.stopPropagation(); b.disabled = true; try { await vehRequest(b.dataset.vreq); } catch (er) {} show(); });
    $$("[data-veh]", pop).forEach(b => b.onclick = async e => { e.stopPropagation(); await vehSwitch(b.dataset.veh); inp.value = ""; pop.hidden = true; });
  };
  inp.addEventListener("focus", show); inp.addEventListener("input", show);
  inp.addEventListener("keydown", e => { if (e.key === "Escape") { inp.value = ""; pop.hidden = true; inp.blur(); } if (e.key === "Enter") { e.preventDefault(); show(); pop.querySelector("[data-veh],[data-vreq]")?.focus(); } });
  document.addEventListener("click", e => { if (!e.target.closest("#vbox")) pop.hidden = true; });
}
function vehSettingsHtml() {
  const q = (meta().vehicleRequests || []).slice().sort((a, b) => a.at.localeCompare(b.at));
  return `<div class="panel stack"><h2 class="sec">Vehicle requests</h2>
    <p class="hint-text" style="text-align:left">People ask for vehicles from the search box next to the logo. The estimate shown to them is their place in line times the days per vehicle below.</p>
    <div class="fld" style="max-width:220px"><label for="set-vehDays">Days to build one vehicle</label><input id="set-vehDays" type="number" min="1" step="1" value="${esc(meta().vehDays || VEH_DAYS_DEFAULT)}" ${ME.canWrite ? "" : "disabled"}></div>
    ${q.length ? `<div class="tablewrap"><table class="tbl"><thead><tr><th>Vehicle</th><th>Requests</th><th>First asked</th><th>Estimate</th><th>Status</th></tr></thead><tbody>${q.map(r => `<tr><td><b>${esc(r.label)}</b></td><td>${r.votes.length}<small class="faint"> · ${esc(r.votes.join(", "))}</small></td><td>${fmtDate(r.at)}</td><td>${r.status === "Declined" ? "—" : `~${vehEstimate(r.key).days} days`}</td><td><select data-vstat="${esc(r.key)}" ${ME.canWrite ? "" : "disabled"}>${VEH_STATUS.map(s => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>` : `<p class="faint" style="margin:0">No requests yet.</p>`}</div>`;
}
function bindVehSettings(root) {
  const d = $("#set-vehDays", root); if (d) d.onchange = async () => { const v = Math.max(1, Math.round(+d.value || VEH_DAYS_DEFAULT)); const m = clone(meta()); m.vehDays = v; await store.put("meta", m, { action: `set vehicle build time to ${v} days` }); };
  $$("[data-vstat]", root).forEach(s => s.onchange = async () => { const m = clone(meta()); m.vehicleRequests = (m.vehicleRequests || []).map(r => r.key === s.dataset.vstat ? { ...r, status: s.value } : r); await store.put("meta", m, { action: `set vehicle request status to ${s.value}` }); });
}

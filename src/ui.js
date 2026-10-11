const VIEWS = {};
/* ============ navigation ============ */
const SECTIONS = [
  { id: "home", t: "Home", i: "home" },
  { id: "course", t: "Course", i: "book", main: 1, d: "14 parts, step by step" },
  { id: "viewer", t: "3D Garage", i: "cube", main: 1, d: "Explore every part in 3D" },
  { id: "diagrams", t: "Diagrams", i: "layers", main: 1, d: "Exploded views and sections" },
  { id: "inventory", t: "Parts", i: "box", main: 1, d: "Every part and its status" },
  { id: "paint", t: "Paint Studio", i: "spray", main: 1, d: "Colors, finishes, how to paint" },
  { id: "tasks", t: "To-do", i: "check", main: 1, d: "Every step in one list" },
  { id: "videos", t: "Videos", i: "play", main: 1, d: "Watch a full GS750 rebuild" },
  { id: "budget", t: "Money", i: "dollar", main: 1, d: "Spending and budget" },
  { id: "gates", t: "Safety", i: "shield", main: 1, d: "Checks before the road" },
  { id: "engine", t: "Engine", i: "engine", mod: "engine", grp: "areas", d: "Teardown, measure, rebuild" },
  { id: "fuel", t: "Carbs & fuel", i: "fuel", mod: "fuel", grp: "areas", d: "Carbs, tank, petcock" },
  { id: "electrical", t: "Electrical", i: "bolt", mod: "electrical", grp: "areas", d: "Wiring, charging, lights" },
  { id: "chassis", t: "Frame, wheels & brakes", i: "wheel", mod: "chassis", grp: "areas", d: "Suspension, wheels, brakes" },
  { id: "finish", t: "Cleaning & finishing", i: "spray", mod: "finish", grp: "areas", d: "Finish records and photos" },
  { id: "guides", t: "Guides", i: "book", grp: "learn", d: "Carbs, brakes, wiring and more" },
  { id: "shops", t: "Where to buy parts", i: "store", grp: "learn", d: "Shops, diagrams, forums" },
  { id: "help", t: "Help", i: "help", grp: "learn", d: "How this app works" },
  { id: "purchasing", t: "Shopping list", i: "cart", grp: "records", d: "Requests, quotes, orders" },
  { id: "inspections", t: "Measurements", i: "gauge", grp: "records", d: "Checks and limits" },
  { id: "docs", t: "Photos & files", i: "image", grp: "records", d: "Before, during, after" },
  { id: "problems", t: "Problems & decisions", i: "alert", grp: "records", d: "Issues and big choices" },
  { id: "team", t: "Team & work log", i: "users", grp: "records", d: "People and hours" },
  { id: "maintenance", t: "Maintenance log", i: "wrench", grp: "records", d: "After the build" },
  { id: "settings", t: "Settings & backups", i: "gear", grp: "records", d: "Budget, backups, data" },
  { id: "lesson", t: "Lesson", i: "book", hidden: true },
];
const NAV_GROUPS = [["areas", "Workshop areas"], ["learn", "Learn"], ["records", "Records & admin"]];
const SEC = Object.fromEntries(SECTIONS.filter(s => s.id).map(s => [s.id, s]));
const ALIAS = { overview: "home", roadmap: "course" };
const R = { sec: "home", lesson: "A", guide: null, tab: {}, f: {}, sort: {}, view: {} };
function parseHash(h) { h = (h || "").replace("#", ""); const m = h.match(/^lesson-([A-Z])$/); if (m) return { sec: "lesson", lesson: m[1] }; const g = h.match(/^guide-([a-z]+)$/); if (g) return { sec: "guides", guide: g[1] }; const dg = h.match(/^diagram-(DG-[A-Z]+-\d+)$/); if (dg) return { sec: "diagrams", diag: dg[1] }; h = ALIAS[h] || h; return SEC[h] ? { sec: h } : null; }
(function initRoute() {
  const saved = lsGet("gs750.route", null), fromHash = parseHash(location.hash);
  if (saved) { R.tab = saved.tab || {}; R.view = saved.view || {}; if (saved.lesson) R.lesson = saved.lesson; }
  const target = fromHash || (saved && parseHash(saved.sec === "lesson" ? "lesson-" + saved.lesson : saved.sec));
  if (target) { R.sec = target.sec; if (target.lesson) R.lesson = target.lesson; if (target.guide) R.guide = target.guide; if (target.diag) R.diag = target.diag; }
})();
function go(sec, f) {
  if (typeof sec === "string" && sec.startsWith("lesson-")) { R.lesson = sec.slice(7); sec = "lesson"; }
  if (typeof sec === "string" && sec.startsWith("diagram-")) { R.diag = sec.slice(8); sec = "diagrams"; } else if (sec === "diagrams") R.diag = null;
  if (typeof sec === "string" && sec.startsWith("guide-")) { R.guide = sec.slice(6); sec = "guides"; } else if (sec === "guides") R.guide = null;
  sec = ALIAS[sec] || sec; if (!SEC[sec]) return;
  R.sec = sec; if (f) R.f[sec] = Object.assign({}, f);
  lsSet("gs750.route", { sec, lesson: R.lesson, tab: R.tab, view: R.view });
  try { history.replaceState(null, "", "#" + (sec === "lesson" ? "lesson-" + R.lesson : sec === "guides" && R.guide ? "guide-" + R.guide : sec === "diagrams" && R.diag ? "diagram-" + R.diag : sec)); } catch (e) {}
  closeMenus();
  if (drawerState.c && !drawerState.dirty) closeDrawer();
  render(true); window.scrollTo(0, 0); $(".content")?.focus({ preventScroll: true });
  if (typeof renderChat === "function") renderChat();
}
const fstate = (sec = R.sec) => (R.f[sec] = R.f[sec] || {});

/* ============ shell: car-site style top navigation ============ */
function shell() {
  document.getElementById("app").innerHTML = `
  <div class="app">
    <header class="top" id="top">
      <div class="top-in">
        <button class="brand" data-goto="home" aria-label="Home"><span class="logo">${ic("bike")}</span><span class="bt"><b id="brandName">Revora</b><span id="brandBike">1977 Suzuki GS750</span></span></button>
        <div class="vbox" id="vbox"></div>
        <nav class="mainnav" id="nav" aria-label="Main"></nav>
        <div class="top-r">
          <div class="search"><span>${ic("search")}</span><input id="gsearch" type="search" placeholder="Search" autocomplete="off" aria-label="Search everything"><div class="sresults" id="sresults" hidden></div></div>
          <span class="savebadge" id="saveBadge" title=""><i></i><span>Loading…</span></span>
          <button class="iconbtn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">${ic("menu")}</button>
        </div>
      </div>
      <div class="mega" id="mega" hidden></div>
    </header>
    <div class="subbar"><div class="subbar-in"><div class="crumbs" id="crumbs"></div><div class="row" style="gap:10px"><span class="progchip" id="progChip"></span><span class="modebadge" id="modeBadge"></span></div></div></div>
    <div class="main"><main class="content" id="content" tabindex="-1"></main>
      <footer class="foot"><div><b>Revora</b><span>Restoration course and workshop log. Now working on a 1977 Suzuki GS750.</span></div><div class="row"><button class="linkbtn" data-goto="guides">Guides</button><button class="linkbtn" data-goto="shops">Where to buy</button><button class="linkbtn" data-goto="help">Help</button><button class="linkbtn" data-goto="settings">Backups</button></div></footer></div>
  </div>
  <div class="mobback" id="mobback" hidden></div><div class="mobmenu" id="mobmenu" hidden role="dialog" aria-label="Menu"></div>
  <div id="drawerHost"></div><div id="modalHost"></div><div class="toasts" id="toasts" aria-live="polite"></div>`;
  bindVehicleBox();
  $("#menuBtn").onclick = () => { const m = $("#mobmenu"); if (m.hidden) openMobMenu(); else closeMobMenu(); };
  $("#mobback").onclick = () => closeMobMenu();
  document.addEventListener("click", e => { const g = e.target.closest("[data-goto]"); if (g) { e.preventDefault(); go(g.dataset.goto); return; } if (!e.target.closest("#mega") && !e.target.closest("[data-more]")) { const mg = $("#mega"); if (mg && !mg.hidden) { mg.hidden = true; renderNav(); } } });
  const gs = $("#gsearch"), sr = $("#sresults");
  gs.addEventListener("input", () => globalSearch(gs.value));
  gs.addEventListener("keydown", e => { if (e.key === "Escape") { gs.value = ""; sr.hidden = true; } if (e.key === "ArrowDown") { sr.querySelector("button")?.focus(); e.preventDefault(); } });
  sr.addEventListener("keydown", e => { if (e.key === "ArrowDown") { e.target.nextElementSibling?.focus(); e.preventDefault(); } if (e.key === "ArrowUp") { (e.target.previousElementSibling || gs).focus(); e.preventDefault(); } });
  document.addEventListener("click", e => { if (!e.target.closest(".search")) sr.hidden = true; });
  document.addEventListener("keydown", e => { if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); gs.focus(); } if (e.key === "Escape") { if ($("#modalHost").innerHTML) closeModal(); else if ($("#drawerHost").innerHTML) closeDrawer(); else if (!$("#mega").hidden || !$("#mobmenu").hidden) closeMenus(); else if (typeof CHAT !== "undefined" && CHAT.open) { CHAT.open = false; renderChat(); } else if (typeof twinEscape === "function") twinEscape(); } });
}
function openMobMenu() { const m = $("#mobmenu"), b = $("#mobback"); renderMobMenu(); m.classList.remove("closing"); b.classList.remove("closing"); m.hidden = false; b.hidden = false; $("#menuBtn")?.setAttribute("aria-expanded", "true"); setTimeout(() => $("#mobX")?.focus(), 50); }
function closeMobMenu() { const m = $("#mobmenu"), b = $("#mobback"); if (!m || m.hidden) return; m.classList.add("closing"); b && b.classList.add("closing"); $("#menuBtn")?.setAttribute("aria-expanded", "false"); setTimeout(() => { m.hidden = true; m.classList.remove("closing"); if (b) { b.hidden = true; b.classList.remove("closing"); } }, 230); }
function closeMenus() { const mg = $("#mega"); if (mg) mg.hidden = true; closeMobMenu(); }
function megaHtml() {
  return `<div class="mega-in">${NAV_GROUPS.map(([k, l]) => `<div class="mcol"><div class="eyebrow">${esc(l)}</div>${SECTIONS.filter(s => s.grp === k).map(s => `<button class="mlink" data-goto="${s.id}">${ic(s.i)}<span><b>${esc(s.t)}</b><small>${esc(s.d || "")}</small></span></button>`).join("")}</div>`).join("")}
    <div class="mcol mfeature"><img src="img/d-engine.svg" alt=""><b>Not sure where to start?</b><small>Open Part 1 of the course, or ask the mechanic.</small><div class="row"><button class="btn sm tan" data-goto="course">Open the course</button><button class="btn sm ask" data-ask="" data-ask-ctx="">${ic("chat")} Ask</button></div></div></div>`;
}
function renderMobMenu() {
  const cur = R.sec === "lesson" ? "course" : R.sec;
  $("#mobmenu").innerHTML = `<div class="mob-in"><div class="row" style="justify-content:space-between"><b class="eyebrow">Menu</b><button class="iconbtn" id="mobX" aria-label="Close menu">${ic("x")}</button></div>
    <div class="moblist">${SECTIONS.filter(s => s.id === "home" || s.main).map(s => `<button class="mlink ${cur === s.id ? "on" : ""}" data-goto="${s.id}">${ic(s.i)}<span><b>${esc(s.t)}</b><small>${esc(s.d || "Overview and progress")}</small></span></button>`).join("")}</div>
    ${NAV_GROUPS.map(([k, l]) => `<div class="eyebrow" style="margin-top:14px">${esc(l)}</div><div class="moblist grp">${SECTIONS.filter(s => s.grp === k).map(s => `<button class="mlink ${cur === s.id ? "on" : ""}" data-goto="${s.id}">${ic(s.i)}<span><b>${esc(s.t)}</b></span></button>`).join("")}</div>`).join("")}</div>`;
  $("#mobX").onclick = closeMenus;
}
function renderNav() {
  const cur = R.sec === "lesson" ? "course" : R.sec, inMore = !!SEC[cur]?.grp, mg = $("#mega");
  $("#nav").innerHTML = SECTIONS.filter(s => s.main).map(s => `<button class="nl ${cur === s.id ? "on" : ""}" data-goto="${s.id}" ${cur === s.id ? 'aria-current="page"' : ""}>${esc(s.t)}</button>`).join("") +
    `<button class="nl ${inMore ? "on" : ""} ${mg && !mg.hidden ? "open" : ""}" data-more aria-expanded="${mg && !mg.hidden}">More ${ic("chev")}</button>`;
  $("#nav [data-more]").onclick = e => { e.stopPropagation(); const m = $("#mega"); if (m.hidden) { m.innerHTML = megaHtml(); m.hidden = false; } else m.hidden = true; renderNav(); };
  const m = meta(), prog = overallProgress();
  $("#brandName").textContent = "Revora";
  $("#brandBike").textContent = m.bike || "1977 Suzuki GS750";
  const vq = $("#vq"); if (vq) vq.placeholder = vehLabel(curVehicle()); const vp = $("#vpop"); if (vp && !vp.hidden && document.activeElement === vq) { /* keep open popover fresh */ vp.innerHTML = vehResultHtml(vq.value); }
  $("#progChip").innerHTML = `<i style="--p:${Math.round(prog * 100)}"></i>${pct(prog)} restored`;
  $("#modeBadge").textContent = ME.mode === "shared" ? (ME.canWrite ? "Team data · live" : "View only") : "This browser only";
  $("#modeBadge").title = ME.mode === "shared" ? "Everyone you share this page with sees the same records, live." : "Records are saved in this browser only. Export backups often.";
  const sec = SEC[R.sec], L = R.sec === "lesson" ? sorted("phases").findIndex(p => p.id === R.lesson) + 1 : 0;
  const tail = R.sec === "lesson" ? `<button data-crumb="course">Course</button><span>›</span><b>Part ${L}</b>` : R.sec === "guides" && R.guide ? `<button data-crumb="guides">Guides</button><span>›</span><b>${esc(GUIDES[R.guide]?.title || "")}</b>` : `<b>${esc(sec.t)}</b>`;
  $("#crumbs").innerHTML = (R.sec === "home" ? `<b>Home</b>` : `<button data-crumb="home">Home</button><span>›</span>` + tail) + (drawerState.c ? `<span>›</span><span>${esc(drawerState.id || "New")}</span>` : "");
  $$("#crumbs [data-crumb]").forEach(b => b.onclick = () => go(b.dataset.crumb));
}
function setSave(state, msg) {
  const b = $("#saveBadge"); if (!b) return;
  b.className = "savebadge " + (state === "busy" ? "busy" : state === "err" ? "err" : "");
  b.querySelector("span").textContent = state === "busy" ? "Saving…" : state === "err" ? "Not saved" : "Saved";
  b.title = msg || (ME.mode === "shared" ? "All changes saved to the team database" : "Saved in this browser");
}
function globalSearch(q) {
  const sr = $("#sresults"); q = q.trim().toLowerCase();
  if (q.length < 2) { sr.hidden = true; return; }
  const hits = [];
  ["parts", "tasks", "inspections", "purchases", "issues", "decisions", "docs", "gates", "checks", "steps", "expenses", "team", "tools", "finishes"].forEach(c => {
    sorted(c).forEach(r => { const hay = [r.id, titleOf(c, r), r.oemPn, r.location, r.bin, r.subsystem, r.component, r.supplier, r.tags].filter(Boolean).join(" ").toLowerCase(); if (hay.includes(q)) hits.push({ c, r }); });
  });
  const lessonHits = sorted("phases").filter(p => (LESSONS[p.id]?.title + " " + p.name).toLowerCase().includes(q));
  sr.innerHTML = (lessonHits.map(p => `<button data-lesson="${p.id}"><span class="mono faint">Part ${sorted("phases").indexOf(p) + 1}</span><span style="flex:1;min-width:0">${esc(LESSONS[p.id]?.title || p.name)}</span><span class="tag">Course</span></button>`).join("") +
    hits.slice(0, 30).map(h => `<button data-c="${h.c}" data-id="${esc(h.r.id)}"><span class="mono faint">${esc(h.r.id)}</span><span style="flex:1;min-width:0">${esc(titleOf(h.c, h.r))}</span><span class="tag">${esc(SCHEMA[h.c].label)}</span></button>`).join("")) || `<div class="empty" style="padding:12px">Nothing matches “${esc(q)}”.</div>`;
  sr.hidden = false;
  $$("button[data-c]", sr).forEach(b => b.onclick = () => { sr.hidden = true; $("#gsearch").value = ""; openRecord(b.dataset.c, b.dataset.id); });
  $$("button[data-lesson]", sr).forEach(b => b.onclick = () => { sr.hidden = true; $("#gsearch").value = ""; go("lesson-" + b.dataset.lesson); });
}

/* ============ page header + guidance ============ */
function pageHead(sec, opts = {}) {
  const g = GUIDE[sec] || {};
  return `<div class="ph">${opts.eyebrow || g.eyebrow ? `<div class="eyebrow">${esc(opts.eyebrow || g.eyebrow)}</div>` : ""}<h1>${esc(opts.title || g.title || SEC[sec]?.t || "")}</h1>${opts.sub || g.sub ? `<p>${opts.sub || g.sub}</p>` : ""}${opts.act ? `<div class="act">${opts.act}</div>` : ""}</div>`;
}
const guideHidden = lsGet("gs750.guides", {});
function guideHtml(sec) {
  const g = GUIDE[sec]; if (!g || !g.how) return "";
  if (guideHidden[sec]) return `<div class="guide-mini row center"><button class="linkbtn" data-guide-show="${sec}">${ic("help")} How does this page work?</button>${askBtn("", "", "linkbtn ask")}</div>`;
  return `<div class="guide" role="note"><span class="gi">${ic("bulb")}</span><div class="grow"><b class="t">${esc(g.howTitle || "How this page works")}</b><ul>${g.how.map(x => `<li>${x}</li>`).join("")}</ul></div><div class="stack" style="gap:6px;align-items:stretch"><button class="btn sm" data-guide-hide="${sec}">Got it</button>${askBtn("", "", "btn sm ask")}</div></div>`;
}
const MONEY_TABS = [["budget", "Money overview"], ["purchasing", "Shopping list"], ["shops", "Where to buy"]];

/* ============ render loop ============ */
let renderQueued = false;
function scheduleRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(false); }); }
function onData(first, coll) {
  if (first) { setSave("ok"); render(true); return; }
  if (coll === "activity" && !["home", "team"].includes(R.sec)) { refreshDrawer(); return; }
  scheduleRender();
}
function render(full) {
  if (!store.ready) { $("#content").innerHTML = `<div class="empty" style="padding-top:80px"><span class="spinner" style="display:block;margin:0 auto 12px"></span><b>Opening the garage…</b>Loading your restoration records.</div>`; return; }
  renderNav();
  const view = isEmptyProject() && !["settings", "help"].includes(R.sec) ? { render: setupPanel, bind: bindSetup } : (VIEWS[R.sec] || VIEWS.home);
  if (view.live && !full && view.live()) { refreshDrawer(); return; }
  const ae = document.activeElement, aid = ae && ae.id, sel = ae && "selectionStart" in ae ? [ae.selectionStart, ae.selectionEnd] : null;
  const sy = window.scrollY, c = $("#content");
  if (view.teardown && full) view.teardown();
  c.innerHTML = view.render();
  const ph = c.querySelector(".ph");
  if (ph) { ph.insertAdjacentHTML("afterend", guideHtml(R.sec)); if (MONEY_TABS.some(t => t[0] === R.sec)) ph.insertAdjacentHTML("beforebegin", `<div class="subnav">${MONEY_TABS.map(([k, l]) => `<button data-go="${k}" class="${R.sec === k ? "on" : ""}">${l}</button>`).join("")}</div>`); }
  const gd = GUIDE[R.sec]; if (gd && ph && !ph.dataset.own) { const h1 = ph.querySelector("h1"); if (gd.title && h1) h1.textContent = gd.title; const pp = ph.querySelector("p"); if (gd.sub && pp) pp.innerHTML = gd.sub; if (gd.eyebrow && !ph.querySelector(".eyebrow")) ph.insertAdjacentHTML("afterbegin", `<div class="eyebrow">${esc(gd.eyebrow)}</div>`); }
  $$("[data-guide-hide]", c).forEach(b => b.onclick = () => { guideHidden[b.dataset.guideHide] = 1; lsSet("gs750.guides", guideHidden); render(false); });
  $$("[data-guide-show]", c).forEach(b => b.onclick = () => { delete guideHidden[b.dataset.guideShow]; lsSet("gs750.guides", guideHidden); render(false); });
  $$(".subnav [data-go]", c).forEach(b => b.onclick = () => go(b.dataset.go));
  view.bind && view.bind(c);
  if (!full) window.scrollTo(0, sy);
  if (aid && !full) { const el = document.getElementById(aid); if (el && el !== document.activeElement) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
  refreshDrawer();
}

/* ============ toasts, modal, confirm ============ */
function toast(msg, kind, action) {
  const t = document.createElement("div"); t.className = "toast" + (kind === "err" ? " err" : "");
  t.innerHTML = `<span>${esc(msg)}</span>` + (action ? `<button>${esc(action.label)}</button>` : "");
  if (action) t.querySelector("button").onclick = () => { action.fn(); t.remove(); };
  const tl = $("#toasts"); tl.appendChild(t); while (tl.children.length > 3) tl.firstChild.remove(); setTimeout(() => t.remove(), action ? 8000 : 4000);
}
function modal(html, bind) {
  $("#modalHost").innerHTML = `<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  const m = $("#modalHost .modal"); bind && bind(m);
  $("#modalHost .modal-bg").addEventListener("mousedown", e => { if (e.target.classList.contains("modal-bg")) closeModal(); });
  (m.querySelector("[autofocus]") || m.querySelector("input,select,textarea,button"))?.focus();
  return m;
}
function closeModal() { $("#modalHost").innerHTML = ""; }
function confirmBox(title, body, okLabel, fn, danger = true) {
  modal(`<h3>${esc(title)}</h3><div>${body}</div><div class="row"><button class="btn" data-x>Cancel</button><button class="btn ${danger ? "danger" : "pri"}" data-ok autofocus>${esc(okLabel)}</button></div>`, m => {
    m.querySelector("[data-x]").onclick = closeModal;
    m.querySelector("[data-ok]").onclick = async () => { closeModal(); await fn(); };
  });
}

/* ============ export (downloads capability, with copy fallback) ============ */
function csvOf(rows, cols) {
  const q = v => { v = v == null ? "" : Array.isArray(v) ? v.join("; ") : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return [cols.map(c => q(c.label)).join(","), ...rows.map(r => cols.map(c => q(c.get ? c.get(r) : r[c.k])).join(","))].join("\r\n");
}
async function saveFile(filename, data, mime = "text/plain") {
  let dl = null;
  try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; }
  if (dl) {
    try { const r = await dl.save({ filename, data: new Blob([data], { type: mime }) }); if (r && r.status === "saved") toast("Saved " + filename); return; }
    catch (e) { if (e && e.code === "declined") return; }
  } else {
    // local file / normal browser: plain link download
    try {
      if (!window.claude) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: mime })); a.download = filename; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast("Downloaded " + filename); return; }
    } catch (e) {}
  }
  modal(`<h3>Copy ${esc(filename)}</h3><p class="muted" style="margin:0">This view can't save files directly. Copy the contents and paste them into a file.</p><textarea id="copyArea" style="width:100%;height:220px;font-family:var(--f-mono);font-size:12px" readonly>${esc(data)}</textarea><div class="row"><button class="btn" data-x>Close</button><button class="btn pri" data-copy>Copy</button></div>`, m => {
    m.querySelector("[data-x]").onclick = closeModal;
    m.querySelector("[data-copy]").onclick = () => { const ta = m.querySelector("textarea"); navigator.clipboard.writeText(ta.value).then(() => toast("Copied"), () => { ta.select(); toast("Press Ctrl+C / Cmd+C to copy"); }); };
  });
}

/* ============ generic table ============ */
/* cols: [{k,label,get(r)->html, sort(r)->value, cls}] */
function table(id, rows, cols, opts = {}) {
  const st = R.sort[id] || opts.defSort || null;
  if (st) { const col = cols.find(c => c.k === st.k); if (col) { const sv = col.sort || (r => r[col.k]); rows = rows.slice().sort((a, b) => { const x = sv(a), y = sv(b); const r = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true }); return st.dir === "desc" ? -r : r; }); } }
  if (!rows.length) return `<div class="twrap"><div class="empty"><b>${esc(opts.emptyTitle || "Nothing here yet")}</b>${opts.empty || "Adjust the filters or add a record."}</div></div>`;
  const sel = opts.select;
  return `<div class="twrap"><table class="t" data-table="${id}"><thead><tr>${sel ? `<th style="width:28px"><input type="checkbox" data-selall aria-label="Select all"></th>` : ""}${cols.map(c => `<th class="${c.nosort ? "" : "sort"} ${c.cls || ""}" data-k="${c.k}">${esc(c.label)}${st && st.k === c.k ? (st.dir === "desc" ? " ↓" : " ↑") : ""}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr data-c="${opts.coll}" data-id="${esc(r.id)}" tabindex="0">${sel ? `<td onclick="event.stopPropagation()"><input type="checkbox" data-sel="${esc(r.id)}" ${sel.has(r.id) ? "checked" : ""} aria-label="Select ${esc(r.id)}"></td>` : ""}${cols.map(c => `<td class="${c.cls || ""}">${c.get ? c.get(r) : esc(r[c.k])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function bindTables(root) {
  $$("table.t", root).forEach(t => {
    const id = t.dataset.table;
    $$("th.sort", t).forEach(th => th.onclick = () => { const cur = R.sort[id]; R.sort[id] = { k: th.dataset.k, dir: cur && cur.k === th.dataset.k && cur.dir === "asc" ? "desc" : "asc" }; render(false); });
    $$("tbody tr", t).forEach(tr => { if (!tr.dataset.c || tr.dataset.c === "undefined") return; tr.onclick = e => { if (e.target.closest("input,select,button,a")) return; openRecord(tr.dataset.c, tr.dataset.id); }; tr.onkeydown = e => { if (e.key === "Enter") openRecord(tr.dataset.c, tr.dataset.id); }; });
  });
  $$("[data-open]", root).forEach(b => b.onclick = e => { e.stopPropagation(); const [c, id] = b.dataset.open.split("|"); openRecord(c, id); });
  $$("[data-go]", root).forEach(b => b.onclick = () => { const [sec, f] = b.dataset.go.split("|"); go(sec, f ? JSON.parse(f) : null); });
  $$("[data-new]", root).forEach(b => b.onclick = () => { const [c, init] = b.dataset.new.split("|"); openRecord(c, null, init ? JSON.parse(init) : {}); });
}
const refLink = (c, id) => id && S[c][id] ? `<button class="btn sm" data-open="${c}|${esc(id)}" style="max-width:100%;overflow:hidden;text-overflow:ellipsis"><span class="mono">${esc(id)}</span> ${esc(titleOf(c, S[c][id])).slice(0, 40)}</button>` : (id ? `<span class="mono faint">${esc(id)}</span>` : `<span class="faint">—</span>`);
const refName = (c, id) => id && S[c][id] ? esc(titleOf(c, S[c][id])) : (id ? `<span class="faint">${esc(id)}</span>` : `<span class="faint">—</span>`);
const specCell = v => !v || v === VERIFY ? `<span class="verify">VERIFY IN FSM</span>` : esc(v);

function filterBar(sec, items) {
  // items: [{k, label, opts:[[v,label]], type:'select'|'search'}]
  const f = fstate(sec);
  return `<div class="tbar">${items.map(it => it.type === "search"
    ? `<input type="search" id="f-${sec}-${it.k}" data-f="${it.k}" placeholder="${esc(it.label)}" value="${esc(f[it.k] || "")}" aria-label="${esc(it.label)}">`
    : `<select id="f-${sec}-${it.k}" data-f="${it.k}" aria-label="${esc(it.label)}"><option value="">${esc(it.label)}: all</option>${it.opts.map(([v, l]) => `<option value="${esc(v)}" ${String(f[it.k] ?? "") === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`).join("")}
    ${Object.keys(f).some(k => f[k]) ? `<button class="btn sm" data-clearf="${sec}">Clear filters</button>` : ""}</div>`;
}
function bindFilters(root, sec) {
  $$("[data-f]", root).forEach(el => { const ev = el.tagName === "SELECT" ? "change" : "input"; el.addEventListener(ev, () => { fstate(sec)[el.dataset.f] = el.value; render(false); }); });
  $$("[data-clearf]", root).forEach(b => b.onclick = () => { R.f[sec] = {}; render(false); });
}
const optsOf = (arr, lbl) => arr.map(v => [v, lbl ? lbl[v] || v : v]);
const teamOpts = () => sorted("team").map(t => [t.id, t.name]);

/* ============ record drawer ============ */
const drawerState = { c: null, id: null, draft: null, dirty: false, isNew: false, tab: "details" };
function openRecord(c, id, init) {
  if (!SCHEMA[c]) return;
  if (drawerState.dirty && !confirmLeave()) return;
  drawerState.c = c; drawerState.isNew = !id; drawerState.tab = "details";
  drawerState.draft = id ? clone(S[c][id] || {}) : blank(c, init || {});
  if (id && !S[c][id]) { toast("That record no longer exists.", "err"); return; }
  drawerState.id = drawerState.draft.id; drawerState.dirty = false;
  renderDrawer(); renderNav();
}
function confirmLeave() { return true; }
function closeDrawer() { drawerState.c = null; drawerState.id = null; drawerState.dirty = false; $("#drawerHost").innerHTML = ""; renderNav(); if (VIEWS[R.sec].onDrawerClose) VIEWS[R.sec].onDrawerClose(); }
function refreshDrawer() {
  if (!drawerState.c) return;
  if (!drawerState.isNew && !S[drawerState.c][drawerState.id]) { closeDrawer(); return; }
  if (drawerState.dirty) { const n2 = $("#drawerHost .stale"); if (n2) n2.hidden = JSON.stringify(stripMeta(S[drawerState.c][drawerState.id])) === JSON.stringify(stripMeta(drawerState.base)); return; }
  if (!drawerState.isNew) drawerState.draft = clone(S[drawerState.c][drawerState.id]);
  renderDrawer(true);
}
const stripMeta = r => { if (!r) return r; const x = { ...r }; delete x.updatedAt; delete x.updatedBy; delete x.updatedById; return x; };
function fieldInput(c, f, v) {
  const id = `fld-${f.k}`, req = f.req ? " required" : "";
  const dis = ME.canWrite ? "" : " disabled";
  if (f.type === "textarea") return `<textarea id="${id}" data-k="${f.k}"${req}${dis}>${esc(v)}</textarea>`;
  if (f.type === "bool") return `<label class="chk"><input type="checkbox" id="${id}" data-k="${f.k}" ${v ? "checked" : ""}${dis}> Yes</label>`;
  if (f.type === "select") { const opts = f.opts || f.optsFn(); const L = x => f.lbl ? f.lbl[x] || x : f.lblFn ? f.lblFn(x) : x || "—"; const list = opts.includes(v) || v == null || v === "" ? opts : [v, ...opts]; return `<select id="${id}" data-k="${f.k}"${dis}>${list.map(o => `<option value="${esc(o)}" ${o === v ? "selected" : ""}>${esc(L(o))}</option>`).join("")}</select>`; }
  if (f.type === "ref") { const rows = sorted(f.ref).filter(r => !(f.ref === c && r.id === drawerState.id)); return `<select id="${id}" data-k="${f.k}"${dis}><option value="">— none —</option>${rows.map(r => `<option value="${esc(r.id)}" ${r.id === v ? "selected" : ""}>${f.ref === "team" ? esc(r.name) : esc(r.id + " · " + titleOf(f.ref, r)).slice(0, 80)}</option>`).join("")}${v && !S[f.ref][v] ? `<option value="${esc(v)}" selected>${esc(v)} (not found)</option>` : ""}</select>${f.ref === "team" && !sorted("team").length ? `<span class="hint">Add people under Team & work log first.</span>` : ""}`; }
  if (f.type === "refs") { const vals = Array.isArray(v) ? v : []; const rows = sorted(f.ref).filter(r => !vals.includes(r.id) && !(f.ref === c && r.id === drawerState.id));
    return `<div class="row" data-refs="${f.k}">${vals.map(x => `<span class="tag" style="display:inline-flex;gap:4px;align-items:center"><button type="button" class="btn sm" style="border:0;padding:0 2px;background:none" data-open="${f.ref}|${esc(x)}">${esc(x)}</button>${ME.canWrite ? `<button type="button" aria-label="Remove ${esc(x)}" data-rm="${esc(x)}" style="all:unset;cursor:pointer">×</button>` : ""}</span>`).join("") || `<span class="faint">none</span>`}
    ${ME.canWrite ? `<select id="${id}" data-addref="${f.k}" style="max-width:220px"><option value="">+ add…</option>${rows.map(r => `<option value="${esc(r.id)}">${esc(r.id + " · " + titleOf(f.ref, r)).slice(0, 70)}</option>`).join("")}</select>` : ""}</div>`; }
  const type = f.type === "num" || f.type === "money" ? "number" : f.type === "date" ? "date" : f.type === "url" ? "url" : "text";
  return `<input id="${id}" data-k="${f.k}" type="${type}" ${type === "number" ? 'step="any" inputmode="decimal"' : ""} value="${esc(v ?? "")}"${req}${dis} ${f.list ? `list="dl-${f.list}"` : ""}>`;
}
function datalists() {
  const cats = [...new Set(all("parts").map(p => p.category).filter(Boolean))], ex = meta().expenseCategories || [], fol = ["/GS750/00_Admin/", "/GS750/01_Inventory/", "/GS750/02_Engine/", "/GS750/03_Fuel/", "/GS750/04_Electrical/", "/GS750/05_Chassis/", "/GS750/06_Finish/", "/GS750/07_Assembly/", "/GS750/08_Testing/", "/GS750/09_Receipts/", "/GS750/10_Manuals/"];
  return `<datalist id="dl-cats">${cats.map(x => `<option value="${esc(x)}">`).join("")}</datalist><datalist id="dl-expcats">${ex.map(x => `<option value="${esc(x)}">`).join("")}</datalist><datalist id="dl-folders">${fol.map(x => `<option value="${esc(x)}">`).join("")}</datalist>`;
}
function renderDrawer(keepScroll) {
  const { c, draft: r, isNew } = drawerState; const sc = SCHEMA[c];
  const host = $("#drawerHost"); const prevScroll = keepScroll ? host.querySelector(".body")?.scrollTop : 0;
  const extra = DRAWER_EXTRA[c] ? DRAWER_EXTRA[c](r, isNew) : { head: "", top: "", bottom: "" };
  const hist = isNew ? [] : sorted("activity").filter(a => a.rid === r.id && a.coll === c).sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 12);
  drawerState.base = clone(S[c][r.id] || r);
  host.innerHTML = `<div class="drawer-bg"></div><aside class="drawer" role="dialog" aria-label="${esc(sc.label)} ${esc(r.id)}">
    <header><div style="min-width:0;flex:1"><div class="row"><span class="mono muted">${esc(r.id)}</span><span class="tag">${esc(sc.label)}</span>${extra.head || ""}${r.archived ? pill("gray", "Archived") : ""}</div>
    <h2>${isNew ? "New " + esc(sc.label.toLowerCase()) : esc(titleOf(c, r))}</h2></div><button class="x" data-close aria-label="Close">${ic("x")}</button></header>
    <div class="body">
      <div class="banner warn stale" hidden><div class="grow">Someone else changed this record while you were editing. Saving will overwrite their change.</div><button class="btn sm" data-reload>Load their version</button></div>
      ${extra.top || ""}
      <form class="form" id="recForm" novalidate>${sc.fields.map(f => `<div class="fld ${f.full || f.type === "textarea" ? "full" : ""}" data-fld="${f.k}"><label for="fld-${f.k}">${esc(f.label)}${f.req ? " *" : ""}</label>${fieldInput(c, f, r[f.k])}${f.hint ? `<span class="hint">${esc(f.hint)}</span>` : ""}<span class="err" hidden></span></div>`).join("")}</form>
      ${extra.bottom || ""}
      ${!isNew ? `<div><h2 class="sec">Change history</h2>${hist.length ? `<div class="feed">${hist.map(a => `<div><time>${fmtTime(a.ts)}</time><span><b>${esc(a.by)}</b> ${esc(a.summary)}</span></div>`).join("")}</div>` : `<p class="muted" style="margin:0">Created ${fmtDate(r.createdAt)} by ${esc(r.updatedBy || "—")}. Last updated ${fmtTime(r.updatedAt)}.</p>`}</div>` : ""}
      ${datalists()}
    </div>
    <footer>${ME.canWrite ? `<button class="btn pri" data-save>${isNew ? "Create " + esc(sc.label.toLowerCase()) : "Save changes"}</button>` : `<span class="muted">View only</span>`}
      ${!isNew && ME.canWrite ? `<button class="btn" data-dup>Duplicate</button><button class="btn" data-arch>${r.archived ? "Restore" : "Archive"}</button><span class="spacer"></span><button class="btn danger" data-del>Delete</button>` : ""}
      ${isNew ? `<button class="btn" data-close>Cancel</button>` : ""}</footer></aside>`;
  if (prevScroll) host.querySelector(".body").scrollTop = prevScroll;
  const form = $("#recForm");
  const mark = () => { drawerState.dirty = true; };
  $$("[data-k]", form).forEach(el => el.addEventListener(el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input", () => { const f = sc.fields.find(x => x.k === el.dataset.k); r[f.k] = el.type === "checkbox" ? el.checked : (f.type === "num" || f.type === "money") ? (el.value === "" ? "" : n(el.value)) : el.value; mark(); }));
  $$("[data-addref]", form).forEach(el => el.addEventListener("change", () => { if (!el.value) return; const k = el.dataset.addref; r[k] = [...(r[k] || []), el.value]; mark(); renderDrawerKeep(); }));
  $$("[data-rm]", form).forEach(b => b.onclick = e => { e.preventDefault(); const k = b.closest("[data-refs]").dataset.refs; r[k] = (r[k] || []).filter(x => x !== b.dataset.rm); mark(); renderDrawerKeep(); });
  form.addEventListener("submit", e => { e.preventDefault(); saveDrawer(); });
  form.addEventListener("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveDrawer(); } });
  host.querySelector(".drawer-bg").onclick = () => tryClose();
  $$("[data-close]", host).forEach(b => b.onclick = () => tryClose());
  host.querySelector("[data-save]") && (host.querySelector("[data-save]").onclick = saveDrawer);
  host.querySelector("[data-reload]") && (host.querySelector("[data-reload]").onclick = () => { drawerState.dirty = false; refreshDrawer(); });
  host.querySelector("[data-dup]") && (host.querySelector("[data-dup]").onclick = () => { const copy = clone(r); copy.id = nextId(c); delete copy.createdAt; copy[sc.title] = (copy[sc.title] || "") + " (copy)"; drawerState.draft = copy; drawerState.id = copy.id; drawerState.isNew = true; drawerState.dirty = true; renderDrawer(); });
  host.querySelector("[data-arch]") && (host.querySelector("[data-arch]").onclick = async () => { const rec = clone(S[c][r.id]); rec.archived = !rec.archived; await store.put(c, rec, { action: rec.archived ? "archived" : "restored" }); toast((rec.archived ? "Archived " : "Restored ") + r.id); drawerState.dirty = false; refreshDrawer(); });
  host.querySelector("[data-del]") && (host.querySelector("[data-del]").onclick = () => confirmBox("Delete " + r.id + "?", `<p style="margin:0">This removes <b>${esc(titleOf(c, r))}</b> for everyone. Links from other records will show the ID as not found. Archiving keeps it recoverable instead.</p>`, "Delete", async () => { const prev = await store.del(c, r.id); closeDrawer(); toast("Deleted " + r.id, null, { label: "Undo", fn: () => store.put(c, prev, { action: "restored" }) }); }));
  bindTables(host); if (extra.bind) extra.bind(host, r);
  if (!keepScroll) (form.querySelector("input,select,textarea") || host.querySelector(".x")).focus({ preventScroll: true });
}
function renderDrawerKeep() { const d = drawerState.dirty; renderDrawer(true); drawerState.dirty = d; }
function tryClose() {
  if (drawerState.dirty && ME.canWrite) { confirmBox("Discard unsaved changes?", `<p style="margin:0">You changed fields on ${esc(drawerState.id)} without saving.</p>`, "Discard", () => { closeDrawer(); }); return; }
  closeDrawer();
}
function validate(c, r) {
  const errs = {};
  SCHEMA[c].fields.forEach(f => {
    const v = r[f.k];
    if (f.req && (v === "" || v == null || (Array.isArray(v) && !v.length))) errs[f.k] = "Required.";
    if ((f.type === "num" || f.type === "money") && v !== "" && v != null && !isFinite(+v)) errs[f.k] = "Enter a number.";
    if ((f.type === "num" || f.type === "money") && n(v) < 0 && !["amount", "costImpact"].includes(f.k)) errs[f.k] = "Can't be negative.";
    if (f.type === "url" && v && !/^https?:\/\//i.test(v)) errs[f.k] = "Start the link with https://";
  });
  if (c === "parts") { const q = ["qtyServiceable", "qtyDamaged", "qtyMissing"].reduce((s, k) => s + n(r[k]), 0); if (n(r.qtyExpected) && q > Math.max(n(r.qtyExpected), n(r.qtyFound))) errs.qtyServiceable = "Serviceable + damaged + missing is more than expected/found."; }
  if (c === "tasks") {
    if (r.prereqs?.includes(r.id)) errs.prereqs = "A task can't depend on itself.";
    if (r.approval === "Approved") { const open = openPrereqs(r); if (open.length) errs.approval = "Can't approve: prerequisite tasks still open (" + open.join(", ") + ")."; if (r.status !== "Complete") errs.approval = "Mark the task Complete before approving it."; }
    if (r.start && r.due && r.due < r.start) errs.due = "Due date is before the start date.";
  }
  if (c === "gates" && r.status === "Passed") { if (!r.reviewer) errs.reviewer = "A reviewer is required to pass a gate."; if (!r.date) errs.date = "Record the review date."; if (!String(r.result || "").trim()) errs.result = "Document the result."; const o = gateOutstanding(r); if (o.length) errs.status = "Can't pass: " + o.length + " required task(s) still open (" + o.slice(0, 6).join(", ") + (o.length > 6 ? "…" : "") + ")."; }
  if (c === "checks" && (r.result === "Pass" || r.result === "Fail") && r.criticality === "Critical") { if (!r.inspector && !r.reviewer) errs.inspector = "Record who performed the check."; if (!r.date) errs.date = "Record the date."; }
  if (c === "inspections" && r.result === "Pass" && r.safetyCritical && !r.reviewer) errs.reviewer = "Safety-critical inspections need a reviewer to pass.";
  if (c === "phases" && r.approval === "Approved") { const st = phaseStats(r); if (st.remaining) errs.approval = st.remaining + " task(s) in this phase are not complete."; }
  return errs;
}
async function saveDrawer() {
  const { c, draft: r } = drawerState;
  const errs = validate(c, r);
  $$("#recForm .fld").forEach(el => { const e = errs[el.dataset.fld]; el.classList.toggle("bad", !!e); const s = el.querySelector(".err"); s.hidden = !e; s.textContent = e || ""; });
  if (Object.keys(errs).length) { const first = $("#recForm .fld.bad"); first && first.scrollIntoView({ block: "center" }); toast("Fix the highlighted fields.", "err"); return; }
  if (c === "tasks" && r.status === "Complete" && !r.completedAt) r.completedAt = today();
  if (c === "tasks" && r.status === "Complete" && openPrereqs(r).length) toast("Saved, but note: prerequisites " + openPrereqs(r).join(", ") + " are still open.");
  try {
    const prev = await store.put(c, r);
    const wasNew = drawerState.isNew; drawerState.isNew = false; drawerState.dirty = false;
    toast((wasNew ? "Created " : "Saved ") + r.id, null, prev ? { label: "Undo", fn: () => store.put(c, prev, { action: "reverted" }) } : null);
    if (c === "meta") return;
    refreshDrawer();
  } catch (e) {}
}

/* Quick status change from a list / viewer without opening the full form */
async function quickSet(c, id, patch, msg) {
  const rec = clone(S[c][id]); if (!rec) return;
  if (c === "tasks" && patch.status === "Complete" && !rec.completedAt) patch.completedAt = today();
  Object.assign(rec, patch);
  const errs = validate(c, rec); const k = Object.keys(errs)[0];
  if (k) { toast(errs[k], "err"); render(false); return false; }
  try { const prev = await store.put(c, rec); toast(msg || "Updated " + id, null, { label: "Undo", fn: () => store.put(c, prev, { action: "reverted" }) }); return true; } catch (e) { return false; }
}

/* ============ photos (compressed into the record store) ============ */
function compressImage(file, maxBytes = 180000) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height, max = 1280; const cv = document.createElement("canvas"); let q = .78, out = "";
      for (let tries = 0; tries < 8; tries++) {
        const s = Math.min(1, max / Math.max(w, h)); cv.width = Math.round(w * s); cv.height = Math.round(h * s);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); out = cv.toDataURL("image/jpeg", q);
        if (out.length * .75 < maxBytes) break; if (q > .5) q -= .1; else max = Math.round(max * .8);
      }
      URL.revokeObjectURL(url); out.length * .75 < maxBytes ? res(out) : rej(new Error("too big"));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("not an image")); };
    img.src = url;
  });
}
function uploadPhotos(link = {}) {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*,application/pdf"; inp.multiple = true;
  inp.onchange = async () => {
    const files = Array.from(inp.files || []); let ok = 0;
    for (const f of files) {
      let data = "";
      try {
        if (f.type.startsWith("image/")) data = await compressImage(f);
        else if (f.size < 170000) data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
        else { toast(f.name + " is too large to store here. Add it as a link to your shared drive instead.", "err"); continue; }
      } catch (e) { toast("Couldn't read " + f.name + ".", "err"); continue; }
      const rec = blank("docs", Object.assign({ title: f.name.replace(/\.[^.]+$/, ""), fileName: f.name, file: data, kind: link.kind || (f.type.startsWith("image/") ? "During photo" : "Supplier document") }, link));
      try { await store.put("docs", rec); ok++; } catch (e) {}
    }
    if (ok) toast(ok + " file" + (ok > 1 ? "s" : "") + " added" + (link.partId ? " to " + link.partId : ""));
  };
  inp.click();
}
const thumbs = list => list.length ? `<div class="thumbs">${list.map(d => d.file && d.file.startsWith("data:image") ? `<img src="${d.file}" alt="${esc(d.title)}" data-open="docs|${esc(d.id)}">` : `<button class="btn sm" data-open="docs|${esc(d.id)}">${esc(d.title || d.id)}</button>`).join("")}</div>` : `<span class="faint">No photos or documents yet.</span>`;

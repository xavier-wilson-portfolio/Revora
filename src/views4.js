/* ============ HOME (car-site layout), PAINT STUDIO, GUIDES ============ */
function heroPhotoDoc() { const id = meta().heroPhoto, d = id && S.docs[id]; return d && !d.archived && d.file && d.file.startsWith("data:image") ? d : null; }
const HERO_STOCK = { src: "img/gs750-cutout.webp", alt: "Blue early Suzuki GS750 with wire-spoke wheels, side view, background removed", cap: "Early Suzuki GS750 with wire-spoke wheels, the 1977 look. The photographer didn't record the exact year.", credit: "Cédric Janodet", page: "https://www.flickr.com/photos/35083786@N04/15037249471", lic: "CC BY-NC-SA 2.0, background removed", licUrl: "https://creativecommons.org/licenses/by-nc-sa/2.0/" };
function heroPhotoHtml() {
  const d = heroPhotoDoc(), bike = meta().bike || "1977 Suzuki GS750", H = HERO_STOCK;
  return `<figure class="herophoto has${d ? "" : " cutout"}">${d ? `<img src="${d.file}" alt="${esc(d.title || "Photo of the " + bike)}">` : `<img class="hp-cut" src="${H.src}" alt="${esc(H.alt)}" width="1097" height="633"><figcaption class="hp-cap">${esc(H.cap)} Photo: <a href="${H.page}" target="_blank" rel="noopener">${esc(H.credit)}</a>, <a href="${H.licUrl}" target="_blank" rel="noopener">${esc(H.lic)}</a></figcaption>`}
    ${ME.canWrite ? `<div class="hp-tools">${d ? `<button class="btn sm" id="hpChange">${ic("image")} Change photo</button><button class="btn sm" id="hpRemove">Use the stock photo</button>` : `<button class="btn sm" id="hpAdd">${ic("image")} Use my own photo</button>`}</div>` : ""}</figure>`;
}
function heroPhotoPick() {
  const inp = document.createElement("input"); inp.type = "file"; inp.accept = "image/*";
  inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return;
    let data; try { data = await compressImage(f, 420000); } catch (e) { toast("Couldn't read that image.", "err"); return; }
    const rec = blank("docs", { title: "Home page photo", fileName: f.name, file: data, kind: "During photo" });
    try { await store.put("docs", rec, { action: "added the home page photo" }); const m = clone(meta()); m.heroPhoto = rec.id; await store.put("meta", m, { action: "set the home page photo" }); toast("Photo added to the home page."); } catch (e) {} };
  inp.click();
}
function bindHeroPhoto(root) {
  const a = $("#hpAdd", root), c = $("#hpChange", root), r = $("#hpRemove", root);
  if (a) a.onclick = heroPhotoPick; if (c) c.onclick = heroPhotoPick;
  if (r) r.onclick = async () => { const m = clone(meta()); delete m.heroPhoto; await store.put("meta", m, { action: "removed the home page photo" }); toast("Photo removed from the home page. It's still in Photos & files."); };
}
VIEWS.home = {
  render() {
    const m = meta(), prog = overallProgress(), nx = nextLesson(), nxi = lessonIndex(nx.id), L = LESSONS[nx.id] || {}, ns = phaseStats(nx), pc = partCounts(), f = finance();
    const ts = sorted("tasks"), done = ts.filter(tasksDone).length, chk = sorted("checks"), gates = sorted("gates");
    const passed = chk.filter(c => c.result === "Pass").length + gates.filter(g => g.status === "Passed").length;
    const rec = recommendedTasks(4), act = sorted("activity").sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);
    const pname = m.paintName || "Candy blue";
    return `${exampleBanner()}
    <section class="hero2 full">
      <div class="hero2-text"><div class="eyebrow">${esc(m.bike || "1977 Suzuki GS750")} · Restoration course</div>
        <h1>Let's bring this GS750 back to life</h1>
        <p>Fourteen parts, one step at a time. Every step tells you what to do and why, the 3D diagrams show every piece, and the mechanic is a click away if you get stuck.</p>
        <div class="act"><button class="btn tan big" data-lesson="${nx.id}">${ic("play")} ${lessonState(nx) === "todo" && nxi === 0 ? "Start Part 1" : "Continue Part " + (nxi + 1)}</button>${(L.focus && GROUP_DIAG[L.focus] && scanBtn(GROUP_DIAG[L.focus], "Scan parts", "btn big")) || scanPickBtn("Scan parts", "btn big")}<button class="btn big" data-go="diagrams">${ic("cube")} Explore 3D diagrams</button></div></div>
      ${heroPhotoHtml()}
      <div class="specstrip">${SPECS.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>
      <p class="specsrc">Published specs for the 1976–77 GS750. <a href="${SPEC_SOURCE.url}" target="_blank" rel="noopener">Source</a>. Always check against your bike and its factory manual.</p>
    </section>
    <div class="ph" style="display:none"></div>
    <section class="contcard">
      <img src="img/${L.img}.svg" alt="">
      <div class="stack" style="gap:8px"><div class="eyebrow">${lessonState(nx) === "todo" && nxi === 0 ? "Start here" : "Pick up where you left off"} · Part ${nxi + 1} of 14</div><h2 class="disp">${esc(L.title || nx.name)}</h2><p class="muted" style="margin:0">${esc(L.short || "")}</p>
        <div class="row"><span class="num muted">${ns.done} of ${ns.total} steps</span><div class="progress" style="flex:1;min-width:120px"><i style="width:${ns.pct * 100}%"></i></div></div>
        <div class="row"><button class="btn pri" data-lesson="${nx.id}">Open Part ${nxi + 1} ${ic("next")}</button>${askBtn(`I'm starting Part ${nxi + 1} (${L.title}). What should I do first, in simple steps?`, "Part " + (nxi + 1), "btn ask")}${(L.focus && GROUP_DIAG[L.focus] && scanBtn(GROUP_DIAG[L.focus], "Scan parts", "btn")) || scanPickBtn("Scan parts", "btn")}</div></div>
    </section>
    <section class="stack"><div class="sechead"><div class="eyebrow">How it works</div><h2 class="disp">Three things to remember</h2></div>
      <div class="steps3">
        <div class="step3"><span class="ico">${ic("book")}</span><span class="n">01</span><h3>Follow the course</h3><p>Start at Part 1. Tick off each step as you finish it.</p><button class="btn sm" data-go="course">See the course</button></div>
        <div class="step3"><span class="ico">${ic("cube")}</span><span class="n">02</span><h3>Look before you wrench</h3><p>Open the 3D diagram for any area to see how every piece fits together.</p><button class="btn sm" data-go="diagrams">Open 3D diagrams</button></div>
        <div class="step3"><span class="ico">${ic("chat")}</span><span class="n">03</span><h3>Ask when you're stuck</h3><p>The mechanic answers questions on every page and every step.</p><button class="btn sm ask" data-ask="" data-ask-ctx="">${ic("chat")} Ask the mechanic</button></div>
      </div></section>
    <section class="stack"><div class="sechead"><div class="eyebrow">The course</div><h2 class="disp">Your 14 parts</h2><p>Open any part, any time. The highlighted one is where you are now.</p></div>
      <div class="lessons">${sorted("phases").map((p, i) => lessonCard(p, i, p.id === nx.id)).join("")}</div></section>
    <section class="band full"><div class="band-in stack"><div class="sechead"><div class="eyebrow">Up close</div><h2 class="disp">Know every piece</h2><p>Click a picture to pull that part out of the bike in the 3D garage.</p></div>
      <div class="gallery2">${GALLERY.map(([img, t, d, g], i) => `<button class="gtile" data-3d="${g}"><img src="img/${img}.svg" alt="${esc(t)}" loading="lazy"><span><b>${esc(t)}</b><small>${esc(d)}</small></span></button>`).join("")}</div></div></section>
    <section class="vband"><div class="vb-text stack"><div class="eyebrow">Watch & learn</div><h2 class="disp">See a GS750 rebuilt, start to finish</h2><p class="muted" style="margin:0">A 20-part video series following one GS750 restoration. Watch an episode before you start the matching job.</p>
        <div class="row"><button class="btn pri" data-go="videos">${ic("play")} Watch the series</button><span class="hint-text">${VIDEOS.length} videos · ${totalRuntime()}</span></div></div>
      <button class="vb-art" data-go="videos" aria-label="Open the video series">${vidThumb(6, "big")}<span class="vp-btn">${ic("play")}</span></button></section>
    <section class="paintband"><div class="pb-art">${bikeArt(n(m.paintHex) || PAINTS[pname] || PAINTS["Candy blue"], m.frameFinish || "Gloss black", m.stripe || "gold")}</div>
      <div class="stack" style="gap:10px"><div class="eyebrow">Paint studio</div><h2 class="disp">Pick your colors</h2><p class="muted" style="margin:0">Try eight classic colors on the bike, choose a frame finish and pinstripe, then follow the step-by-step guide to painting the tank and parts.</p>
        <div class="swatches small">${Object.entries(PAINTS).map(([nm, hex]) => `<span class="swatch" title="${esc(nm)}" style="--c:#${hex.toString(16).padStart(6, "0")}"></span>`).join("")}</div>
        <div><button class="btn pri" data-go="paint">Open the Paint Studio ${ic("next")}</button></div></div></section>
    <section class="stack"><div class="sechead"><div class="eyebrow">Progress</div><h2 class="disp">At a glance</h2></div>
      <div class="kpis">
        <button class="kpi green" data-go="inventory|${esc(JSON.stringify({ color: "green" }))}"><span class="l">Parts finished</span><span class="v">${pc.green} / ${pc.total}</span><span class="s">restored and checked</span></button>
        <button class="kpi" data-go="tasks"><span class="l">Steps done</span><span class="v">${done} / ${ts.length}</span><span class="s">across all 14 parts</span></button>
        <button class="kpi ${f.forecast > f.total ? "red" : ""}" data-go="budget"><span class="l">Money spent</span><span class="v">${money(f.paid)}</span><span class="s">of ${money(f.total)} budget</span></button>
        <button class="kpi" data-go="gates"><span class="l">Safety checks passed</span><span class="v">${passed} / ${chk.length + gates.length}</span><span class="s">${safetyUnresolved()} open safety issues</span></button>
      </div></section>
    <div class="grid g2" style="align-items:start">
      <div class="panel stack"><h2 class="sec left">Ready to do next</h2><p class="hint-text" style="text-align:left">Everything these steps depend on is done. Tick one off when it's finished.</p>
        ${rec.length ? `<div class="stepl">${rec.map(t => `<div class="st"><div class="st-h" data-open="tasks|${t.id}">${stepCheck(t)}<div class="st-t"><b>${esc(t.title)}</b><span>Part ${lessonIndex(t.phase) + 1} · ${esc(LESSONS[t.phase]?.title || "")}${t.safety === "Critical" ? " · safety-critical" : ""}</span></div>${ic("next")}</div></div>`).join("")}</div>` : `<div class="empty">Nothing is ready right now. Check the To-do list for blocked steps.</div>`}</div>
      <div class="panel stack"><h2 class="sec left">Recent activity</h2>${act.length ? `<div class="feed">${act.map(a => `<div><time>${fmtTime(a.ts)}</time><span><b>${esc(a.by)}</b> ${esc(a.summary)}${a.title && SCHEMA[a.coll] ? ` · ${esc(String(a.title).slice(0, 40))}` : ""}</span></div>`).join("")}</div>` : `<div class="empty">Changes by the team show up here.</div>`}</div>
    </div>
    <details class="more"><summary>Show all the numbers ${ic("chev")}</summary><div class="stack" style="margin-top:12px">${VIEWS.overview.render()}</div></details>`;
  },
  bind(root) { bindHeroPhoto(root); bindSetup(root); bindTables(root); bindLessonLinks(root); bindStepChecks(root); $$("[data-3d]", root).forEach(b => b.onclick = () => openIn3D(b.dataset["3d"])); $("#qPhoto", root) && ($("#qPhoto", root).onclick = () => uploadPhotos({})); }
};

/* ---------- Paint studio ---------- */
const STRIPE_HEX = { gold: "#C9A13A", white: "#F4F4F2", black: "#15181B", none: "#000000" };
function bikeArt(hex, frame, stripe, cls = "") {
  const h = "#" + ((+hex || 0) >>> 0).toString(16).padStart(6, "0"), fv = FRAMES[frame], fh = fv == null ? h : "#" + fv.toString(16).padStart(6, "0");
  const st = `--paint:${h};--frame:${fh};--stripe:${STRIPE_HEX[stripe] || STRIPE_HEX.gold};--stripe-o:${stripe === "none" ? 0 : 1}`;
  return BIKE_SVG.replace("<svg ", `<svg role="img" aria-label="GS750 illustration in the chosen colors" style="${st}" `).replace('class="gsb', `class="gsb bikeart ${cls}`);
}
const PAINT_STATUS = ["Not started", "Stripped", "Primed", "Color on", "Done"];
VIEWS.paint = {
  draft: null,
  render() {
    const m = meta(); const d = this.draft = this.draft || { name: m.paintName || "Candy blue", hex: n(m.paintHex) || PAINTS[m.paintName || "Candy blue"] || PAINTS["Candy blue"], frame: m.frameFinish || "Gloss black", stripe: m.stripe || "gold" };
    const isPreset = PAINTS[d.name] !== undefined, hexStr = "#" + d.hex.toString(16).padStart(6, "0"), plan = m.paintPlan || {};
    const saved = m.paintName === d.name && n(m.paintHex) === d.hex && (m.frameFinish || "Gloss black") === d.frame && (m.stripe || "gold") === d.stripe;
    return `${pageHead("paint")}
    <section class="config">
      <div class="cfg-img">${bikeArt(d.hex, d.frame, d.stripe)}
        <div class="cfg-cap"><span class="swatch" style="--c:${hexStr}"></span><b>${esc(d.name)}</b><span class="muted">· ${esc(d.frame)} frame · ${esc(STRIPES[d.stripe])}</span></div></div>
      <div class="cfg-panel stack">
        <div><div class="cfg-l">1. Tank & side cover color</div><div class="swatches">${Object.entries(PAINTS).map(([nm, hex]) => `<button class="swatch big ${d.name === nm ? "on" : ""}" data-paint="${esc(nm)}" style="--c:#${hex.toString(16).padStart(6, "0")}" aria-label="${esc(nm)}" title="${esc(nm)}"></button>`).join("")}<label class="swatch big custom ${!isPreset ? "on" : ""}" title="Custom color" style="--c:${!isPreset ? hexStr : "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)"}"><input type="color" id="pCustom" value="${hexStr}" aria-label="Custom color"></label></div><div class="cfg-v">${esc(d.name)}</div></div>
        <div><div class="cfg-l">2. Frame finish</div><div class="seg">${Object.keys(FRAMES).map(k => `<button class="${d.frame === k ? "on" : ""}" data-frame="${esc(k)}">${esc(k)}</button>`).join("")}</div></div>
        <div><div class="cfg-l">3. Pinstripe</div><div class="seg">${Object.entries(STRIPES).map(([k, l]) => `<button class="${d.stripe === k ? "on" : ""}" data-stripe="${k}">${esc(l.replace(" pinstripe", ""))}</button>`).join("")}</div></div>
        <div class="row center" style="margin-top:4px">${ME.canWrite ? `<button class="btn pri" id="pSave" ${saved ? "disabled" : ""}>${saved ? ic("tick") + " Saved as your scheme" : "Save this scheme"}</button>` : ""}<button class="btn" id="p3d">${ic("cube")} See it in 3D</button></div>
        <div class="row center">${askBtn(`Help me choose a paint scheme for my 1977 GS750. I'm thinking ${d.name} with a ${d.frame} frame and ${STRIPES[d.stripe]}. What looks period-correct and what's practical?`, "this color scheme", "btn sm ask")}</div>
        <p class="hint-text" style="text-align:center">These are paint looks, not factory color codes. If you want the original 1977 color, match it to a clean, hidden area of the original paint with a paint supplier.</p>
      </div>
    </section>
    <section class="stack"><div class="sechead"><div class="eyebrow">Choose the right finish</div><h2 class="disp">Which finish goes where</h2><p>Most restorations mix several finishes. Here's what each one is good for.</p></div>
      <div class="finishes">${FINISH_TYPES.map(([t, d2, w]) => `<div class="fin"><b>${esc(t)}</b><p>${esc(d2)}</p><span class="tag">Best for: ${esc(w)}</span></div>`).join("")}</div></section>
    <section class="stack"><div class="sechead"><div class="eyebrow">Your repaint plan</div><h2 class="disp">Parts to refinish</h2><p>Pick a finish for each part and track it as you go. Saved for the whole team.</p></div>
      <div class="planlist">${PAINT_PARTS.map(([k, label, pid]) => { const pl = plan[k] || {}; const p = S.parts[pid];
        return `<div class="planrow"><img src="img/g-${k}.svg" alt="" loading="lazy"><div class="pl-t"><b>${esc(label)}</b>${p ? `<span>${partPill(p)}</span>` : ""}</div>
        <label class="pl-f"><span>Finish</span><select data-plan="${k}" data-pf="finish" ${ME.canWrite ? "" : "disabled"}><option value="">Undecided</option><option ${pl.finish === "Leave as is" ? "selected" : ""}>Leave as is</option>${FINISH_TYPES.map(([t]) => `<option ${pl.finish === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
        <label class="pl-f"><span>Progress</span><select data-plan="${k}" data-pf="status" ${ME.canWrite ? "" : "disabled"}>${PAINT_STATUS.map(st => `<option ${(pl.status || "Not started") === st ? "selected" : ""}>${st}</option>`).join("")}</select></label></div>`; }).join("")}</div>
      <div class="row center"><span class="hint-text">${Object.values(plan).filter(x => x.status === "Done").length} of ${PAINT_PARTS.length} parts finished</span><button class="btn sm" data-go="finish">Open finish records & photos</button></div></section>
    <section class="band full"><div class="band-in stack"><div class="sechead"><div class="eyebrow">Step by step</div><h2 class="disp">How to paint the fuel tank</h2><p>The tank is the part everyone looks at first. Do it in this order and don't skip the boring steps.</p></div>
      <img class="guide-img" src="img/d-tank.svg" alt="Painted GS750 fuel tank">
      <ol class="process">${TANK_STEPS.map(([t, d2, i], k) => `<li><span class="pn">${String(k + 1).padStart(2, "0")}</span><div class="stack" style="gap:4px"><b>${esc(t)}</b><p>${esc(d2)}</p><div>${askBtn(`Explain step ${k + 1} of painting my GS750 tank ("${t}") in more detail: ${d2}`, t, "linkbtn ask")}</div></div></li>`).join("")}</ol></div></section>
    <section class="stack"><div class="sechead"><div class="eyebrow">Everything else</div><h2 class="disp">Painting the other parts</h2></div>
      <div class="grid g3">${PARTS_PROCESS.map(([t, d2]) => `<div class="panel stack" style="gap:6px"><h3 class="disp-s">${esc(t)}</h3><p style="margin:0;font-size:14.5px">${esc(d2)}</p><div>${askBtn(`How should I refinish the ${t.toLowerCase()} on my GS750? ${d2}`, t, "linkbtn ask")}</div></div>`).join("")}</div></section>
    <section class="panel stack safetybox"><h2 class="sec left" style="display:flex;gap:8px;align-items:center">${ic("warn")} Paint safety</h2><ul class="tips">${PAINT_SAFETY.map(x => `<li>${ic("shield")}<span>${esc(x)}</span></li>`).join("")}</ul></section>
    <section class="stack"><div class="sechead"><div class="eyebrow">Supplies</div><h2 class="disp">Where to get paint supplies</h2><p>Automotive paint suppliers can mix any color into base coat, single stage or aerosol cans. These shops cover tank sealers and coatings.</p></div><div class="shops">${["caswell", "por15", "gsr"].map(shopCard).join("")}</div></section>`;
  },
  bind(root) {
    const self = this, d = this.draft;
    const upd = () => render(false);
    $$("[data-paint]", root).forEach(b => b.onclick = () => { d.name = b.dataset.paint; d.hex = PAINTS[d.name]; upd(); });
    $("#pCustom", root).oninput = debounce(e => { d.hex = parseInt(e.target.value.slice(1), 16); d.name = "Custom " + e.target.value.toUpperCase(); upd(); }, 150);
    $$("[data-frame]", root).forEach(b => b.onclick = () => { d.frame = b.dataset.frame; upd(); });
    $$("[data-stripe]", root).forEach(b => b.onclick = () => { d.stripe = b.dataset.stripe; upd(); });
    $("#pSave", root) && ($("#pSave", root).onclick = async () => { const m = clone(meta()); Object.assign(m, { paintName: d.name, paintHex: d.hex, frameFinish: d.frame, stripe: d.stripe }); await store.put("meta", m, { action: `chose the paint scheme: ${d.name}, ${d.frame} frame` }); toast("Paint scheme saved. The 3D bike now uses it."); });
    $("#p3d", root).onclick = async () => { const m = clone(meta()); if (ME.canWrite && !(m.paintName === d.name && n(m.paintHex) === d.hex && m.frameFinish === d.frame && m.stripe === d.stripe)) { Object.assign(m, { paintName: d.name, paintHex: d.hex, frameFinish: d.frame, stripe: d.stripe }); await store.put("meta", m, { action: `previewed the paint scheme: ${d.name}` }); } openIn3D("tank"); };
    $$("[data-plan]", root).forEach(sel => sel.onchange = async () => { const m = clone(meta()); m.paintPlan = Object.assign({}, m.paintPlan || {}); const k = sel.dataset.plan; m.paintPlan[k] = Object.assign({}, m.paintPlan[k] || {}, { [sel.dataset.pf]: sel.value }); await store.put("meta", m, { action: `repaint plan: ${k} ${sel.dataset.pf} → ${sel.value}` }); toast("Repaint plan updated"); });
    bindTables(root);
  }
};

/* ---------- Guides library ---------- */
VIEWS.guides = {
  render() {
    const g = R.guide && GUIDES[R.guide];
    if (!g || g.sec) return `${pageHead("guides")}<div class="guidegrid">${Object.entries(GUIDES).map(([k, x]) => `<button class="gcard" data-guide="${k}"><img src="img/${x.img}.svg" alt="" loading="lazy"><span><b>${esc(x.title)}</b><small>${esc(x.sum)}</small><em>Read the guide ${ic("next")}</em></span></button>`).join("")}</div>
      <div class="row center">${askBtn("", "", "btn ask")}</div>`;
    const others = Object.entries(GUIDES).filter(([k]) => k !== R.guide).slice(0, 4);
    return `<div class="ph" data-own="1"><div class="eyebrow">Guide</div><h1>${esc(g.title)}</h1><p>${esc(g.sum)}</p></div>
      <img class="guide-img" src="img/${g.img}.svg" alt="">
      <article class="article">${g.body.map(([h, t]) => `<section><h2>${esc(h)}</h2><p>${esc(t)}</p></section>`).join("")}
        <div class="panel blue row center" style="gap:12px"><span>Still have a question about ${esc(g.title.toLowerCase())}?</span>${askBtn("", g.title, "btn pri ask")}</div></article>
      <div class="stack"><h2 class="sec">More guides</h2><div class="guidegrid">${others.map(([k, x]) => `<button class="gcard" data-guide="${k}"><img src="img/${x.img}.svg" alt="" loading="lazy"><span><b>${esc(x.title)}</b><small>${esc(x.sum)}</small></span></button>`).join("")}</div></div>
      <div class="row center"><button class="btn" data-goto="guides">${ic("back")} All guides</button></div>`;
  },
  bind(root) { $$("[data-guide]", root).forEach(b => b.onclick = () => { const k = b.dataset.guide; if (GUIDES[k].sec) go(GUIDES[k].sec); else go("guide-" + k); }); }
};

/* ---------- Video series ---------- */
const PLAYLIST = { id: "PLUaEfmk4az31IJOwqyEBSCbxIwF1XJAga", title: "GS750 Restoration", by: "plaxsax" };
const VIDEOS = [["hZuJuWPuTsw", "9:29"], ["iUQD9i3cs0A", "9:02"], ["pT_gBdtKqt4", "10:16"], ["1PxYAUK-CvE", "11:51"], ["UuWMwMd2HYc", "10:49"], ["ShK1PRcjk-0", "11:09"], ["IKp8lTOAGho", "15:25"], ["4AK7pzgj3KA", "8:29"], ["5ZzxJ1Q0mro", "11:09"], ["9oyMwQYIaI4", "9:46"],
  ["7En5k7KkK-s", "12:11"], ["P_2j-3ZiFOE", "12:31"], ["6met71BS51M", "10:54"], ["TgstfUs6hRo", "12:40"], ["rbcg_pCPcaY", "13:06"], ["WE6BmX6fgMg", "13:44"], ["PbSLDo14zys", "18:47"], ["siM5wDtoNEA", "24:22"], ["AUKyA4Y_KRE", "14:04"], ["2SHZwb73vYs", "25:04"]];
const vidUrl = (id, i) => `https://www.youtube.com/watch?v=${id}&list=${PLAYLIST.id}&index=${i + 1}`;
const vidEmbed = (id, i) => `https://www.youtube-nocookie.com/embed/${id}?list=${PLAYLIST.id}&index=${i + 1}&rel=0&modestbranding=1`;
/* thumbnails come from one sprite published with the page (5 across, 4 down); videos can't be embedded in the page, so every play button opens YouTube */
const vidThumb = (i, cls = "") => `<span class="vthumb ${cls}" style="background-position:${(i % 5) * 25}% ${Math.floor(i / 5) * 100 / 3}%" aria-hidden="true"></span>`;
const totalRuntime = () => { const s = VIDEOS.reduce((a, [, d]) => { const [m, x] = d.split(":").map(Number); return a + m * 60 + x; }, 0); return `${Math.floor(s / 3600)} h ${Math.round(s % 3600 / 60)} min`; };
VIEWS.videos = {
  cur: 0,
  render() {
    const w = meta().videosWatched || {}, seen = VIDEOS.filter(([id]) => w[id]).length, cur = this.cur, [cid, cdur] = VIDEOS[cur];
    return `${pageHead("videos")}
    <section class="vplayer">
      <div class="vframe" id="vFrame"><a class="vposter" id="vPlay" href="${vidUrl(cid, cur)}" target="_blank" rel="noopener" aria-label="Watch part ${cur + 1} on YouTube (opens a new tab)">
        ${vidThumb(cur, "big")}
        <span class="vp-btn">${ic("play")}</span><span class="vp-cap"><b>Part ${cur + 1}</b> · ${cdur}${window.claude && window.claude.use ? " · plays on YouTube" : ""}</span></a></div>
      <div class="vside stack">
        <div class="eyebrow">Now showing</div><h2 class="disp" style="margin:0">Part ${cur + 1} of ${VIDEOS.length}</h2>
        <p class="muted" style="margin:0">${esc(PLAYLIST.title)} by ${esc(PLAYLIST.by)} · ${cdur}</p><p class="hint-text" style="text-align:left;margin:0">${window.claude && window.claude.use ? "Press play and the video opens on YouTube in a new tab. YouTube videos can't play inside this page." : "Press play to watch it here."}</p>
        <div class="row">${ME.canWrite ? `<button class="btn ${w[cid] ? "" : "pri"}" data-watch="${cid}">${w[cid] ? ic("tick") + " Watched" : "Mark as watched"}</button>` : ""}<a class="btn" href="${vidUrl(cid, cur)}" target="_blank" rel="noopener">Open on YouTube ${ic("ext")}</a></div>
        <div class="row"><button class="btn sm" data-vnav="-1" ${cur === 0 ? "disabled" : ""}>${ic("back")} Previous</button><button class="btn sm" data-vnav="1" ${cur === VIDEOS.length - 1 ? "disabled" : ""}>Next ${ic("next")}</button></div>
        <div class="vstat"><div><b>${VIDEOS.length}</b><span>videos</span></div><div><b>${totalRuntime()}</b><span>total</span></div><div><b>${seen}/${VIDEOS.length}</b><span>watched</span></div></div>
        <div class="progress"><i style="width:${seen / VIDEOS.length * 100}%"></i></div>
        <div>${askBtn(`I'm watching a YouTube series where someone restores a Suzuki GS750 (part ${cur + 1} of 20). What should I watch for, and what should I double-check in my factory manual before copying anything they do?`, "this video", "btn sm ask")}</div>
      </div>
    </section>
    <section class="stack"><div class="sechead"><div class="eyebrow">All episodes</div><h2 class="disp">The full series</h2><p>Click a part to pick it, or the arrow to watch it on YouTube.</p></div>
      <div class="vgrid">${VIDEOS.map(([id, d], i) => `<div class="vcard ${i === cur ? "on" : ""} ${w[id] ? "seen" : ""}"><button class="vc-main" data-vid="${i}">${vidThumb(i, "sm")}<span class="vc-t"><b>Part ${i + 1}</b><small>${d}${w[id] ? " · watched" : ""}</small></span><span class="vc-p">${ic(w[id] ? "tick" : "play")}</span></button><a class="vc-yt" data-i="${i}" href="${vidUrl(id, i)}" target="_blank" rel="noopener" aria-label="Open part ${i + 1} on YouTube">${ic("ext")}</a></div>`).join("")}</div>
      <p class="hint-text" style="text-align:center">Videos by ${esc(PLAYLIST.by)} on YouTube. <a href="https://www.youtube.com/playlist?list=${PLAYLIST.id}" target="_blank" rel="noopener">Open the whole playlist</a>.</p></section>`;
  },
  bind(root) {
    const self = this;
    const markSeen = async id => { if (!ME.canWrite || (meta().videosWatched || {})[id]) return; const m = clone(meta()); m.videosWatched = Object.assign({}, m.videosWatched || {}, { [id]: today() }); try { await store.put("meta", m, { action: `watched video part ${VIDEOS.findIndex(v => v[0] === id) + 1}` }); } catch (e) {} };
    // On the standalone website YouTube can play right here; inside a Claude artifact the link opens YouTube instead.
    const canEmbed = !(window.claude && window.claude.use);
    $("#vPlay", root) && ($("#vPlay", root).onclick = e => { const [id] = VIDEOS[self.cur]; markSeen(id);
      if (!canEmbed) return; e.preventDefault();
      $("#vFrame", root).innerHTML = `<iframe src="${vidEmbed(id, self.cur)}&autoplay=1" title="GS750 restoration part ${self.cur + 1}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`; });
    $$(".vc-yt", root).forEach(a => a.addEventListener("click", () => { const i = +a.dataset.i; if (VIDEOS[i]) markSeen(VIDEOS[i][0]); }));
    $$("[data-vid]", root).forEach(b => b.onclick = () => { self.cur = +b.dataset.vid; render(false); window.scrollTo({ top: 0, behavior: "smooth" }); });
    $$("[data-vnav]", root).forEach(b => b.onclick = () => { self.cur = Math.max(0, Math.min(VIDEOS.length - 1, self.cur + +b.dataset.vnav)); render(false); });
    $$("[data-watch]", root).forEach(b => b.onclick = async () => { const m = clone(meta()); m.videosWatched = Object.assign({}, m.videosWatched || {}); const id = b.dataset.watch; if (m.videosWatched[id]) delete m.videosWatched[id]; else m.videosWatched[id] = today(); await store.put("meta", m, { action: `${m.videosWatched[id] ? "watched" : "unmarked"} video part ${VIDEOS.findIndex(v => v[0] === id) + 1}` }); });
  }
};

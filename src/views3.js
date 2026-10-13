/* ============ HOME, COURSE, LESSONS, SHOPS ============ */
const lessonIndex = id => sorted("phases").findIndex(p => p.id === id);
function lessonState(ph) { const s = phaseStats(ph); if (s.total && s.done === s.total) return "done"; if (s.done > 0 || s.tasks.some(t => t.status === "In progress")) return "doing"; return "todo"; }
function nextLesson() { const phs = sorted("phases"); return phs.find(p => lessonState(p) === "doing") || phs.find(p => lessonState(p) !== "done") || phs[phs.length - 1]; }
const statePill = st => st === "done" ? pill("green", "Done") : st === "doing" ? pill("amber", "In progress") : pill("gray", "Not started");
function lessonCard(ph, i, isNext) {
  const L = LESSONS[ph.id] || {}, s = phaseStats(ph), st = lessonState(ph);
  return `<button class="lesson ${isNext ? "next" : ""}" data-lesson="${ph.id}" aria-label="Part ${i + 1}: ${esc(L.title || ph.name)}">
    <div class="limg"><img src="img/${L.img || "hero"}.svg" alt="" loading="lazy"><span class="lnum">Part ${i + 1}</span><span class="lstate">${isNext ? pill("amber", "Up next").replace("amber", "amber") : statePill(st)}</span></div>
    <div class="lbody"><b>${esc(L.title || ph.name)}</b><span>${esc(L.short || "")}</span><span class="num">${s.done} of ${s.total} steps</span><div class="progress"><i style="width:${s.pct * 100}%"></i></div></div></button>`;
}
function bindLessonLinks(root) { $$("[data-lesson]", root).forEach(b => b.onclick = () => go("lesson-" + b.dataset.lesson)); }
function stepCheck(t) { return `<button class="bigcheck ${t.status === "Complete" ? "on" : ""}" data-done="${t.id}" aria-pressed="${t.status === "Complete"}" aria-label="${t.status === "Complete" ? "Mark not done" : "Mark done"}: ${esc(t.title)}">${ic("tick")}</button>`; }
function bindStepChecks(root) {
  $$("[data-done]", root).forEach(b => b.onclick = async e => { e.stopPropagation(); const t = S.tasks[b.dataset.done]; const done = t.status === "Complete";
    const ok = await quickSet("tasks", t.id, done ? { status: "Not started", completedAt: "", approval: "Pending" } : { status: "Complete" }, done ? `${t.title}: marked not done` : `Nice work. “${t.title}” is done.`);
    if (ok && !done) { const ph = S.phases[t.phase]; if (ph && lessonState(ph) === "done") toast(`Part ${lessonIndex(ph.id) + 1} complete! On to the next one.`); } });
}

VIEWS.home = {
  render() {
    const m = meta(), prog = overallProgress(), nx = nextLesson(), nxi = lessonIndex(nx.id), pc = partCounts(), f = finance();
    const ts = sorted("tasks"), done = ts.filter(tasksDone).length, chk = sorted("checks"), gates = sorted("gates");
    const passed = chk.filter(c => c.result === "Pass").length + gates.filter(g => g.status === "Passed").length;
    const rec = recommendedTasks(5), act = sorted("activity").sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);
    return `${exampleBanner()}
    <section class="hero">
      <div class="hero-stats"><div class="ring" style="--p:${Math.round(prog * 100)}"><b>${pct(prog)}</b></div>restored</div>
      <div class="eyebrow">${esc(m.bike || "1977 Suzuki GS750")} · Restoration course</div>
      <h1>Let's bring this GS750 back to life</h1>
      <p>Work through the course one part at a time. Every step explains what to do and why, and the diagrams show you exactly what each part looks like and how it fits.</p>
      <div class="act"><button class="btn tan big" data-lesson="${nx.id}">${ic("play")} ${lessonState(nx) === "todo" && nxi === 0 ? "Start Part 1" : "Continue Part " + (nxi + 1)}: ${esc(LESSONS[nx.id]?.title || nx.name)}</button><button class="btn big" data-go="viewer">${ic("cube")} Explore the 3D bike</button></div>
      <img src="img/hero.svg" alt="Illustration of a 1977 Suzuki GS750" width="1050" height="570">
    </section>
    <div class="ph" style="display:none"></div>
    <section class="stack"><h2 class="sec">How it works</h2>
      <div class="steps3">
        <div class="step3"><span class="ico">${ic("book")}</span><span class="n">Step 1</span><h3>Follow the course</h3><p>Fourteen parts in order, from setting up the garage to the first ride. Each has clear steps and tips.</p><button class="btn sm" data-go="course">See the course</button></div>
        <div class="step3"><span class="ico">${ic("box")}</span><span class="n">Step 2</span><h3>Track every part</h3><p>Mark parts as you work on them. Red is untouched, amber is in progress, green is finished and checked.</p><button class="btn sm" data-go="inventory">See the parts</button></div>
        <div class="step3"><span class="ico">${ic("shield")}</span><span class="n">Step 3</span><h3>Pass the safety checks</h3><p>Brakes, tires, steering and more get checked and signed off before the bike goes on the road.</p><button class="btn sm" data-go="gates">See the checks</button></div>
      </div></section>
    <section class="stack"><h2 class="sec">Your course</h2><p class="sec-sub">Click any part to open it. The highlighted one is where you are now.</p>
      <div class="lessons">${sorted("phases").map((p, i) => lessonCard(p, i, p.id === nx.id)).join("")}</div></section>
    <section class="stack"><h2 class="sec">At a glance</h2>
      <div class="kpis">
        <button class="kpi green" data-go="inventory|${esc(JSON.stringify({ color: "green" }))}"><span class="l">Parts finished</span><span class="v">${pc.green} / ${pc.total}</span><span class="s">restored and checked</span></button>
        <button class="kpi" data-go="tasks"><span class="l">Steps done</span><span class="v">${done} / ${ts.length}</span><span class="s">across all 14 parts</span></button>
        <button class="kpi ${f.forecast > f.total ? "red" : ""}" data-go="budget"><span class="l">Money spent</span><span class="v">${money(f.paid)}</span><span class="s">of ${money(f.total)} budget</span></button>
        <button class="kpi" data-go="gates"><span class="l">Safety checks passed</span><span class="v">${passed} / ${chk.length + gates.length}</span><span class="s">${safetyUnresolved()} open safety issues</span></button>
      </div></section>
    <div class="grid g2" style="align-items:start">
      <div class="panel stack"><h2 class="sec left">Do these next</h2><p class="hint-text" style="text-align:left">These steps are ready: everything they depend on is done. Tick one off when it's finished.</p>
        ${rec.length ? `<div class="stepl">${rec.map(t => `<div class="st"><div class="st-h" data-open="tasks|${t.id}">${stepCheck(t)}<div class="st-t"><b>${esc(t.title)}</b><span>Part ${lessonIndex(t.phase) + 1} · ${esc(LESSONS[t.phase]?.title || "")}${t.safety === "Critical" ? " · safety-critical" : ""}</span></div>${ic("next")}</div></div>`).join("")}</div>` : `<div class="empty">Nothing is ready right now. Check the To-do list for blocked steps.</div>`}</div>
      <div class="panel stack"><h2 class="sec left">Recent activity</h2>${act.length ? `<div class="feed">${act.map(a => `<div><time>${fmtTime(a.ts)}</time><span><b>${esc(a.by)}</b> ${esc(a.summary)}${a.title && SCHEMA[a.coll] ? ` · ${esc(String(a.title).slice(0, 40))}` : ""}</span></div>`).join("")}</div>` : `<div class="empty">Changes by the team show up here.</div>`}</div>
    </div>
    <details class="more"><summary>Show all the numbers ${ic("chev")}</summary><div class="stack" style="margin-top:12px">${VIEWS.overview.render()}</div></details>`;
  },
  bind(root) { bindSetup(root); bindTables(root); bindLessonLinks(root); bindStepChecks(root); $("#qPhoto", root) && ($("#qPhoto", root).onclick = () => uploadPhotos({})); }
};

VIEWS.course = {
  render() {
    const phs = sorted("phases"), nx = nextLesson(), prog = overallProgress();
    return `${pageHead("course")}
    <div class="panel" style="max-width:940px;margin:0 auto;width:100%"><div class="row" style="justify-content:space-between"><b>Overall progress</b><b class="num">${pct(prog)}</b></div><div class="progress" style="margin-top:8px"><i style="width:${prog * 100}%"></i></div></div>
    <div class="timeline">${phs.map((p, i) => { const L = LESSONS[p.id] || {}, s = phaseStats(p), st = lessonState(p), isN = p.id === nx.id;
      return `<div class="tl" data-lesson="${p.id}" tabindex="0" role="button" aria-label="Open part ${i + 1}"><span class="tn ${st === "done" ? "done" : isN ? "next" : ""}">${st === "done" ? ic("tick").replace('stroke-width="1.7"', 'stroke-width="3" width="20" height="20"') : i + 1}</span><img src="img/${L.img}.svg" alt="" loading="lazy">
        <div class="tb"><div class="row"><span class="eyebrow">Part ${i + 1}</span>${isN ? pill("amber", "Up next") : statePill(st)}</div><b>${esc(L.title || p.name)}</b><p>${esc(L.short || "")}</p>
        <div class="meta"><span class="num">${s.done}/${s.total} steps</span><span>·</span><span>${s.ready} ready now</span>${s.deps.length ? `<span>·</span><span>Builds on Part ${s.deps.map(d => lessonIndex(d) + 1).join(", ")}</span>` : ""}</div>
        <div class="progress" style="height:6px"><i style="width:${s.pct * 100}%"></i></div></div></div>`; }).join("")}</div>
    <details class="more"><summary>How the parts connect ${ic("chev")}</summary><div class="panel stack" style="margin-top:10px"><p class="hint-text" style="text-align:center">Arrows show which parts need earlier work finished first. Parts without an arrow between them can happen at the same time.</p><div class="depgraph">${phaseGraph()}</div></div></details>`;
  },
  bind(root) { bindLessonLinks(root); $$(".tl", root).forEach(t => t.onkeydown = e => { if (e.key === "Enter") t.click(); }); $$("[data-ph]", root).forEach(g => g.onclick = () => go("lesson-" + g.dataset.ph)); }
};

const openSteps = new Set();
VIEWS.lesson = {
  render() {
    const phs = sorted("phases"), ph = S.phases[R.lesson] || phs[0]; if (!ph) return "";
    const i = lessonIndex(ph.id), L = LESSONS[ph.id] || {}, s = phaseStats(ph), prev = phs[i - 1], next = phs[i + 1];
    const tools = [...new Set(s.tasks.flatMap(t => String(t.tools || "").split(/[,;]/).map(x => x.trim()).filter(x => x && x.length < 40)))].slice(0, 16);
    const deps = s.deps.map(d => S.phases[d]).filter(Boolean);
    return `<div class="lhero"><div class="eyebrow">Part ${i + 1} of ${phs.length}</div><h1>${esc(L.title || ph.name)}</h1><p>${esc(L.short || "")}</p>
      <div class="row center" style="margin-top:12px">${statePill(lessonState(ph))}<span class="num muted">${s.done} of ${s.total} steps done</span></div>
      <div class="progress" style="width:min(420px,80%);margin:8px auto 0"><i style="width:${s.pct * 100}%"></i></div><div class="row center" style="margin-top:12px">${askBtn(`I'm on Part ${i + 1} of my GS750 restoration: ${L.title}. Give me a simple plan for this part.`, "Part " + (i + 1), "btn ask")}</div>
      <img src="img/${L.img}.svg" alt=""></div>
    <div class="ph" style="display:none"></div>
    <div class="lcol">
      <div class="why"><div class="panel"><h3>${ic("book")} What you'll do</h3><p>${esc(L.about || "")}</p></div><div class="panel"><h3>${ic("star")} Why it matters</h3><p>${esc(L.why || "")}</p></div></div>
      ${deps.length ? `<div class="banner ${deps.every(d => lessonState(d) === "done") ? "good" : ""}"><div class="grow"><b>Builds on:</b> ${deps.map(d => `<button class="btn sm" data-lesson="${d.id}">Part ${lessonIndex(d.id) + 1}: ${esc(LESSONS[d.id]?.title || d.name)} ${lessonState(d) === "done" ? "✓" : ""}</button>`).join(" ")}<div class="hint-text" style="margin-top:4px">You can look ahead any time. Steps that are still waiting on earlier work are marked below.</div></div></div>` : ""}
      ${tools.length ? `<div class="stack"><h2 class="sec">You'll need</h2><div class="toolchips">${tools.map(t => `<span>${esc(t)}</span>`).join("")}</div></div>` : ""}
      <div class="stack"><h2 class="sec">The steps</h2><p class="sec-sub">Each step shows how to do it. Tap a step for tools, parts and more. Tick the circle when it's done.</p>
        <div class="stepl">${s.tasks.map((t, k) => { const open = openSteps.has(t.id), wait = openPrereqs(t), pts = (t.partIds || []).map(id => S.parts[id]).filter(Boolean);
          return `<div class="st ${t.status === "Complete" ? "done" : ""} ${open ? "open" : ""}"><div class="st-h" data-toggle="${t.id}">${stepCheck(t)}<div class="st-t"><b>${k + 1}. ${esc(t.title)}</b><span>${t.status !== "Complete" && t.status !== "Not started" ? esc(t.status) + " · " : ""}${n(t.estHours) ? "about " + n(t.estHours) + " h" : ""}${t.safety === "Critical" ? " · safety-critical" : ""}${wait.length && t.status !== "Complete" ? " · waiting on " + wait.length + " earlier step" + (wait.length > 1 ? "s" : "") : ""}</span></div><svg class="st-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></div>
          ${howtoList(t)}
          ${open ? `<div class="st-b">${t.instructions ? `<div><div class="lbl">Workbook note</div><p>${esc(t.instructions)}</p></div>` : ""}
            ${t.reason ? `<div><div class="lbl">Why</div><p>${esc(t.reason)}</p></div>` : ""}
            ${t.expected ? `<div><div class="lbl">You're done when</div><p>${esc(t.expected)}</p></div>` : ""}
            ${t.tools ? `<div><div class="lbl">Tools & materials</div><p>${esc(t.tools)}</p></div>` : ""}
            ${t.manualRef ? `<div><div class="lbl">Manual reference</div><p>${specCell(t.manualRef)}</p></div>` : ""}
            ${wait.length ? `<div><div class="lbl">Finish these first</div><div class="row">${wait.map(id => `<button class="btn sm" data-open="tasks|${id}">${esc(S.tasks[id].title)}</button>`).join("")}</div></div>` : ""}
            ${pts.length ? `<div><div class="lbl">Parts involved</div><div class="row">${pts.map(p => `<button class="btn sm" data-open="parts|${p.id}"><i class="dot" style="background:${COL[partColor(p)]}"></i>${esc(p.name)}</button>`).join("")}</div></div>` : ""}
            <div class="row"><button class="btn sm" data-log="${t.id}">${ic("plus")} Log time</button><button class="btn sm" data-photo="${t.id}">${ic("image")} Add photo</button><button class="btn sm" data-open="tasks|${t.id}">Open full details</button>${askBtn(`Help me with this step of my GS750 restoration: "${t.title}". The instructions say: ${t.instructions}`, t.title)}</div></div>` : ""}</div>`; }).join("")}</div></div>
      <div class="panel stack"><h2 class="sec left" style="display:flex;gap:8px;align-items:center">${ic("warn")} Tips & safety</h2><ul class="tips">${(L.tips || []).map(x => `<li>${ic("bulb")}<span>${esc(x)}</span></li>`).join("")}</ul></div>
      ${L.focus ? `<div class="panel blue row center" style="text-align:center"><div class="stack" style="gap:4px;align-items:center"><b>See the diagram</b><span class="hint-text">Open the ${esc((PROTO.find(p => p[0] === L.focus) || [])[1] || "part")} diagram and take it apart on screen.</span></div><button class="btn pri" data-3d="${L.focus}">${ic("cube")} See diagram</button></div>` : ""}
      ${(L.shops || []).length ? `<div class="stack"><h2 class="sec">Where to get parts & help</h2><div class="shops">${L.shops.map(k => shopCard(k)).join("")}</div></div>` : ""}
      <div class="lnav">${prev ? `<button class="btn" data-lesson="${prev.id}">${ic("back")} Part ${i}: ${esc(LESSONS[prev.id]?.title || prev.name)}</button>` : "<span></span>"}${next ? `<button class="btn tan" data-lesson="${next.id}">Part ${i + 2}: ${esc(LESSONS[next.id]?.title || next.name)} ${ic("next")}</button>` : `<button class="btn tan" data-go="gates">Go to the safety checks ${ic("next")}</button>`}</div>
    </div>`;
  },
  bind(root) {
    bindTables(root); bindLessonLinks(root); bindStepChecks(root);
    $$("[data-toggle]", root).forEach(h => h.onclick = () => { const id = h.dataset.toggle; openSteps.has(id) ? openSteps.delete(id) : openSteps.add(id); render(false); });
    $$("[data-log]", root).forEach(b => b.onclick = () => openRecord("worklogs", null, { taskId: b.dataset.log }));
    $$("[data-photo]", root).forEach(b => b.onclick = () => uploadPhotos({ taskId: b.dataset.photo, kind: "During photo" }));
    $$("[data-3d]", root).forEach(b => b.onclick = () => openDiagramFor(b.dataset["3d"]));
  }
};
const shopCard = k => { const s = SHOPS[k]; if (!s) return ""; return `<div class="shop"><span class="sico">${esc(s.name.replace(/^The /, "").slice(0, 2))}</span><b>${esc(s.name)}</b><p>${esc(s.what)}</p><div class="tags">${(s.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div><a class="btn sm" href="${esc(s.url)}" target="_blank" rel="noopener">Visit site ${ic("ext")}</a></div>`; };
VIEWS.shops = {
  render() {
    return `${pageHead("shops")}
    <div class="stack"><h2 class="sec">Parts diagrams & original parts</h2><div class="shops">${["cmsnl", "partzilla", "ebay"].map(shopCard).join("")}</div></div>
    <div class="stack"><h2 class="sec">Rebuild parts by system</h2><div class="shops">${["z1", "sudco", "ricks", "allballs", "revzilla", "denniskirk", "caswell", "por15"].map(shopCard).join("")}</div></div>
    <div class="stack"><h2 class="sec">Manuals & help</h2><div class="shops">${["manuals", "gsr"].map(shopCard).join("")}</div></div>
    <div class="stack"><h2 class="sec">Smart buying tips</h2><div class="grid g3">${SUGGESTIONS.map(([t, d]) => `<div class="panel stack" style="text-align:center;gap:6px"><b>${esc(t)}</b><span class="muted" style="font-size:14px">${esc(d)}</span></div>`).join("")}</div></div>
    <p class="hint-text" style="text-align:center">These are independent shops and communities, listed to help you find parts. Check each listing's fitment for your exact model before buying.</p>`;
  }
};

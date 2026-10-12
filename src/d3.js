/* ============ 3D illustrated parts viewer ============
   Renders a D3_MODELS entry (mechanical data in d3_*.js) with Three.js as real 3D meshes, drawn in the
   style of an OEM exploded-parts illustration: fine outlines, crease lines, restrained shading on white.
   Every part has an installed (A) and exploded (E) transform; the timeline T runs 0 (exploded) .. S (assembled)
   and every position is computed from T, so assembling/exploding any number of times lands in the same place. */
const D3 = { mode: {}, st: null };
const d3On = d => !!(D3_MODELS[d.id] && D3.mode[d.id] !== "2d" && window.THREE && THREE.OrbitControls && THREE.BufferGeometryUtils && (typeof webglOK !== "function" || webglOK()));
const D3_MATS = {
  chrome: { c: "#c9d0d5", m: .7, r: .32 }, alu: { c: "#b9b8b0", m: .35, r: .58 }, steel: { c: "#a9aeb3", m: .55, r: .45 }, zinc: { c: "#cbc3a6", m: .5, r: .45 },
  spring: { c: "#7f868c", m: .5, r: .48 }, rubber: { c: "#3c3e41", m: 0, r: .85 }, brass: { c: "#c8a65d", m: .55, r: .42 }, black: { c: "#404347", m: .3, r: .55 }, dark: { c: "#5a5e63", m: .4, r: .5 },
};

/* ---------- geometry builders (one per geom.type in the data) ---------- */
function d3Lathe(pts, seg = 56, phi = Math.PI * 2) {
  const T = THREE, P = pts.slice(); if (P[0][0] !== P[P.length - 1][0] || P[0][1] !== P[P.length - 1][1]) P.push(P[0]);
  // one lathe per profile segment keeps sharp shading at the profile corners
  const parts = []; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; if (a[0] === 0 && b[0] === 0) continue; if (a[0] === b[0] && a[1] === b[1]) continue;
    parts.push(new T.LatheGeometry([new T.Vector2(a[0], a[1]), new T.Vector2(b[0], b[1])], seg, 0, phi)); }
  return T.BufferGeometryUtils.mergeBufferGeometries(parts.map(g => g.toNonIndexed()));
}
function d3Helix(R, wire, h, turns) {
  const T = THREE; class Helix extends T.Curve { getPoint(t, o = new T.Vector3()) { const a = t * turns * Math.PI * 2; return o.set(Math.cos(a) * R, wire / 2 + t * (h - wire), Math.sin(a) * R); } }
  return new T.TubeGeometry(new Helix(), Math.max(60, Math.round(turns * 28)), wire / 2, 10, false);
}
function d3Shape(pts, notch) {
  const T = THREE, out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length]; out.push(a);
    if (notch && a[1] === notch.y && b[1] === notch.y && Math.min(a[0], b[0]) < notch.z - notch.r && Math.max(a[0], b[0]) > notch.z + notch.r) {
      const sgn = notch.up ? -1 : 1, dirz = Math.sign(b[0] - a[0]);
      for (let k = 0; k <= 16; k++) { const ang = Math.PI * k / 16, z = notch.z - dirz * notch.r * Math.cos(ang); out.push([z, notch.y + sgn * notch.r * Math.sin(ang)]); }
    }
  }
  const s = new T.Shape(); out.forEach(([z, y], i) => i ? s.lineTo(z, y) : s.moveTo(z, y)); s.closePath(); return s;
}
function d3Geo(g) { // -> [{ geo, mat? }]
  const T = THREE;
  switch (g.type) {
    case "group": return g.items.flatMap(d3Geo);
    case "lathe": return [{ geo: d3Lathe(g.pts) }];
    case "ring": return [{ geo: d3Lathe([[g.ri, 0], [g.ro, 0], [g.ro, g.h], [g.ri, g.h]], 48, 0, g.split ? Math.PI * 2 - .3 : Math.PI * 2) }];
    case "ringX": { const geo = d3Lathe([[g.ri, 0], [g.ro, 0], [g.ro, g.h], [g.ri, g.h]], 40); geo.rotateZ(-Math.PI / 2); return [{ geo }]; }
    case "torus": { const geo = new T.TorusGeometry(g.R, g.r, 12, 64); geo.rotateX(Math.PI / 2); return [{ geo }]; }
    case "clip": { const geo = new T.TorusGeometry(g.R, g.r, 10, 64, Math.PI * 2 - g.gap); geo.rotateX(Math.PI / 2); return [{ geo }]; }
    case "spring": return [{ geo: d3Helix(g.R, g.wire, g.h, g.turns) }];
    case "bellows": { const p = [[g.rIn, 0]]; for (let i = 0; i <= g.n * 2; i++) p.push([i % 2 ? g.r2 : g.r1, i * g.h / (g.n * 2)]); p.push([g.rIn, g.h]); return [{ geo: d3Lathe(p, 56) }]; }
    case "hex": { const r = g.af / Math.sqrt(3), s = new T.Shape(); for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      if (g.hole) { const h = new T.Path(); h.absarc(0, 0, g.hole, 0, Math.PI * 2, true); s.holes.push(h); }
      const geo = new T.ExtrudeGeometry(s, { depth: g.h, bevelEnabled: true, bevelThickness: .5, bevelSize: .5, bevelSegments: 1, curveSegments: 24 }); geo.rotateX(-Math.PI / 2); geo.translate(0, (g.y || 0), 0); return [{ geo }]; }
    case "socket": { const geo = new T.CylinderGeometry(g.af / Math.sqrt(3), g.af / Math.sqrt(3), .6, 6); geo.translate(0, g.y - .25, 0); return [{ geo, mat: "black" }]; }
    case "holes": return g.y.map(y => { const geo = new T.CylinderGeometry(g.d / 2, g.d / 2, 1, 16); geo.rotateZ(Math.PI / 2); geo.translate(g.r - .3, y, 0); return { geo, mat: "black" }; });
    case "screwX": { const geo = d3Lathe([[0, -g.head], [g.headR, -g.head], [g.headR, 0], [g.r, 0], [g.r, g.len], [0, g.len]], 32); geo.rotateZ(-Math.PI / 2); return [{ geo }]; }
    case "lug": { const geo = new T.ExtrudeGeometry(d3Shape(g.zy, g.notch), { depth: g.x[1] - g.x[0], bevelEnabled: true, bevelThickness: .8, bevelSize: .8, bevelSegments: 2, curveSegments: 12 }); geo.rotateY(-Math.PI / 2); geo.translate(g.x[1], 0, 0); return [{ geo }]; }
    case "pair": return g.at.flatMap(o => d3Geo(g.item).map(x => { x.geo = x.geo.clone(); x.geo.translate(o[0], o[1], o[2]); return x; }));
  }
  return [];
}

/* ---------- technical-illustration materials: shaded body + screen-space outline + crease lines ---------- */
function d3OutlineMat(px, color) {
  return new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { px: { value: px }, col: { value: new THREE.Color(color) }, res: { value: new THREE.Vector2(1, 1) } },
    vertexShader: "uniform float px; uniform vec2 res; void main(){ vec4 c = projectionMatrix * modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * normal); vec2 d = length(n.xy) > 1e-4 ? normalize(n.xy) : vec2(0.0); c.xy += d * px * 2.0 * c.w / res; gl_Position = c; }",
    fragmentShader: "uniform vec3 col; void main(){ gl_FragColor = vec4(col, 1.0); }" });
}
function d3Build(model) {
  const T = THREE, root = new T.Group(), parts = new Map();
  model.parts.forEach(pd => {
    const node = new T.Group(); node.userData.pid = pd.id; const meshes = [], hulls = [];
    d3Geo(pd.geom).forEach(({ geo, mat }) => {
      const mk = D3_MATS[mat || pd.mat] || D3_MATS.steel;
      const m = new T.MeshStandardMaterial({ color: mk.c, metalness: mk.m, roughness: mk.r, envMapIntensity: .38 });
      const mesh = new T.Mesh(geo, m); mesh.userData.pid = pd.id; node.add(mesh); meshes.push(mesh);
      const hull = new T.Mesh(geo, d3OutlineMat(1.15, "#2a2e32")); hull.userData.skip = true; hull.renderOrder = -1; node.add(hull); hulls.push(hull);
      const edges = new T.LineSegments(new T.EdgesGeometry(geo, 32), new T.LineBasicMaterial({ color: "#2e3236", transparent: true, opacity: .42 })); edges.userData.skip = true; node.add(edges);
    });
    root.add(node); parts.set(pd.id, { d: pd, node, meshes, hulls, A: new T.Vector3(...pd.A), E: new T.Vector3(...pd.E), u: new T.Vector3(...(pd.dir || [0, -1, 0])).normalize() });
  });
  return { root, parts, S: model.stages.length };
}

/* ---------- deterministic timeline: position of every part at T ---------- */
const d3Ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function d3Progress(st, p) { if (!p.d.stage) return 1; if (st.force.has(p.d.id)) return 1; return Math.min(1, Math.max(0, st.T - (p.d.stage - 1))); }
function d3PosAt(st, id, memo) {
  if (memo.has(id)) return memo.get(id);
  const T = THREE, p = st.m.parts.get(id), par = p.d.parent && st.m.parts.get(p.d.parent);
  const target = par ? d3PosAt(st, par.d.id, memo).clone().add(p.A.clone().sub(par.A)) : p.A.clone();
  const k = d3Progress(st, p); let pos;
  if (k >= 1) pos = target; else if (k <= 0) pos = p.E.clone();
  else { // slide over to the line of the installing move, then straight in along it
    const D = Math.max(40, target.clone().sub(p.E).dot(p.u)), W = target.clone().sub(p.u.clone().multiplyScalar(D));
    pos = k < .5 ? p.E.clone().lerp(W, d3Ease(k / .5)) : W.lerp(target, d3Ease((k - .5) / .5)); }
  memo.set(id, pos); return pos;
}
function d3Apply(st) { const memo = new Map(); st.m.parts.forEach((p, id) => p.node.position.copy(d3PosAt(st, id, memo))); st.need = true; st.lbl = true; }

/* ---------- page ---------- */
function d3PageHtml(d) {
  const m = D3_MODELS[d.id], st = D3.st && D3.st.id === d.id ? D3.st : null, o = st ? st.opt : D3_OPT0();
  const tg = (k, l) => `<label class="dchk"><input type="checkbox" data-d3t="${k}" ${o[k] ? "checked" : ""}> ${l}</label>`;
  return `<div class="dhead"><button class="linkbtn" data-diagback>${ic("back")} All diagrams</button><div class="dtitle"><span class="mono">${esc(d.fig || "")}</span><h1>${esc(d.title)}</h1><span class="vpill v-schematic" title="${esc(m.accuracy)}">Approximate geometry</span></div>
      <div class="seg"><button class="on" data-d3mode="3d">3D model</button><button data-d3mode="2d">2D drawing</button></div></div>
    <div class="d3wrap ${o.list ? "" : "nolist"}">
      <div class="d3main">
        <div class="dtools d3tools" role="toolbar" aria-label="3D parts viewer">
          <span class="dt-g"><button class="tb" data-d3go="0">Explode</button><button class="tb" data-d3go="S">Assemble</button><button class="tb" id="d3Play" aria-label="Play">Play</button></span>
          <span class="dt-g"><button class="tb" id="d3Prev" title="Step back">${ic("back")}</button><input type="range" id="d3T" min="0" max="${m.stages.length}" step="0.001" value="${st ? st.T : 0}" aria-label="Assembly timeline"><button class="tb" id="d3Next" title="Step forward">${ic("next")}</button></span>
          <span class="dt-g"><button class="tb" data-d3v="iso">Iso</button><button class="tb" data-d3v="front">Front</button><button class="tb" data-d3v="side">Side</button><button class="tb" data-d3v="fit">Fit</button><button class="tb" id="d3Reset">Reset</button></span>
          <span class="dt-g">${tg("nums", "Part numbers")}${tg("names", "Names")}${tg("leaders", "Leader lines")}${tg("small", "Small hardware")}${tg("xray", "See through")}${tg("list", "Parts list")}</span>
        </div>
        <div class="d3stage" id="d3stage"><div class="d3lab" id="d3lab"></div><svg class="d3lead" id="d3lead"></svg><div class="d3cap" id="d3cap"></div><div class="d3tip" id="d3tip" hidden></div></div>
        <p class="hint-text" style="text-align:left;margin:6px 0 0">Drag to rotate, scroll to zoom, right-drag to pan. Click a part or a list entry to select it. ${esc(m.accuracy)} <a href="${esc(CMS + m.page + ".html")}" target="_blank" rel="noopener">Compare with the CMSNL picture</a>.</p>
      </div>
      <aside class="d3side"><div class="tcard stack d3info" id="d3info"></div><div class="tcard stack d3list" id="d3list"></div></aside>
    </div>`;
}
const D3_OPT0 = () => ({ nums: true, names: false, leaders: true, small: true, xray: false, list: true });
function d3Teardown() { const st = D3.st; if (!st) return; cancelAnimationFrame(st.raf); st.ro && st.ro.disconnect(); st.ctl && st.ctl.dispose(); if (st.rend) { st.rend.dispose(); st.rend.forceContextLoss && st.rend.forceContextLoss(); } st.dead = true; D3.st = null; }
function d3Bind(root, d) {
  const T = THREE, model = D3_MODELS[d.id], stage = $("#d3stage", root);
  const keep = D3.st && D3.st.id === d.id && !D3.st.dead ? D3.st : null; if (D3.st) d3Teardown();
  const st = D3.st = { id: d.id, model, T: keep ? keep.T : 0, goal: null, playing: false, sel: keep ? keep.sel : null, hidden: keep ? keep.hidden : new Set(), iso: keep ? keep.iso : null, force: keep ? keep.force : new Set(), opt: keep ? keep.opt : D3_OPT0(), need: true, lbl: true };
  const w = stage.clientWidth, h = stage.clientHeight;
  st.rend = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: !!window.__shotMode }); st.rend.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); st.rend.setSize(w, h);
  st.rend.outputEncoding = T.sRGBEncoding; st.rend.toneMapping = T.ACESFilmicToneMapping; st.rend.toneMappingExposure = .92; st.rend.setClearColor(0xffffff, 1); stage.prepend(st.rend.domElement);
  st.rend.domElement.setAttribute("aria-label", `3D model: ${d.title}. Drag to rotate, scroll to zoom, right-drag to pan.`);
  st.scene = new T.Scene(); const pm = new T.PMREMGenerator(st.rend); st.scene.environment = pm.fromScene(new T.RoomEnvironment(), .04).texture;
  st.scene.add(new T.HemisphereLight(0xffffff, 0xb8c0c6, .5));
  const key = new T.DirectionalLight(0xffffff, 1.25); key.position.set(-1.2, 2.4, 1.6); st.scene.add(key);
  const fill = new T.DirectionalLight(0xffffff, .22); fill.position.set(1.6, .4, -1.2); st.scene.add(fill);
  st.m = d3Build(model); st.scene.add(st.m.root);
  st.cam = new T.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
  st.ctl = new T.OrbitControls(st.cam, st.rend.domElement); Object.assign(st.ctl, { enableDamping: true, dampingFactor: .1, screenSpacePanning: true, rotateSpeed: .7, zoomSpeed: 1.1 });
  st.ctl.addEventListener("change", () => { st.need = true; st.lbl = true; }); st.ctl.addEventListener("start", () => { st.userCam = true; });
  d3Apply(st); d3View(st, "iso");
  const resize = () => { const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return; st.rend.setSize(W, H); d3Frustum(st); st.m.parts.forEach(p => p.hulls.forEach(hh => hh.material.uniforms.res.value.set(W, H))); st.need = true; st.lbl = true; };
  st.ro = new ResizeObserver(resize); st.ro.observe(stage); resize();
  // picking
  const ray = new T.Raycaster(), ptr = new T.Vector2(); let down = null;
  const pick = e => { const r = st.rend.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, st.cam);
    const meshes = []; st.m.parts.forEach(p => { if (p.node.visible) meshes.push(...p.meshes); }); const hit = ray.intersectObjects(meshes, false)[0]; return hit ? hit.object.userData.pid : null; };
  const cv = st.rend.domElement, tip = $("#d3tip", stage);
  cv.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; });
  cv.addEventListener("pointerup", e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; d3Select(st, pick(e)); });
  cv.addEventListener("pointermove", e => { if (e.buttons) { tip.hidden = true; return; } const id = pick(e); if (id !== st.hover) { st.hover = id; st.need = true; d3Paint(st); }
    if (id) { const p = st.m.parts.get(id); tip.hidden = false; tip.textContent = `${p.d.ref} · ${p.d.name}`; const r = stage.getBoundingClientRect(); tip.style.left = (e.clientX - r.left + 14) + "px"; tip.style.top = (e.clientY - r.top + 10) + "px"; cv.style.cursor = "pointer"; }
    else { tip.hidden = true; cv.style.cursor = ""; } });
  cv.addEventListener("pointerleave", () => { tip.hidden = true; st.hover = null; d3Paint(st); });
  // controls
  const slider = $("#d3T", root), play = $("#d3Play", root), S = model.stages.length;
  const setT = (v, fromSlider) => { st.T = Math.min(S, Math.max(0, v)); if (!fromSlider) slider.value = st.T; d3Apply(st); d3Caption(st); };
  st.setT = setT;
  slider.oninput = () => { st.playing = false; st.goal = null; play.textContent = "Play"; setT(+slider.value, true); };
  $$("[data-d3go]", root).forEach(b => b.onclick = () => { st.goal = b.dataset.d3go === "S" ? S : 0; st.playing = true; play.textContent = "Pause"; });
  play.onclick = () => { if (st.playing) { st.playing = false; play.textContent = "Play"; return; } if (st.goal == null || Math.abs(st.T - st.goal) < 1e-3) st.goal = st.T >= S - 1e-3 ? 0 : S; st.playing = true; play.textContent = "Pause"; };
  $("#d3Next", root).onclick = () => { st.playing = true; st.goal = Math.min(S, Math.floor(st.T + 1e-3) + 1); play.textContent = "Pause"; };
  $("#d3Prev", root).onclick = () => { st.playing = true; st.goal = Math.max(0, Math.ceil(st.T - 1e-3) - 1); play.textContent = "Pause"; };
  $("#d3Reset", root).onclick = () => { st.userCam = false; st.playing = false; st.goal = null; play.textContent = "Play"; st.sel = null; st.iso = null; st.hidden.clear(); st.force.clear(); setT(0); d3View(st, "iso"); d3Paint(st); d3Side(st); };
  $$("[data-d3v]", root).forEach(b => b.onclick = () => d3View(st, b.dataset.d3v));
  $$("[data-d3t]", root).forEach(c => c.onchange = () => { st.opt[c.dataset.d3t] = c.checked; if (c.dataset.d3t === "list") root.querySelector(".d3wrap").classList.toggle("nolist", !c.checked); d3Paint(st); d3Side(st); st.lbl = true; st.need = true; });
  $$("[data-d3mode]", root).forEach(b => b.onclick = () => { D3.mode[d.id] = b.dataset.d3mode; d3Teardown(); render(true); });
  d3Paint(st); d3Side(st); d3Caption(st);
  let last = performance.now();
  const loop = now => { if (st.dead) return; st.raf = requestAnimationFrame(loop); const dt = Math.min(.25, (now - last) / 1000); last = now;
    if (st.playing && st.goal != null) { const step = dt / .9, diff = st.goal - st.T; if (Math.abs(diff) <= step) { setT(st.goal); st.playing = false; play.textContent = "Play"; if (!st.userCam) d3View(st, "fit"); } else setT(st.T + Math.sign(diff) * step); }
    st.ctl.update();
    if (st.need) { st.need = false; st.rend.render(st.scene, st.cam); }
    if (st.lbl) { st.lbl = false; d3Labels(st); } };
  st.raf = requestAnimationFrame(loop);
}
function d3Frustum(st) { const el = st.rend.domElement, W = el.clientWidth || 800, H = el.clientHeight || 600, a = W / H, s = st.half || 400; Object.assign(st.cam, { left: -s * a, right: s * a, top: s, bottom: -s }); st.cam.updateProjectionMatrix(); }
function d3Bounds(st) { const b = new THREE.Box3(); st.m.parts.forEach(p => { if (p.node.visible) b.expandByObject(p.node); }); return b; }
function d3View(st, v, saved) {
  const T = THREE, b = d3Bounds(st), c = b.getCenter(new T.Vector3()), size = b.getSize(new T.Vector3());
  const dir = v === "front" ? new T.Vector3(0, .05, 1) : v === "side" ? new T.Vector3(1, .05, 0) : v === "fit" ? st.cam.position.clone().sub(st.ctl.target).normalize() : new T.Vector3(...st.model.view.dir).normalize();
  st.half = Math.max(size.y * .56, Math.max(size.x, size.z) * .5 / ((st.rend.domElement.clientWidth || 800) / (st.rend.domElement.clientHeight || 600)), 60);
  st.cam.zoom = 1; st.cam.position.copy(c.clone().add(dir.multiplyScalar(2000))); st.cam.up.set(0, 1, 0); st.ctl.target.copy(c); st.cam.lookAt(c); d3Frustum(st); st.ctl.update(); st.need = true; st.lbl = true;
}
function d3Caption(st) { const cap = $("#d3cap"); if (!cap) return; const S = st.model.stages.length, i = Math.min(S - 1, Math.floor(st.T + 1e-6));
  cap.innerHTML = st.T <= 1e-3 ? `<b>Exploded</b> · ${S} assembly stages` : st.T >= S - 1e-3 ? `<b>Assembled</b>` : `<b>Stage ${i + 1} of ${S}:</b> ${esc(st.model.stages[i].t)}<small>${esc(st.model.stages[i].d)}</small>`; }
/* visibility, selection colours, outlines */
function d3Paint(st) {
  st.m.parts.forEach((p, id) => {
    const vis = !st.hidden.has(id) && (st.opt.small || !p.d.small) && (!st.iso || st.iso === id);
    p.node.visible = vis; const on = st.sel === id, hv = st.hover === id && !on;
    const ghost = st.opt.xray && p.d.shell && !on;
    p.meshes.forEach(m => { m.material.emissive.set(on ? "#1d6aa5" : hv ? "#4d8fbf" : "#000000"); m.material.emissiveIntensity = on ? .45 : hv ? .25 : 0; m.material.transparent = ghost; m.material.opacity = ghost ? .18 : 1; m.material.depthWrite = !ghost; m.material.needsUpdate = true; });
    p.hulls.forEach(hh => { hh.visible = !ghost; hh.material.uniforms.col.value.set(on ? "#1d6aa5" : "#2a2e32"); hh.material.uniforms.px.value = on ? 2.2 : 1.15; });
    p.node.children.forEach(c => { if (c.isLineSegments) c.material.opacity = ghost ? .22 : .42; });
  });
  st.need = true; st.lbl = true;
}
function d3Select(st, id) { st.sel = id && st.sel === id ? null : id; d3Paint(st); d3Side(st); const row = id && document.querySelector(`#d3list [data-d3p="${id}"]`); if (row) row.scrollIntoView({ block: "nearest" }); }
/* side panel: selected part + parts list (synchronised with the 3D selection) */
function d3Pn(st, ref) { const pg = typeof CMS_PAGES !== "undefined" && CMS_PAGES[st.id]; return pg ? cmsCurrent(pg.rows, ref) : null; }
function d3Cat(st, ref) { const pg = typeof CMS_PAGES !== "undefined" && CMS_PAGES[st.id]; return pg ? [...new Set(pg.rows.filter(r => cmsBase(r[0]) === String(ref)).map(r => r[2]))].join(" / ") : ""; }
function d3Side(st) {
  const info = $("#d3info"), list = $("#d3list"); if (!info || !list) return;
  const p = st.sel && st.m.parts.get(st.sel);
  info.innerHTML = p ? `<span class="eyebrow">Catalogue ref ${esc(p.d.ref)}</span><h2 class="vtitle">${esc(p.d.name)}</h2>
      <dl class="kv"><dt>Suzuki part no.</dt><dd><code>${esc(fmtPn(d3Pn(st, p.d.ref)) || "—")}</code></dd><dt>Catalogue name</dt><dd>${esc(d3Cat(st, p.d.ref) || "—")}</dd><dt>Quantity</dt><dd>${p.d.count ? p.d.count + " shown per leg. " : ""}CMSNL doesn't list quantities.</dd><dt>Reference</dt><dd><a href="${esc(CMS + st.model.page + ".html")}" target="_blank" rel="noopener">CMSNL ${esc(st.model.page)}, ref ${esc(p.d.ref)}</a></dd><dt>Fits on</dt><dd>Stage ${p.d.stage || "—"}${p.d.stage ? ": " + esc(st.model.stages[p.d.stage - 1].t) : " (the base part)"}</dd></dl>
      <div class="row"><button class="btn sm" data-d3a="iso">${st.iso === p.d.id ? "Show all parts" : "Isolate"}</button><button class="btn sm" data-d3a="hide">${st.hidden.has(p.d.id) ? "Show" : "Hide"}</button>${p.d.stage ? `<button class="btn sm" data-d3a="seat">${st.force.has(p.d.id) ? "Back to the timeline" : "Show it fitted"}</button>` : ""}<button class="btn sm" data-d3a="desel">Clear</button></div>
      <div class="row">${askBtn(`On my 1977 GS750 front fork, tell me about the ${p.d.name} (catalogue ref ${p.d.ref}): what it does, how it comes out and goes back in, and what wear to look for.`, p.d.name)}</div>`
    : `<span class="eyebrow">Parts viewer</span><p class="hint-text" style="text-align:left;margin:0">Click a part in the model or in the list to see its Suzuki part number, where it fits and what it's called in the catalogue.</p>`;
  $$("[data-d3a]", info).forEach(b => b.onclick = () => { const a = b.dataset.d3a, id = st.sel;
    if (a === "iso") st.iso = st.iso === id ? null : id; else if (a === "hide") { st.hidden.has(id) ? st.hidden.delete(id) : st.hidden.add(id); } else if (a === "seat") { st.force.has(id) ? st.force.delete(id) : st.force.add(id); d3Apply(st); } else if (a === "desel") st.sel = null;
    d3Paint(st); d3Side(st); });
  const rows = st.model.parts.slice().sort((a, b) => (+a.ref || 0) - (+b.ref || 0));
  list.innerHTML = `<h3 class="vh">Parts list (${rows.length})</h3>${st.model.notModelled ? `<p class="hint-text" style="text-align:left;margin:0">${esc(st.model.notModelled)}</p>` : ""}<div class="d3rows">${rows.map(pd => `<div class="d3row ${st.sel === pd.id ? "on" : ""} ${st.hidden.has(pd.id) || (!st.opt.small && pd.small) ? "off" : ""}" data-d3p="${pd.id}"><b>${esc(pd.ref)}</b><span>${esc(pd.name)}${pd.count ? ` <small>×${pd.count}</small>` : ""}</span><code>${esc(fmtPn(d3Pn(st, pd.ref)) || "")}</code><button class="d3eye" data-d3h="${pd.id}" aria-label="${st.hidden.has(pd.id) ? "Show" : "Hide"} ${esc(pd.name)}">${ic(st.hidden.has(pd.id) ? "x" : "eye")}</button></div>`).join("")}</div>`;
  $$("[data-d3p]", list).forEach(r => r.onclick = e => { if (e.target.closest("[data-d3h]")) return; d3Select(st, r.dataset.d3p); });
  $$("[data-d3h]", list).forEach(b => b.onclick = () => { const id = b.dataset.d3h; st.hidden.has(id) ? st.hidden.delete(id) : st.hidden.add(id); d3Paint(st); d3Side(st); });
}
/* HTML labels with SVG leader lines, re-laid out whenever the camera or the timeline moves */
function d3Labels(st) {
  const lab = $("#d3lab"), svg = $("#d3lead"); if (!lab || !svg) return;
  const o = st.opt, el = st.rend.domElement, W = el.clientWidth, H = el.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  if (!o.nums && !o.names) { lab.innerHTML = ""; svg.innerHTML = ""; return; }
  const T = THREE, pts = [];
  st.m.parts.forEach((p, id) => { if (!p.node.visible) return; const b = new T.Box3().setFromObject(p.node), c = b.getCenter(new T.Vector3()).project(st.cam);
    const x = (c.x + 1) / 2 * W, y = (1 - c.y) / 2 * H; if (x < -40 || x > W + 40 || y < -40 || y > H + 40) return; pts.push({ id, p, ax: x, ay: y }); });
  if (!pts.length) { lab.innerHTML = ""; svg.innerHTML = ""; return; }
  const cx = pts.reduce((s, q) => s + q.ax, 0) / pts.length;
  const lh = o.names ? 22 : 24, gap = 70;
  ["L", "R"].forEach(side => {
    const g = pts.filter(q => side === "L" ? q.ax < cx : q.ax >= cx).sort((a, b) => a.ay - b.ay);
    let y0 = -1e9; g.forEach(q => { q.side = side; q.ly = Math.max(q.ay, y0 + lh); y0 = q.ly; });
    const over = g.length ? Math.max(0, g[g.length - 1].ly - (H - 16)) : 0; if (over) { g.forEach(q => q.ly -= over); let y1 = 1e9; g.slice().reverse().forEach(q => { q.ly = Math.min(q.ly, y1 - lh); y1 = q.ly; }); }
    const xs = side === "L" ? Math.min(...g.map(q => q.ax)) - gap : Math.max(...g.map(q => q.ax)) + gap;
    g.forEach(q => { q.lx = side === "L" ? Math.max(8, xs) : Math.min(W - 8, xs); });
  });
  lab.innerHTML = pts.map(q => `<button class="d3l ${q.side} ${st.sel === q.id ? "on" : ""}" data-d3p="${q.id}" style="${q.side === "L" ? `right:${(W - q.lx).toFixed(1)}px` : `left:${q.lx.toFixed(1)}px`};top:${q.ly.toFixed(1)}px">${o.nums ? `<i>${esc(q.p.d.ref)}</i>` : ""}${o.names ? `<span>${esc(q.p.d.name)}</span>` : ""}</button>`).join("");
  svg.innerHTML = o.leaders ? pts.map(q => `<line x1="${q.lx.toFixed(1)}" y1="${q.ly.toFixed(1)}" x2="${q.ax.toFixed(1)}" y2="${q.ay.toFixed(1)}" class="${st.sel === q.id ? "on" : ""}"/><circle cx="${q.ax.toFixed(1)}" cy="${q.ay.toFixed(1)}" r="2.2" class="${st.sel === q.id ? "on" : ""}"/>`).join("") : "";
  $$("[data-d3p]", lab).forEach(b => b.onclick = () => d3Select(st, b.dataset.d3p));
}

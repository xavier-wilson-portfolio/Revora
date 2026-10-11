/* ============ GS750 digital twin: scene, hierarchy, selection, visibility, animation ============
   Modules in this file (kept as separate sections, each with one job):
   1. Animation controller   2. Node registry & hierarchy build   3. Hardware instancing
   4. Look manager (materials: status, ghost, fade, highlight, technical)   5. Displacement & visibility manager
   6. Explode / isolate / clearance / internals   7. Lighting & quality   8. Scene init, picking, camera   */
const TW = { ok: false, nodes: new Map(), byObj: new Map(), sel: null, hover: null, level: 3, ctx: null, hidden: new Set(), ghosts: new Set(), moved: new Set(),
  isolated: null, internalsOn: null, cleared: null, explodeNode: null, explodeK: 0, explodeStep: null, light: "studio", quality: "high", labels: false, tech: false, nav: "orbit",
  fasteners: true, statusMode: false, filter: "", sysFilter: "", speed: 1, paused: false, need: true, anims: [], clock: 0, built: false };
const V = TW; // older code paths look for V.*

/* ---------- 1. animation controller (virtual clock: pause, resume, speed) ---------- */
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function anim(ms, fn, done, tag) {
  if (tag) TW.anims = TW.anims.filter(a => { if (a.tag === tag) { a.fn(1); return false; } return true; });
  const a = { t0: TW.clock, dur: Math.max(1, ms), fn, done, tag }; TW.anims.push(a); TW.need = true; return a;
}
function stepAnims(dtMs) {
  if (!TW.paused) TW.clock += dtMs * TW.speed;
  if (!TW.anims.length) return false;
  const list = TW.anims, keep = []; TW.anims = [];
  for (const a of list) { const k = Math.min(1, (TW.clock - a.t0) / a.dur); a.fn(easeIO(Math.max(0, k))); if (k >= 1) a.done && a.done(); else keep.push(a); }
  TW.anims = keep.concat(TW.anims); TW.need = true; return true;
}
function finishAnims() { const list = TW.anims; TW.anims = []; list.forEach(a => { a.fn(1); a.done && a.done(); }); TW.need = true; }

/* ---------- 2. node registry ---------- */
const slug = s => String(s).toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "part";
const HW_RE = /(bolt|nut\b|screw|nipple|drain plug|washer|circlip)/i, HW_NOT = /plug cap|plug lead/i;
function mkNode(o) {
  const n = Object.assign({ children: [], hidden: false, offset: null, internal: false }, o);
  if (TW.nodes.has(n.id)) { let i = 2; while (TW.nodes.has(n.id + "-" + i)) i++; n.id += "-" + i; }
  TW.nodes.set(n.id, n); if (n.parent) n.parent.children.push(n); if (n.obj) TW.byObj.set(n.obj, n); return n;
}
const nodeAncestors = n => { const a = []; for (let x = n; x; x = x.parent) a.unshift(x); return a; };
const nodeDesc = n => { const a = [n]; n.children.forEach(c => a.push(...nodeDesc(c))); return a; };
const nodeMeshes = n => { const out = []; nodeDesc(n).forEach(d => { if (d.obj && d.obj.isMesh) out.push(d.obj); }); return out; };
const nodeAssy = n => { for (let x = n; x; x = x.parent) if (x.kind === "assembly") return x; return null; };
const nodePart = n => { for (let x = n; x; x = x.parent) if (x.partId) return x.partId; return null; };
const levelName = l => ["", "Motorcycle", "System", "Assembly", "Component", "Part / hardware"][l] || "Part";

function buildHierarchy(bike) {
  const T = THREE; TW.nodes.clear(); TW.byObj.clear();
  const root = new T.Group(); root.name = "Motorcycle"; TW.root = root;
  const bikeNode = mkNode({ id: "gs750", name: "1977 Suzuki GS750 (B)", level: 1, kind: "bike", obj: root, conf: "approx" });
  TW.sysNodes = {};
  TW_SYSTEMS.forEach(([id, name, blurb]) => { const g = new T.Group(); g.name = id; root.add(g); TW.sysNodes[id] = mkNode({ id, name, blurb, level: 2, kind: "system", obj: g, parent: bikeNode }); });
  bike.updateMatrixWorld(true);
  [...bike.children].forEach(ag => addAssembly(ag));
  root.add(bike); bike.visible = false; // anything left behind (empty helpers) stays out of sight
  TW.bikeNode = bikeNode; TW.ctx = bikeNode; return root;
}
function addAssembly(ag, internal) {
  const T = THREE, key = ag.userData.key, a = TW_ASSY[key] || { sys: "sys.chassis", conf: "approx" }, label = ag.userData.label || a.label || key;
  const sysNode = TW.sysNodes[a.sys]; const g = new T.Group(); g.name = key; sysNode.obj.add(g);
  const an = mkNode({ id: key, name: label, level: 3, kind: "assembly", obj: g, parent: sysNode, partId: ag.userData.partId || a.part, assy: key, conf: a.conf, internal: !!internal || !!a.internal, blurb: (typeof GROUP_BLURB !== "undefined" && GROUP_BLURB[key]) || a.blurb || "" });
  ag.updateMatrixWorld(true);
  const meshes = []; ag.traverse(o => { if (o.isMesh) meshes.push(o); });
  const subs = {}, hw = [];
  const subFor = (name) => { if (subs[name]) return subs[name]; const sg = new T.Group(); sg.name = name; g.add(sg); return (subs[name] = mkNode({ id: `${key}.${slug(name)}`, name, level: 4, kind: "group", obj: sg, parent: an, assy: key, internal: an.internal })); };
  meshes.forEach(m => {
    let sub = null, nm = m.name || "Piece";
    const ci = nm.indexOf(": "); if (ci > 0) { sub = nm.slice(0, ci); nm = nm.slice(ci + 2); }
    else if (m.parent !== ag && m.parent.parent === ag && m.parent.children.filter(c => c.isMesh).length <= 10 && !/bank/i.test(m.parent.name)) {
      if (key === "shocks") { const z = m.parent.position.z; sub = z > 0 ? "Left shock" : "Right shock"; }
      else if (key === "exhaust") { const mf = m.parent.children.find(c => /Muffler/.test(c.name)); sub = mf ? mf.name : null; }
      else if (key === "gauges") { const h = m.parent.children.find(c => /housing/.test(c.name)); sub = h ? h.name.replace(" housing", "") : null; }
    }
    m.userData.label = nm;
    if (HW_RE.test(nm) && !HW_NOT.test(nm) && !m.userData.internal) { hw.push({ m, sub, nm }); return; }
    const parentNode = sub ? subFor(sub) : an;
    parentNode.obj.attach(m);
    mkNode({ id: `${parentNode.id}.${slug(nm)}`, name: nm, level: parentNode.level + 1, kind: "part", obj: m, parent: parentNode, assy: key, internal: an.internal || !!m.userData.internal });
  });
  if (hw.length) addHardware(an, hw);
  TW_MISSING[key] && TW_MISSING[key].forEach(nm => mkNode({ id: `${key}.missing.${slug(nm)}`, name: nm, level: 4, kind: "missing", obj: null, parent: an, assy: key }));
  if (ag.parent) ag.parent.remove(ag);
  return an;
}
/* ---------- 3. hardware: repeated fasteners share one InstancedMesh, each instance keeps its own node ---------- */
function addHardware(an, list) {
  const T = THREE, fg = new T.Group(); fg.name = "Fasteners"; an.obj.add(fg);
  const fn = mkNode({ id: `${an.id}.fasteners`, name: "Fasteners & hardware", level: 4, kind: "group", obj: fg, parent: an, assy: an.assy, hardwareGroup: true });
  const sets = new Map();
  list.forEach(h => { const sig = h.nm + "|" + h.m.geometry.type + "|" + JSON.stringify(h.m.geometry.parameters || {}) + "|" + h.m.material.uuid; if (!sets.has(sig)) sets.set(sig, []); sets.get(sig).push(h); });
  sets.forEach(arr => {
    const base = arr[0].m, mat = cloneMat(base.material);
    const im = new T.InstancedMesh(base.geometry, mat, arr.length); im.name = arr[0].nm; im.castShadow = true; im.receiveShadow = true; im.userData.isHardware = true;
    const nodes = arr.map((h, i) => { h.m.updateMatrixWorld(true); im.setMatrixAt(i, h.m.matrixWorld); im.setColorAt(i, new T.Color(1, 1, 1));
      return mkNode({ id: `${fn.id}.${slug(h.nm)}`, name: arr.length > 1 ? `${h.nm} ${i + 1} of ${arr.length}` : h.nm, level: 5, kind: "hardware", obj: null, inst: { im, i, m0: h.m.matrixWorld.clone() }, parent: fn, assy: an.assy, secures: h.sub || an.name }); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.userData.real = mat; im.userData.instNodes = nodes; fg.add(im); TW.byObj.set(im, fn);
    arr.forEach(h => h.m.parent && h.m.parent.remove(h.m));
  });
}
function addFastenerSets(bike) {
  /* visible hardware that the base model draws as part of larger shapes; positions approximate, counts marked */
  const T = THREE, M = bike.userData.materials, G = {}; bike.children.forEach(g => G[g.userData.key] = g);
  const put = (key, n, geo, mat, pts, name) => pts.forEach(p => { const m = new T.Mesh(geo, mat); m.position.copy(p.p || p); if (p.r) m.rotation.set(...p.r); m.name = name; G[key].add(m); });
  const hexZ = (r, h) => new T.CylinderGeometry(r, r, h, 6).rotateX(Math.PI / 2), V3 = (x, y, z) => new T.Vector3(x, y, z);
  const ring = (cx, cy, z, r, n, a0 = 0) => Array.from({ length: n }, (_, i) => V3(cx + Math.cos(a0 + i / n * Math.PI * 2) * r, cy + Math.sin(a0 + i / n * Math.PI * 2) * r, z));
  put("clutch", 0, hexZ(.0045, .008), M.zinc, ring(-.085, .335, -.206, .118, 10, .2), "Clutch cover screw (count not verified)");
  put("ignition", 0, hexZ(.004, .008), M.zinc, ring(.087, .357, -.207, .042, 2, Math.PI / 2), "Points cover screw");
  put("cases", 0, hexZ(.004, .008).rotateX(Math.PI / 2), M.zinc, Array.from({ length: 7 }, (_, i) => V3(-.12 + i * .053, .145, .155)).concat(Array.from({ length: 7 }, (_, i) => V3(-.12 + i * .053, .145, -.155))), "Oil pan bolt (count not verified)");
  put("frame", 0, hexZ(.007, .012), M.zinc, [V3(.29, .48, .112), V3(.31, .44, .112), V3(.29, .48, -.112), V3(.31, .44, -.112)], "Engine mount bolt");
  put("stem", 0, new T.CylinderGeometry(.005, .005, .012, 6), M.zinc, [-1, 1].flatMap(s => [V3(.425, 1.0, s * .135), V3(.483, .85, s * .135)]).map(p => ({ p, r: [Math.PI / 2, 0, 0] })), "Triple clamp pinch bolt");
  put("stem", 0, new T.CylinderGeometry(.004, .004, .012, 6), M.chrome, [-1, 1].flatMap(s => [V3(.405, 1.063, s * .045 - .012), V3(.405, 1.063, s * .045 + .012)]), "Handlebar clamp bolt");
  put("swingarm", 0, hexZ(.011, .012), M.zinc, [V3(-.25, .4, .146), V3(-.25, .4, -.146)], "Swingarm pivot nut");
  put("shocks", 0, hexZ(.008, .01), M.chrome, [V3(-.64, .372, .158), V3(-.64, .372, -.158), V3(-.672, .8, .143), V3(-.672, .8, -.143)], "Shock mount nut");
  put("carbs", 0, new T.CylinderGeometry(.0028, .0028, .006, 8), M.zinc, [-.132, -.044, .044, .132].flatMap(z => [V3(-.085 - .018, .667, z - .018), V3(-.085 + .018, .667, z + .018)]), "Carb top screw");
  put("exhaust", 0, hexZ(.0045, .008).rotateZ(Math.PI / 2), M.zinc, [-.132, -.044, .044, .132].flatMap(z => [V3(.36, .64, z - .02), V3(.36, .64, z + .02)]), "Header flange nut (position approximate)");
  put("caliper", 0, new T.CylinderGeometry(.005, .005, .03, 6).rotateX(Math.PI / 2), M.zinc, [V3(.66, .45, -.1), V3(.62, .4, -.1)], "Caliper mounting bolt");
  put("chain", 0, hexZ(.004, .008), M.zinc, [V3(-.17, .32, .207), V3(-.09, .3, .207)], "Sprocket cover bolt");
  put("pegs", 0, hexZ(.006, .01), M.zinc, [V3(-.06, .31, .162), V3(-.06, .31, -.162)], "Footpeg bracket bolt");
}

/* ---------- 4. look manager ---------- */
const STATUS_HEX = { red: 0xD9534F, amber: 0xD99B35, green: 0x398564, gray: 0x9AA5AB };
const LOOK = { base: m => m.userData.real || m.material };
const VARS = new WeakMap();
function cloneMat(m) { const ud = m.userData; m.userData = {}; const c = m.clone(); m.userData = ud; return c; }
function variant(base, kind) {
  let vs = VARS.get(base); if (!vs) VARS.set(base, vs = {}); if (vs[kind]) return vs[kind];
  let m;
  if (kind.startsWith("status:")) { const c = kind.slice(7); m = new THREE.MeshStandardMaterial({ color: STATUS_HEX[c], roughness: .55, metalness: .15, name: "status " + c }); }
  else if (kind === "tech") { m = new THREE.MeshStandardMaterial({ color: 0xD5DCE1, roughness: .95, metalness: 0, flatShading: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }); }
  else { m = cloneMat(base);
    if (kind === "ghost") { m.transparent = true; m.opacity = .11; m.depthWrite = false; }
    if (kind === "dim") { m.transparent = true; m.opacity = .16; m.depthWrite = false; }
    if (kind === "fade") { m.transparent = true; m.opacity = 1; m.depthWrite = false; }
    if (kind === "sel" && m.emissive) { m.emissive = new THREE.Color(0x2b6f9a); m.emissiveIntensity = .38; }
    if (kind === "hover" && m.emissive) { m.emissive = new THREE.Color(0x2b6f9a); m.emissiveIntensity = .2; }
  }
  vs[kind] = m; return m;
}
function matchFilter(n) {
  if (TW.sysFilter) { const s = nodeAncestors(n).find(x => x.kind === "system"); if (!s || s.id !== TW.sysFilter) return false; }
  if (!TW.filter) return true;
  const p = S.parts[nodePart(n)]; if (!p) return TW.filter === "gray";
  if (TW.filter === "failed") return partInspectionState(p) === "Failed";
  return partColor(p) === TW.filter;
}
function lookFor(mesh, n) {
  let base = LOOK.base(mesh);
  if (TW.tech) base = variant(base, "tech");
  else if (TW.statusMode) { const p = S.parts[nodePart(n)]; base = variant(base, "status:" + (p ? partColor(p) : "gray")); }
  const anc = nodeAncestors(n);
  if (anc.some(a => TW.ghosts.has(a))) return variant(base, "ghost");
  if (anc.some(a => a.fading)) return variant(base, "fade");
  if ((TW.filter || TW.sysFilter) && !matchFilter(n)) return variant(base, "dim");
  if (TW.sel && anc.includes(TW.sel)) return variant(base, "sel");
  if (TW.hover && anc.includes(TW.hover)) return variant(base, "hover");
  return base;
}
function refreshLook(scope) {
  if (!TW.ok) return;
  (scope ? nodeDesc(scope) : [...TW.nodes.values()]).forEach(n => {
    if (n.obj && n.obj.isMesh) n.obj.material = lookFor(n.obj, n);
    if (n.hardwareGroup) n.obj.children.forEach(im => { if (!im.isInstancedMesh) return; im.material = lookFor(im, n);
      im.userData.instNodes.forEach((h, i) => im.setColorAt(i, new THREE.Color(TW.sel === h ? 0x9fd0ef : TW.hover === h ? 0xcfe6f5 : 0xffffff))); if (im.instanceColor) im.instanceColor.needsUpdate = true; });
  });
  if (TW.tech) applyEdges(true);
  TW.need = true;
}
function applyEdges(on) {
  TW.nodes.forEach(n => { const m = n.obj; if (!m || !m.isMesh) return;
    if (on && !m.userData.edges) { const pos = m.geometry.attributes.position; if (pos && pos.count < 30000) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 32), new THREE.LineBasicMaterial({ color: 0x1f2a33, transparent: true, opacity: .8 })); e.raycast = () => {}; m.add(e); m.userData.edges = e; } }
    if (m.userData.edges) m.userData.edges.visible = on && m.visible; });
}

/* ---------- 5. displacement & visibility ---------- */
function orig(n) { if (n.obj && !n.p0) { n.p0 = n.obj.position.clone(); n.q0 = n.obj.quaternion.clone(); n.s0 = n.obj.scale.clone(); } }
function snapshotAll() { TW.nodes.forEach(n => orig(n)); }
function setOffset(n, v) {
  n.offset = v && v.lengthSq() > 1e-12 ? v.clone() : null;
  if (n.offset) TW.moved.add(n); else TW.moved.delete(n);
  if (n.obj) { n.obj.position.copy(n.p0); if (n.offset) n.obj.position.add(n.offset); }
  else if (n.inst) { const { im, i, m0 } = n.inst, m = m0.clone(); if (n.offset) m.premultiply(new THREE.Matrix4().makeTranslation(n.offset.x, n.offset.y, n.offset.z)); if (n.hidden) m.scale(new THREE.Vector3(1e-4, 1e-4, 1e-4)); im.setMatrixAt(i, m); im.instanceMatrix.needsUpdate = true; }
  TW.need = true;
}
/* Offsets are kept in layers (explode, clear view, internals, pull-out, hand moves) and added together,
   so undoing one action only takes away its own movement and leaves the others where they are. */
const LAYER_OF = tag => !tag ? "ex" : tag.startsWith("focus") ? "focus" : tag === "clear" ? "clr" : tag === "internals" ? "int" : tag === "explode" ? "ex" : tag === "assemble" ? "*" : tag;
function layerSum(n) { const v = new THREE.Vector3(); if (n.lay) Object.values(n.lay).forEach(x => x && v.add(x)); return v; }
function applyLayers(n) { const v = layerSum(n); setOffset(n, v.lengthSq() < 1e-12 ? null : v); }
function setLayer(n, L, v) { n.lay = n.lay || {}; if (v) n.lay[L] = v; else delete n.lay[L]; applyLayers(n); }
function moveNodes(pairs, ms = 700, tag) { // pairs: [node, targetOffset|null] for this action's layer
  const L = LAYER_OF(tag), Z = () => new THREE.Vector3();
  if (L === "*") { const from = pairs.map(([n]) => Object.assign({}, n.lay || {}));
    return anim(ms, k => pairs.forEach(([n], i) => { n.lay = {}; Object.entries(from[i]).forEach(([key, v]) => { if (v) n.lay[key] = v.clone().multiplyScalar(1 - k); }); applyLayers(n); }), () => pairs.forEach(([n]) => { n.lay = {}; applyLayers(n); }), tag); }
  const from = pairs.map(([n]) => n.lay && n.lay[L] ? n.lay[L].clone() : Z());
  return anim(ms, k => pairs.forEach(([n, to], i) => setLayer(n, L, from[i].clone().lerp(to || Z(), k))), () => pairs.forEach(([n, to]) => { if (!to) setLayer(n, L, null); }), tag);
}
function setHidden(n, h) {
  n.hidden = h; if (h) TW.hidden.add(n); else TW.hidden.delete(n);
  if (n.obj) n.obj.visible = !h; else if (n.inst) setOffset(n, n.offset);
  TW.need = true;
}
function fadeNodes(nodes, show, ms = 450, done) {
  nodes.forEach(n => { n.fading = true; if (show) setHidden(n, false); }); refreshLook();
  const mats = new Set(); nodes.forEach(n => nodeMeshes(n).forEach(m => mats.add(m.material))); nodes.forEach(n => nodeDesc(n).forEach(d => d.hardwareGroup && d.obj.children.forEach(im => mats.add(im.material))));
  return anim(ms, k => mats.forEach(m => { if (m.transparent) m.opacity = show ? k : 1 - k; }), () => { nodes.forEach(n => { n.fading = false; if (!show) setHidden(n, true); }); mats.forEach(m => m.opacity = 1); refreshLook(); done && done(); });
}
function nodeBox(n) { const b = new THREE.Box3(); nodeDesc(n).forEach(d => { if (d.obj && d.obj.isMesh && d.obj.visible !== false) b.expandByObject(d.obj); if (d.inst && !d.hidden) { d.inst.im.updateMatrixWorld(); const p = new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(d.inst.im.instanceMatrix.array, d.inst.i * 16).premultiply(d.inst.im.matrixWorld)); b.expandByPoint(p.clone().addScalar(.006)); b.expandByPoint(p.addScalar(-.012)); } }); if (b.isEmpty() && n.hardwareGroup) n.obj.children.forEach(im => b.expandByObject(im)); return b; }
function nodeCenter(n) { const b = nodeBox(n); return b.isEmpty() ? new THREE.Vector3(0, .6, 0) : b.getCenter(new THREE.Vector3()); }
function returnToAssembly(ms = 800) {
  if (TW.focus.length) focusExitAll(true);
  exRestore(); const pairs = [...TW.moved].map(n => [n, null]); TW.explodeNode = null; TW.explodeK = 0; TW.explodeStep = null; TW.cleared = null;
  if (!pairs.length) return; moveNodes(pairs, ms, "assemble");
  anim(ms + 20, () => {}, () => pairs.forEach(([n]) => { if (n.obj) { n.obj.position.copy(n.p0); n.obj.quaternion.copy(n.q0); n.obj.scale.copy(n.s0); } else if (n.inst) setOffset(n, null); TW.moved.delete(n); n.offset = null; n.lay = {}; }));
}

/* ---------- 6. explode / isolate / clearance / internals ---------- */
const CYL_AXIS = () => new THREE.Vector3(Math.sin(.2), Math.cos(.2), 0);
const FORK_AXIS = () => new THREE.Vector3(.455 - .745, 1.03 - .333, 0).normalize();
function explodeDirs(n) {
  const kids = n.children.filter(c => c.kind !== "missing" && (c.obj || c.inst)); if (!kids.length) return [];
  const c0 = nodeCenter(n), size = nodeBox(n).getSize(new THREE.Vector3()).length() || .3, a = TW_ASSY[n.assy] || {}, mode = n.kind === "system" || n.kind === "bike" ? "radial" : a.ex || "radial";
  const axis = { z: new THREE.Vector3(0, 0, 1), x: new THREE.Vector3(1, 0, 0), cyl: CYL_AXIS(), fork: FORK_AXIS(), carbguts: new THREE.Vector3(0, 1, 0), axis: new THREE.Vector3(0, 1, 0) }[mode === "carbs" ? (n.kind === "assembly" ? "z" : "carbguts") : mode];
  const items = kids.map(k => ({ k, c: k.offset ? nodeCenter(k).sub(k.offset) : nodeCenter(k) }));
  items.forEach(it => {
    const d = it.c.clone().sub(c0);
    if (axis) { let s = d.dot(axis); const perp = d.clone().sub(axis.clone().multiplyScalar(s)); if (Math.abs(s) < size * .02) s = (perp.length() > size * .05 ? 0 : (it.k.name.length % 2 ? 1 : -1) * size * .05);
      it.v = axis.clone().multiplyScalar(s * 2.1 + Math.sign(s) * size * .16).add(perp.multiplyScalar(.45)); }
    else { if (d.length() < size * .02) d.set(0, 1, 0).multiplyScalar(size * .1); it.v = d.multiplyScalar(n.kind === "bike" || n.kind === "system" ? 1.25 : 1.6); }
  });
  separateAlong(items, size, n.kind === "bike");
  // disassembly order: outermost first
  items.sort((p, q) => q.v.length() - p.v.length()); return items;
}
/* Every part keeps moving the way it sits on the bike (the tank goes up, the exhaust goes down and out).
   Where two parts would still touch, the one that is already further out slides further along its own
   direction until there is a clear gap. Nothing ever changes direction, so the layout still reads like the bike. */
function separateAlong(items, size, keepAnchor) {
  const T = THREE, gap = size * .03;
  items.forEach(it => { const b = nodeBox(it.k); if (it.k.offset) b.translate(it.k.offset.clone().negate()); it.b = b.isEmpty() ? new T.Box3().setFromCenterAndSize(it.c, new T.Vector3(.02, .02, .02)) : b;
    const sz = it.b.getSize(new T.Vector3()); it.vol = Math.max(sz.x, .001) * Math.max(sz.y, .001) * Math.max(sz.z, .001);
    it.s = it.v.length(); it.u = it.s > 1e-6 ? it.v.clone().divideScalar(it.s) : new T.Vector3(0, 1, 0); });
  const anchor = keepAnchor && items.length > 2 ? items.reduce((a, b) => b.vol > a.vol ? b : a) : null;
  if (anchor) { anchor.s = 0; anchor.v.set(0, 0, 0); }
  const corners = b => { const r = []; for (let i = 0; i < 8; i++) r.push(new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)); return r; };
  const proj = (it, u) => { let lo = Infinity, hi = -Infinity; const off = it.u.clone().multiplyScalar(it.s); corners(it.b).forEach(c => { const d = c.add(off).dot(u); lo = Math.min(lo, d); hi = Math.max(hi, d); }); return [lo, hi]; };
  const boxAt = it => it.b.clone().translate(it.u.clone().multiplyScalar(it.s)).expandByScalar(gap / 2);
  for (let iter = 0; iter < 200; iter++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j]; if (!boxAt(A).intersectsBox(boxAt(B))) continue;
      let m, o; if (A === anchor) { m = B; o = A; } else if (B === anchor) { m = A; o = B; } else if (Math.abs(A.s - B.s) > 1e-6) { [m, o] = A.s > B.s ? [A, B] : [B, A]; } else { [m, o] = A.vol < B.vol ? [A, B] : [B, A]; }
      const [, ohi] = proj(o, m.u), [mlo] = proj(m, m.u); const step = Math.max(gap * .5, ohi - mlo + gap);
      m.s += step; moved = true;
    }
    if (!moved) break;
  }
  items.forEach(it => it.v = it.u.clone().multiplyScalar(it.s));
}
/* push exploded parts apart until no two bounding boxes touch (with a gap) */
function separateExploded(items, axis, size, zCost = 4) {
  const gap = size * .035, T = THREE;
  items.forEach(it => { const b = nodeBox(it.k); if (it.k.offset) b.translate(it.k.offset.clone().negate()); it.b = b.isEmpty() ? new T.Box3().setFromCenterAndSize(it.c, new T.Vector3(.02, .02, .02)) : b; it.vol = it.b.getSize(new T.Vector3()).toArray().reduce((a, x) => a * Math.max(x, .001), 1); });
  const anchor = items.length > 2 ? items.reduce((a, b) => b.vol > a.vol ? b : a) : null; // biggest part (frame, crankcase) stays put
  if (anchor && !axis) anchor.v.set(0, 0, 0);
  const corners = b => { const r = []; for (let i = 0; i < 8; i++) r.push(new T.Vector3(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z)); return r; };
  const proj = (b, off, u) => { let lo = Infinity, hi = -Infinity; corners(b).forEach(c => { const d = c.add(off).dot(u); lo = Math.min(lo, d); hi = Math.max(hi, d); }); return [lo, hi]; };
  const dirs = axis ? [axis.clone().normalize()] : [new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1)];
  for (let iter = 0; iter < 80; iter++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = items[i], B = items[j];
      const ba = A.b.clone().translate(A.v).expandByScalar(gap / 2), bb = B.b.clone().translate(B.v).expandByScalar(gap / 2);
      if (!ba.intersectsBox(bb)) continue;
      let best = null;
      dirs.forEach(u => { const [a0, a1] = proj(A.b, A.v, u), [b0, b1] = proj(B.b, B.v, u), pen = Math.min(a1, b1) - Math.max(a0, b0) + gap, cost = pen * (!axis && u.z ? zCost : 1); if (pen > 0 && (!best || cost < best.cost)) best = { u, pen, cost, sgn: (a0 + a1) / 2 <= (b0 + b1) / 2 ? -1 : 1 }; });
      if (!best) continue;
      let wa = A === anchor ? 0 : B === anchor ? 1 : .5, wb = 1 - wa;
      // along an axis, keep the order parts come off in: the one already further out moves further
      if (axis && A !== anchor && B !== anchor) { const sa = A.v.dot(best.u), sb = B.v.dot(best.u); if (Math.abs(sa) > Math.abs(sb) * 1.2) { wa = 1; wb = 0; } else if (Math.abs(sb) > Math.abs(sa) * 1.2) { wa = 0; wb = 1; } }
      A.v.addScaledVector(best.u, best.sgn * best.pen * wa * 1.02); B.v.addScaledVector(best.u, -best.sgn * best.pen * wb * 1.02); moved = true;
    }
    if (!moved) break;
  }
}
function setExplode(n, k, ms = 600, step = null) {
  if (!n) return; if (TW.explodeNode && TW.explodeNode !== n && TW.explodeK > 0) { const prev = TW.explodeNode; moveNodes(prev.children.map(c => [c, null]), 300, "explode"); }
  TW.explodeNode = n; TW.explodeK = k; TW.explodeStep = step; n._ex = n._ex || explodeDirs(n);
  if (k > 0 && n !== TW.bikeNode) { if (!TW.exHid || TW.exHid.n !== n) exIsolate(n); } else exRestore();
  const pairs = n._ex.map((it, i) => [it.k, it.v.clone().multiplyScalar(step == null ? k : (i < step ? 1 : 0))]);
  moveNodes(pairs, ms, "explode"); updateLabels(); twinPanel();
}
/* while an assembly is exploded, the rest of the bike steps aside so nothing overlaps it */
function exIsolate(n) {
  exRestore(true); const keep = new Set([...nodeAncestors(n), ...nodeDesc(n)]), out = [];
  const walk = x => { if (keep.has(x)) { x.children.forEach(walk); return; } if (!x.hidden && (x.obj || x.inst)) out.push(x); };
  walk(TW.bikeNode); TW.exHid = { n, list: out }; fadeNodes(out, false, 350);
}
function exRestore(quick) {
  const e = TW.exHid; TW.exHid = null; if (!e) return;
  const back = e.list.filter(x => !(TW.userHidden && TW.userHidden.has(x)) && !TW.focus.some(f => f.hid.includes(x)));
  if (quick) back.forEach(x => setHidden(x, false)); else fadeNodes(back, true, 400);
}
function explodeFit(n, ms) { setTimeout(() => { if (TW.explodeNode === n && TW.explodeK > 0) fitCamera(n, 800); }, ms + 40); }
function explodeTarget() { let n = TW.sel || TW.bikeNode; if (n.children.filter(c => c.obj || c.inst).length < 2 && n.parent) n = n.parent; return n; }
/* focus stack: clicking a part lifts it out of whatever you're looking at; clicking inside it goes one level deeper */
TW.focus = [];
const nz = v => v.lengthSq() < 1e-10 ? null : v;
const focusTop = () => TW.focus[TW.focus.length - 1] || null;
const syncIso = () => { const t = focusTop(); TW.isolated = t ? { n: t.n } : null; };
function focusInto(n, ms = 950) {
  if (!n || n === TW.bikeNode || n.kind === "missing" || n.hidden) return;
  if (focusTop() && !nodeAncestors(n).includes(focusTop().n)) focusExitAll(true);
  if (focusTop() && focusTop().n === n) return;
  const T = THREE, scope = focusTop() ? focusTop().n : TW.bikeNode;
  const keep = new Set([...nodeAncestors(n), ...nodeDesc(n)]), hide = [];
  const walk = x => { if (keep.has(x)) { x.children.forEach(walk); return; } if (!x.hidden && (x.obj || x.inst)) hide.push(x); };
  walk(scope);
  const b = nodeBox(n), c = b.getCenter(new T.Vector3()), size = Math.max(.04, b.getSize(new T.Vector3()).length());
  const view = TW.cam.position.clone().sub(TW.ctl.target).normalize();
  const lift = new T.Vector3(0, Math.min(.32, size * .3 + .03), 0).add(view.clone().multiplyScalar(Math.min(.28, size * .25)));
  const base = n.lay && n.lay.focus ? n.lay.focus.clone() : new T.Vector3();
  TW.focus.push({ n, hid: hide, lift, cam: camState() }); syncIso(); TW.sel = n; TW.ctx = n; TW.hover = null;
  if (TW.floor) TW.floor.visible = false;
  fadeNodes(hide, false, ms * .55);
  moveNodes([[n, base.add(lift)]], ms, "focus" + TW.focus.length);
  const dist = (size / 2) / Math.sin(T.MathUtils.degToRad(TW.cam.fov / 2)) * (TW.cam.aspect < 1 ? 1.55 : 1.12) + .03, tgt = c.clone().add(lift);
  TW.cam.near = Math.max(.002, dist / 200); TW.cam.updateProjectionMatrix();
  camTo(tgt.clone().add(view.multiplyScalar(dist)), tgt, ms);
  refreshLook(); twinPanel(); updateLabels(); twinTreeSync();
}
function focusBack(ms = 800) {
  const e = TW.focus.pop(); if (!e) return; syncIso();
  moveNodes([[e.n, nz((e.n.lay && e.n.lay.focus ? e.n.lay.focus.clone() : new THREE.Vector3()).sub(e.lift))]], ms, "focusb" + TW.focus.length);
  fadeNodes(e.hid.filter(x => !(TW.userHidden && TW.userHidden.has(x))), true, ms * .7);
  camTo(e.cam.p, e.cam.t, ms);
  const t = focusTop(); TW.sel = t ? t.n : null; TW.ctx = t ? t.n : TW.bikeNode; if (!t && TW.floor) TW.floor.visible = true;
  refreshLook(); twinPanel(); updateLabels(); twinTreeSync();
}
function focusExitAll(quick) {
  if (!TW.focus.length) return; const list = TW.focus.splice(0); syncIso();
  const pairs = list.map(e => [e.n, nz((e.n.lay && e.n.lay.focus ? e.n.lay.focus.clone() : new THREE.Vector3()).sub(e.lift))]);
  const back = list.flatMap(e => e.hid).filter(x => !(TW.userHidden && TW.userHidden.has(x)));
  if (quick) { pairs.forEach(([n, v]) => setLayer(n, "focus", v)); back.forEach(x => setHidden(x, false)); }
  else { moveNodes(pairs, 850, "focusx"); fadeNodes(back, true, 600); camTo(list[0].cam.p, list[0].cam.t, 950); }
  TW.sel = null; TW.ctx = TW.bikeNode; if (TW.floor) TW.floor.visible = true;
  refreshLook(); twinPanel(); updateLabels(); twinTreeSync();
}
function focusTo(n) { // used by the breadcrumb and tree
  if (!n || n === TW.bikeNode) { focusExitAll(); return; }
  const i = TW.focus.findIndex(e => e.n === n);
  if (i >= 0) { while (TW.focus.length > i + 1) focusBack(700); return; }
  focusInto(n);
}
const isolate = n => focusInto(n), restoreIsolation = quick => focusExitAll(quick);
function obstructorsFor(n) {
  const T = THREE, a = nodeAssy(n), list = new Set(((a && TW_ASSY[a.assy]?.clear) || []).filter(k => TW.nodes.has(k)).map(k => TW.nodes.get(k)));
  // plus anything a straight line from the camera to the part passes through first
  const box = nodeBox(n), c = box.getCenter(new T.Vector3()), ray = new T.Raycaster(), pts = [c];
  const sz = box.getSize(new T.Vector3()); [[-1, 0, 0], [1, 0, 0], [0, 1, 0], [0, -1, 0]].forEach(([x, y]) => pts.push(c.clone().add(new T.Vector3(x * sz.x * .3, y * sz.y * .3, 0))));
  const targetMeshes = new Set(nodeMeshes(n));
  pts.forEach(p => { const dir = p.clone().sub(TW.cam.position), dist = dir.length(); ray.set(TW.cam.position, dir.normalize()); ray.far = dist;
    ray.intersectObject(TW.root, true).forEach(h => { if (!h.object.visible || targetMeshes.has(h.object)) return; const hn = TW.byObj.get(h.object), ha = hn && nodeAssy(hn); if (ha && ha !== a && !nodeAncestors(n).includes(ha) && !ha.internal) list.add(ha); }); });
  return [...list].filter(x => !nodeAncestors(n).includes(x) && !nodeDesc(n).includes(x)).slice(0, 8);
}
function clearView(n) {
  if (!n) return; if (TW.cleared) unclearView(true);
  const T = THREE, c = nodeCenter(n), obs = obstructorsFor(n), rN = nodeBox(n).getSize(new T.Vector3()).length() / 2;
  const pairs = obs.map(o => { const oc = nodeCenter(o), d = oc.clone().sub(c); if (d.length() < .01) d.set(0, 1, 0); d.normalize(); d.y = Math.max(d.y, .25); d.normalize();
    const r = nodeBox(o).getSize(new T.Vector3()).length() / 2; return [o, d.multiplyScalar(Math.min(.7, Math.max(.22, r + rN * .6)))]; });
  TW.cleared = { n, list: obs }; moveNodes(pairs, 800, "clear"); twinPanel();
}
function unclearView(quick) { const c = TW.cleared; if (!c) return; TW.cleared = null; moveNodes(c.list.map(o => [o, null]), quick ? 1 : 700, "clear"); twinPanel(); }
function ensureInternals() {
  if (TW.internalsBuilt) return; TW.internalsBuilt = true;
  const t0 = performance.now(), holder = new THREE.Group(); holder.userData.materials = TW.bike.userData.materials;
  const made = buildInternals(holder); holder.updateMatrixWorld(true);
  Object.values(made).forEach(g => { const an = addAssembly(g, true); nodeDesc(an).forEach(n => { orig(n); n.obj && n.obj.isMesh && (n.obj.userData.real = n.obj.material); }); });
  TW.internalsMs = Math.round(performance.now() - t0); twinTree();
}
function internalsFor(n) {
  const a = nodeAssy(n); const key = a ? a.assy : null;
  if (n.kind === "system" && n.id === "sys.engine") return ["crank", "pistons", "valvetrain", "camchain", "clutchpack", "gearbox", "oilpump"];
  if (n.kind === "bike") return Object.keys(TW_SHELLS);
  if (a && a.internal) return [key];
  return Object.entries(TW_SHELLS).filter(([, sh]) => sh.includes(key)).map(([k]) => k);
}
function showInternals(n) {
  n = n || TW.sel || TW.bikeNode; const list = internalsFor(n); if (!list.length) { toast("Nothing has been modeled inside this part yet."); return; }
  ensureInternals(); if (TW.internalsOn) hideInternals(true);
  const shells = new Set(); list.forEach(k => (TW_SHELLS[k] || []).forEach(s => TW.nodes.has(s) && shells.add(TW.nodes.get(s))));
  shells.forEach(s => TW.ghosts.add(s)); TW.internalsOn = { n, list, shells: [...shells] };
  // nothing moves: whatever sits in front of the inside turns see-through too
  const ins = list.map(k => TW.nodes.get(k)).filter(Boolean), skip = new Set([...shells, ...ins]);
  const clr = new Set(); ins.forEach(i => (TW_ASSY[i.assy]?.clear || []).forEach(k => { const x = TW.nodes.get(k); if (x && !skip.has(x) && !TW.ghosts.has(x)) clr.add(x); }));
  clr.forEach(x => TW.ghosts.add(x)); TW.internalsOn.ghosted = [...clr];
  refreshLook(); twinTree(); twinPanel();
}
function hideInternals(quick) { const io = TW.internalsOn; if (!io) return; TW.internalsOn = null; io.shells.forEach(s => TW.ghosts.delete(s)); (io.ghosted || []).forEach(s => TW.ghosts.delete(s)); refreshLook(); twinPanel(); }
function hideSelected() { const n = TW.sel; if (!n || n === TW.bikeNode) return; TW.userHidden = TW.userHidden || new Set();
  if (TW.userHidden.has(n)) { TW.userHidden.delete(n); fadeNodes([n], true, 350); twinPanel(); return; } // second click shows it again
  TW.userHidden.add(n); fadeNodes([n], false, 350); twinPanel(); twinTree(); }
function restoreHidden() { const list = [...(TW.userHidden || [])]; TW.userHidden = new Set(); fadeNodes(list, true, 400); twinPanel(); }
function resetModel() {
  finishAnims(); TW.exHid = null; TW.focus = []; TW.userMoved = new Set(); TW.isolated = null; TW.ghosts.clear(); TW.internalsOn = null; TW.cleared = null; TW.isolated = null; TW.explodeNode = null; TW.explodeK = 0; TW.explodeStep = null; TW.userHidden = new Set(); TW.filter = ""; TW.sysFilter = "";
  TW.nodes.forEach(n => { n.fading = false; if (n.hidden) setHidden(n, false); if (n.obj && n.p0) { n.obj.position.copy(n.p0); n.obj.quaternion.copy(n.q0); n.obj.scale.copy(n.s0); } if (n.inst) setOffset(n, null); n.offset = null; n.lay = {}; n._ex = null; });
  TW.moved.clear(); TW.hidden.clear(); if (TW.floor) TW.floor.visible = true; TW.sel = null; TW.ctx = TW.bikeNode; refreshLook(); setView("iso"); updateLabels(); twinPanel(); twinTree();
}

/* ---------- 7. lighting & quality ---------- */
const LIGHTS = {
  studio: { bg: null, exp: 1.0, env: 1, key: [0xffffff, 1.6], rim: .55, hemi: .35, fill: 0, shadow: .2, label: "Neutral studio" },
  workshop: { bg: 0x3b3e41, exp: .92, env: .55, key: [0xffd7a3, 2.1], rim: .25, hemi: .25, fill: .25, shadow: .38, label: "Workshop" },
  inspect: { bg: 0xffffff, exp: 1.22, env: 1.15, key: [0xffffff, 1.3], rim: .8, hemi: 1.0, fill: .9, shadow: .12, label: "Bright inspection" },
  tech: { bg: 0xf3f6f8, exp: 1.0, env: .6, key: [0xffffff, 1.0], rim: .3, hemi: 1.1, fill: .6, shadow: .08, label: "Technical / wireframe" },
};
function setLighting(name) {
  const L = LIGHTS[name] || LIGHTS.studio; TW.light = name; const wasTech = TW.tech; TW.tech = name === "tech";
  TW.scene.background = L.bg == null ? null : new THREE.Color(L.bg); TW.rend.toneMappingExposure = L.exp;
  TW.key.color.setHex(L.key[0]); TW.key.intensity = L.key[1]; TW.rim.intensity = L.rim; TW.hemi.intensity = L.hemi; TW.fills.forEach(f => f.intensity = L.fill);
  TW.shadowMat.opacity = L.shadow; TW.envScale = L.env;
  TW.root.traverse(o => { if (o.material && o.material.envMapIntensity !== undefined) o.material.envMapIntensity = L.env; });
  if (TW.el) TW.el.dataset.light = name;
  if (wasTech && !TW.tech) applyEdges(false);
  refreshLook(); lsSet("gs750.light", name);
}
function setQuality(q) {
  TW.quality = q; const hi = q === "high"; TW.rend.setPixelRatio(hi ? Math.min(2, window.devicePixelRatio || 1) : 1);
  TW.rend.shadowMap.enabled = hi; TW.key.castShadow = hi; TW.rend.shadowMap.needsUpdate = true;
  TW.root.traverse(o => { if (o.material) o.material.needsUpdate = true; });
  const w = TW.el.clientWidth, h = TW.el.clientHeight; TW.rend.setSize(w, h); TW.need = true; lsSet("gs750.quality", q);
}

/* ---------- 8. scene, picking, camera ---------- */
function webglOK() { try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); } catch (e) { return false; } }
function camState() { return { p: TW.cam.position.clone(), t: TW.ctl.target.clone() }; }
function camTo(pos, target, ms = 900) { const p0 = TW.cam.position.clone(), t0 = TW.ctl.target.clone(); anim(ms, k => { TW.cam.position.lerpVectors(p0, pos, k); TW.ctl.target.lerpVectors(t0, target, k); }, null, "cam"); }
const VIEWS3D = { iso: [1.75, 1.05, 2.25], left: [0, .3, 3], right: [0, .3, -3], front: [3, .35, 0], rear: [-3, .35, 0], top: [.01, 3.2, 0], low: [1.6, .12, 1.9], under: [.6, -1.6, .8] };
/* an invisible box around the bike: you can fly, pan and turn anywhere inside it, and zooming out stops at its edge */
function setCamBounds() { const T = THREE, b = nodeBox(TW.bikeNode); if (b.isEmpty()) return;
  TW.bounds = { min: b.min.clone().sub(new T.Vector3(3.5, 1.6, 3.5)), max: b.max.clone().add(new T.Vector3(3.5, 3, 3.5)), tmin: b.min.clone().subScalar(1.8), tmax: b.max.clone().addScalar(1.8), maxD: 7 }; }
function clampCam() { const B = TW.bounds; if (!B || !TW.ctl) return; TW.ctl.target.clamp(B.tmin, B.tmax);
  const d = TW.cam.position.clone().sub(TW.ctl.target); if (d.length() > B.maxD) TW.cam.position.copy(TW.ctl.target).add(d.setLength(B.maxD));
  TW.cam.position.clamp(B.min, B.max); }
function setView(name, instant) {
  const tgt = TW.isolated ? nodeCenter(TW.isolated.n) : new THREE.Vector3(-.02, .58, 0), d = new THREE.Vector3(...VIEWS3D[name]);
  const R = TW.isolated ? Math.max(.06, nodeBox(TW.isolated.n).getSize(new THREE.Vector3()).length() / 2) : 1.18, vh = THREE.MathUtils.degToRad(TW.cam.fov / 2), hh = Math.atan(Math.tan(vh) * TW.cam.aspect);
  const dist = R / Math.sin(Math.min(vh, hh)) * .92;
  const pos = tgt.clone().add(d.normalize().multiplyScalar(dist)); if (instant) { TW.cam.position.copy(pos); TW.ctl.target.copy(tgt); TW.ctl.update(); TW.need = true; } else camTo(pos, tgt);
}
function fitCamera(n, ms = 1000, dirOverride) {
  const T = THREE, b = nodeBox(n); if (b.isEmpty()) return; const c = b.getCenter(new T.Vector3()), r = Math.max(.04, b.getSize(new T.Vector3()).length() / 2);
  const dist = r / Math.sin(THREE.MathUtils.degToRad(TW.cam.fov / 2)) * (TW.cam.aspect < 1 ? 1.5 : 1.05) + .02;
  const dir = dirOverride ? dirOverride.clone().normalize() : TW.cam.position.clone().sub(TW.ctl.target).normalize(); TW.cam.near = Math.max(.002, dist / 200); TW.cam.updateProjectionMatrix();
  camTo(c.clone().add(dir.multiplyScalar(dist)), c, ms);
}
function pickNode(mesh, instanceId) {
  let n = TW.byObj.get(mesh); if (!n) return null;
  if (mesh.isInstancedMesh && instanceId != null) n = mesh.userData.instNodes[instanceId] || n;
  const chain = nodeAncestors(n), top = focusTop();
  if (top) { const i = chain.indexOf(top.n); return i < 0 ? null : (chain[i + 1] || top.n); }
  const want = Math.min(TW.level, n.level); return chain.find(x => x.level === want) || n;
}
function initTwin(stage) {
  TW.el = stage;
  if (!window.THREE || !THREE.OrbitControls || !THREE.RoundedBoxGeometry || !THREE.BufferGeometryUtils || !webglOK()) { TW.ok = false; return false; }
  try {
    const T = THREE, w = stage.clientWidth, h = stage.clientHeight; const t0 = performance.now();
    TW.quality = lsGet("gs750.quality", (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 760 ? "perf" : "high");
    TW.rend = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!window.__shotMode });
    TW.rend.setSize(w, h); TW.rend.outputEncoding = T.sRGBEncoding; TW.rend.toneMapping = T.ACESFilmicToneMapping; TW.rend.shadowMap.type = T.PCFSoftShadowMap;
    stage.prepend(TW.rend.domElement); TW.rend.domElement.setAttribute("aria-label", "3D model of a 1977 Suzuki GS750. Drag to rotate, scroll to zoom, right-drag to pan, click a part to select it, double-click to go one level deeper.");
    TW.scene = new T.Scene(); TW.cam = new T.PerspectiveCamera(34, w / h, .01, 60);
    const pm = new T.PMREMGenerator(TW.rend); TW.scene.environment = pm.fromScene(new T.RoomEnvironment(), .04).texture;
    TW.hemi = new T.HemisphereLight(0xffffff, 0xb9c4cc, .35); TW.scene.add(TW.hemi);
    TW.key = new T.DirectionalLight(0xffffff, 1.6); TW.key.position.set(1.6, 3.4, 2.2); TW.key.shadow.mapSize.set(2048, 2048);
    Object.assign(TW.key.shadow.camera, { left: -1.6, right: 1.6, top: 1.6, bottom: -1.6, near: .5, far: 8 }); TW.key.shadow.radius = 5; TW.key.shadow.bias = -.0004; TW.scene.add(TW.key);
    TW.rim = new T.DirectionalLight(0xdfeefa, .55); TW.rim.position.set(-2.5, 1.8, -2); TW.scene.add(TW.rim);
    TW.fills = [[-2, 1.2, 2.5], [2.5, .8, -2], [0, -1, 1.5]].map(p => { const l = new T.DirectionalLight(0xffffff, 0); l.position.set(...p); TW.scene.add(l); return l; });
    TW.floor = new T.Group();
    const blob = makeTexture(256, 256, (g, s) => { const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); grd.addColorStop(0, "rgba(20,25,30,.22)"); grd.addColorStop(.55, "rgba(20,25,30,.07)"); grd.addColorStop(1, "rgba(20,25,30,0)"); g.fillStyle = grd; g.fillRect(0, 0, s, s); });
    const disc = new T.Mesh(new T.PlaneGeometry(2.6, 1.3), new T.MeshBasicMaterial({ map: blob, transparent: true, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = .0005; TW.floor.add(disc);
    TW.shadowMat = new T.ShadowMaterial({ opacity: .2 }); const sh = new T.Mesh(new T.PlaneGeometry(6, 6), TW.shadowMat); sh.rotation.x = -Math.PI / 2; sh.position.y = .001; sh.receiveShadow = true; TW.floor.add(sh); TW.scene.add(TW.floor);
    const pmeta = meta(), ph = n(pmeta.paintHex) || PAINTS["Candy blue"];
    TW.bike = buildBike({ paint: ph, stripe: pmeta.stripe || "gold" }); setPaint(TW.bike, ph, pmeta.stripe || "gold", pmeta.frameFinish || "Gloss black");
    addFastenerSets(TW.bike); TW.bike.updateMatrixWorld(true);
    TW.scene.add(buildHierarchy(TW.bike)); TW.root.updateMatrixWorld(true);
    TW.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (!o.userData.real) o.userData.real = o.material; } });
    snapshotAll(); TW.buildMs = Math.round(performance.now() - t0);
    TW.ctl = new T.OrbitControls(TW.cam, TW.rend.domElement);
    Object.assign(TW.ctl, { enableDamping: true, dampingFactor: .09, minDistance: .005, maxDistance: 7, screenSpacePanning: true, rotateSpeed: .8, enableZoom: true, zoomSpeed: .9, keys: {} });
    TW.ctl.addEventListener("change", () => { TW.need = true; TW.labelsDirty = true; });
    setCamBounds(); setView("iso", true);
    const ray = new T.Raycaster(), ptr = new T.Vector2(); let down = null;
    const hitAt = e => { const r = TW.rend.domElement.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, TW.cam);
      const hits = ray.intersectObject(TW.root, true).filter(h => h.object.visible && h.object.material && !(h.object.material.transparent && h.object.material.opacity < .3) && TW.byObj.has(h.object) && !h.object.isLineSegments);
      if (!hits.length) return null; const h0 = hits[0]; const nd = pickNode(h0.object, h0.instanceId); return nd ? { n: nd, point: h0.point } : null; };
    const cv = TW.rend.domElement, tip = stage.querySelector(".tip");
    cv.tabIndex = 0;
    let drag = null;
    cv.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY]; cv.focus({ preventScroll: true });
      if (TW.moveMode && e.button === 0) { const hit = hitAt(e); if (hit) { const T = THREE, normal = TW.cam.getWorldDirection(new T.Vector3()); drag = { n: hit.n, plane: new T.Plane().setFromNormalAndCoplanarPoint(normal, hit.point), p0: hit.point.clone(), o0: hit.n.lay && hit.n.lay.user ? hit.n.lay.user.clone() : new T.Vector3() }; TW.ctl.enabled = false; cv.setPointerCapture(e.pointerId); TW.sel = hit.n; refreshLook(); } } });
    cv.addEventListener("pointermove", e => { if (!drag) return; const r = cv.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, TW.cam);
      const q = ray.ray.intersectPlane(drag.plane, new THREE.Vector3()); if (q) setLayer(drag.n, "user", drag.o0.clone().add(q.sub(drag.p0))); });
    const endDrag = () => { if (!drag) return; const n = drag.n; drag = null; TW.ctl.enabled = true; TW.userMoved = TW.userMoved || new Set(); TW.userMoved.add(n); twinPanel(); };
    cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);
    /* trackpad & wheel: pinch = zoom, two-finger swipe = turn around the bike (Shift = slide), mouse wheel = zoom */
    const zoomAt = (cx, cy, amt) => { const T = THREE, r = cv.getBoundingClientRect(); ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, TW.cam);
      const hit = ray.intersectObject(TW.root, true).find(h => h.object.visible && h.object.isMesh && TW.byObj.has(h.object) && !(h.object.material.transparent && h.object.material.opacity < .3));
      const dTgt = TW.cam.position.distanceTo(TW.ctl.target), p = hit ? hit.point : ray.ray.at(dTgt, new T.Vector3());
      const toward = Math.max(-4, Math.min(.6, amt)); TW.cam.position.lerp(p, toward); TW.ctl.target.lerp(p, toward);
      if (TW.cam.position.distanceTo(TW.ctl.target) < .004) TW.ctl.target.copy(TW.cam.position).add(TW.cam.getWorldDirection(new T.Vector3()).multiplyScalar(.02));
      TW.cam.near = Math.max(.0015, Math.min(.05, TW.cam.position.distanceTo(p) / 120)); TW.cam.updateProjectionMatrix(); TW.need = true; TW.labelsDirty = true; };
    const orbitBy = (dx, dy) => { const T = THREE, off = TW.cam.position.clone().sub(TW.ctl.target), sp = new T.Spherical().setFromVector3(off);
      sp.theta -= dx * .0045; sp.phi = Math.max(.02, Math.min(Math.PI - .02, sp.phi - dy * .0045)); TW.cam.position.copy(TW.ctl.target).add(new T.Vector3().setFromSpherical(sp)); TW.cam.lookAt(TW.ctl.target); TW.need = true; TW.labelsDirty = true; };
    /* walk mode: you stand still and turn your head; the bike never spins */
    const lookBy = (dx, dy) => { const T = THREE, dir = TW.ctl.target.clone().sub(TW.cam.position), d = Math.max(.05, dir.length()), sp = new T.Spherical().setFromVector3(dir);
      sp.theta += dx * .0032; sp.phi = Math.max(.05, Math.min(Math.PI - .05, sp.phi - dy * .0032)); TW.ctl.target.copy(TW.cam.position).add(new T.Vector3().setFromSpherical(sp).setLength(d));
      TW.cam.lookAt(TW.ctl.target); TW.need = true; TW.labelsDirty = true; };
    TW.lookBy = lookBy;
    const applyNav = () => { TW.ctl.enableRotate = TW.nav === "orbit"; }; TW.applyNav = applyNav; applyNav();
    let look = null;
    cv.addEventListener("pointerdown", e => { if (TW.nav === "orbit" || TW.moveMode || e.button !== 0) return; look = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
    cv.addEventListener("pointermove", e => { if (!look || !(e.buttons & 1)) return; const dx = e.clientX - look.x, dy = e.clientY - look.y; look.x = e.clientX; look.y = e.clientY; if (dx || dy) { lookBy(dx, dy); TW.ctl.update(); } });
    const endLook = () => { look = null; }; cv.addEventListener("pointerup", endLook); cv.addEventListener("pointercancel", endLook); cv.addEventListener("pointerleave", endLook);
    const panBy = (dx, dy) => { const T = THREE, d = TW.cam.position.distanceTo(TW.ctl.target), k = d * Math.tan(T.MathUtils.degToRad(TW.cam.fov / 2)) * 2 / cv.clientHeight;
      const rgt = new T.Vector3().setFromMatrixColumn(TW.cam.matrix, 0), up = new T.Vector3().setFromMatrixColumn(TW.cam.matrix, 1), v = rgt.multiplyScalar(dx * k).add(up.multiplyScalar(-dy * k));
      TW.cam.position.add(v); TW.ctl.target.add(v); TW.need = true; TW.labelsDirty = true; };
    let padUntil = 0;
    stage.addEventListener("wheel", e => { if (e.target !== cv) return; e.preventDefault(); e.stopPropagation();
      const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1, dx = e.deltaX * lines, dy = e.deltaY * lines, now = performance.now();
      if (e.ctrlKey) { zoomAt(e.clientX, e.clientY, 1 - Math.exp(dy * .012)); return; } // pinch (Chrome, Edge, Firefox)
      const looksPad = e.deltaMode === 0 && (dx !== 0 || !Number.isInteger(dy) || Math.abs(dy) < 40); if (looksPad) padUntil = now + 600;
      if (now < padUntil) { if (e.shiftKey !== (TW.swipe === "pan")) panBy(dx, dy); else if (TW.nav === "orbit") orbitBy(dx, dy); else lookBy(-dx, -dy); return; }
      zoomAt(e.clientX, e.clientY, 1 - Math.exp(Math.sign(dy) * Math.min(Math.abs(dy), 120) * .0018)); }, { passive: false, capture: true });
    let gs = 1; // Safari trackpad pinch
    stage.addEventListener("gesturestart", e => { e.preventDefault(); gs = 1; }, { passive: false });
    stage.addEventListener("gesturechange", e => { e.preventDefault(); const k = e.scale / gs; gs = e.scale; zoomAt(e.clientX, e.clientY, 1 - 1 / k); }, { passive: false });
    stage.addEventListener("gestureend", e => e.preventDefault(), { passive: false });
    /* Alt/Option-click or F sets the point the camera turns around */
    const pivotAt = e => { const r = cv.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ptr, TW.cam);
      const hit = ray.intersectObject(TW.root, true).find(h => h.object.visible && h.object.isMesh && TW.byObj.has(h.object)); if (!hit) return false; const t0 = TW.ctl.target.clone(); anim(450, k => TW.ctl.target.lerpVectors(t0, hit.point, k), null, "pivot"); return true; };
    TW.lastPtr = null; cv.addEventListener("pointermove", e => { TW.lastPtr = e; });
    /* fly with the keyboard: W/S forward-back, A/D left-right, Q/E down-up, Shift = faster */
    const keys = new Set(); TW.keys = keys;
    cv.addEventListener("keydown", e => { const k = e.key.toLowerCase(); if (["w", "a", "s", "d", "q", "e", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift"].includes(k)) { keys.add(k); e.preventDefault(); }
      if (k === "f" && TW.lastPtr) pivotAt(TW.lastPtr); if (k === "escape") twinEscape(); });
    cv.addEventListener("keyup", e => keys.delete(e.key.toLowerCase())); cv.addEventListener("blur", () => keys.clear());
    TW.fly = dt => { if (!keys.size) return false; const T = THREE, f = TW.cam.getWorldDirection(new T.Vector3()), rgt = new T.Vector3().crossVectors(f, TW.cam.up).normalize(), up = new T.Vector3(0, 1, 0);
      const sp = Math.max(.15, TW.cam.position.distanceTo(TW.ctl.target)) * (keys.has("shift") ? 2.4 : .8) * dt / 1000, v = new T.Vector3();
      if (keys.has("w") || keys.has("arrowup")) v.add(f); if (keys.has("s") || keys.has("arrowdown")) v.sub(f); if (keys.has("d") || keys.has("arrowright")) v.add(rgt); if (keys.has("a") || keys.has("arrowleft")) v.sub(rgt); if (keys.has("e")) v.add(up); if (keys.has("q")) v.sub(up);
      if (!v.lengthSq()) return false; v.normalize().multiplyScalar(sp); TW.cam.position.add(v); TW.ctl.target.add(v); TW.labelsDirty = true; return true; };
    cv.addEventListener("pointerup", e => { if (TW.moveMode || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; if (e.altKey) { pivotAt(e); return; } const hit = hitAt(e); if (!hit) return;
      const top = focusTop(); if (top && hit.n === top.n) { tip.innerHTML = `<b>${esc(top.n.name)}</b><br>This is a single piece. Use Back to go up.`; return; } tip.hidden = true; focusInto(hit.n); });
    let lastMove = 0; cv.addEventListener("pointermove", e => { if (e.buttons) { tip.hidden = true; return; } const now = performance.now(); if (now - lastMove < 45) return; lastMove = now;
      const hit = hitAt(e), nd = hit ? hit.n : null; if (nd !== TW.hover) { TW.hover = nd; refreshLook(); } cv.style.cursor = nd ? (TW.moveMode ? "move" : "pointer") : "grab";
      if (nd) { const p = S.parts[nodePart(nd)]; tip.innerHTML = `<b>${esc(nd.name)}</b><br><span class="mono">${esc(nd.id)}</span><br>${p ? partPillPlain(p) : `<span class="faint">No inventory link</span>`}`;
        const r = stage.getBoundingClientRect(); tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 240) + "px"; tip.style.top = (e.clientY - r.top + 10) + "px"; tip.hidden = false; } else tip.hidden = true; });
    cv.addEventListener("pointerleave", () => { tip.hidden = true; if (TW.hover) { TW.hover = null; refreshLook(); } });
    TW.ro = new ResizeObserver(() => { if (!TW.el || !TW.el.isConnected || !TW.rend) return; const w2 = TW.el.clientWidth, h2 = TW.el.clientHeight; if (!w2 || !h2) return; TW.rend.setSize(w2, h2); TW.cam.aspect = w2 / h2; TW.cam.updateProjectionMatrix(); TW.need = true; TW.labelsDirty = true; }); TW.ro.observe(stage);
    let last = performance.now();
    const loop = now => { TW.raf = requestAnimationFrame(loop); const dt = Math.min(250, now - last); last = now;
      const animating = stepAnims(dt); const flew = TW.fly ? TW.fly(dt) : false; const moved = TW.ctl.update() || flew; if (moved || animating || TW.need) clampCam();
      if (TW.need || moved || animating) { TW.rend.render(TW.scene, TW.cam); TW.need = false; placeLabels(); } };
    TW.raf = requestAnimationFrame(loop);
    cv.addEventListener("webglcontextlost", e => { e.preventDefault(); if (TW.tearing || cv !== (TW.rend && TW.rend.domElement)) return; cancelAnimationFrame(TW.raf); TW.ok = false; toast("The 3D view ran out of graphics memory. Switch to Performance quality or close other tabs, then reload this page.", "err"); TW.forceFallback = true; render(true); });
    TW.swipe = lsGet("gs750.swipe", "orbit"); TW.ok = true; setQuality(TW.quality); setLighting(lsGet("gs750.light", "studio")); refreshLook(); return true;
  } catch (e) { console.warn("3D twin failed", e); TW.ok = false; return false; }
}
function select(n, o = {}) {
  TW.sel = n || null; if (!o.keepCtx) TW.ctx = n ? (n.parent || TW.bikeNode) : TW.bikeNode;
  refreshLook(); twinPanel(); updateLabels(); twinTreeSync(); if (n && o.fit) fitCamera(n);
}
function teardownTwin() { cancelAnimationFrame(TW.raf); if (TW.ro) TW.ro.disconnect(); TW.tearing = true; if (TW.rend) { TW.rend.dispose(); TW.rend.forceContextLoss && TW.rend.forceContextLoss(); }
  Object.assign(TW, { ok: false, rend: null, sel: null, hover: null, ctx: null, isolated: null, internalsOn: null, cleared: null, explodeNode: null, explodeK: 0, anims: [], internalsBuilt: false, userHidden: new Set(), focus: [] }); TW.tearing = false; TW.nodes.clear(); TW.byObj.clear(); TW.hidden.clear(); TW.ghosts.clear(); TW.moved.clear(); }
/* labels: only the children of the explode/selected node, numbered; never the whole bike */
function labelTargets() { if (!TW.labels) return []; const n = TW.explodeNode && TW.explodeK > 0 ? TW.explodeNode : (TW.sel && TW.sel.children.length ? TW.sel : TW.sel ? TW.sel.parent : TW.bikeNode); if (!n) return [];
  return n.children.filter(c => (c.obj || c.inst) && !c.hidden).slice(0, 30); }
function updateLabels() { TW.labelList = labelTargets(); const host = TW.el && TW.el.querySelector(".labels"); if (!host) return;
  host.innerHTML = TW.labelList.map((n, i) => `<button class="lbl3d" data-lb="${esc(n.id)}"><i>${i + 1}</i><span>${esc(TW.techIds ? n.id : n.name)}</span></button>`).join("");
  $$("[data-lb]", host).forEach(b => b.onclick = () => select(TW.nodes.get(b.dataset.lb), { keepCtx: true })); placeLabels(); }
function placeLabels() { const host = TW.el && TW.el.querySelector(".labels"); if (!host || !TW.labelList) return; const r = TW.rend.domElement.getBoundingClientRect(), btns = host.children;
  TW.labelList.forEach((n, i) => { const b = btns[i]; if (!b) return; const p = nodeCenter(n).project(TW.cam); const vis = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05;
    b.style.display = vis ? "" : "none"; b.style.transform = `translate(${((p.x + 1) / 2 * r.width).toFixed(1)}px,${((1 - p.y) / 2 * r.height).toFixed(1)}px)`; }); }

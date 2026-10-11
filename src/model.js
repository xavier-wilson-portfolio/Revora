/* ============ Procedural 1977 Suzuki GS750 model ============
   Built from simple shapes at roughly real proportions (wheelbase ~1.49 m, 19"/18" wire wheels, DOHC inline four,
   Mikuni VM26SS slide carbs, single front disc and single rear disc). It is a detailed representation, not factory CAD.
   Axes: +x forward, +y up, +z = rider's left. Units: metres. */
const PROTO = [
  ["frame", "Frame", "INV-0017", "Double-cradle steel frame that holds everything together."],
  ["stem", "Steering stem & triple clamps", "INV-0019", "Clamps the fork legs and turns on the steering-head bearings."],
  ["fork", "Front fork", "INV-0020", "Two telescopic legs with springs and oil that soak up bumps."],
  ["handlebar", "Handlebar & grips", "INV-0049", "Chrome bar, clamps and rubber grips."],
  ["controls", "Levers & control cables", "INV-0044", "Clutch and brake levers plus the throttle and clutch cables."],
  ["switches", "Handlebar switches", "INV-0037", "Lights, horn, turn signals, kill switch and starter button."],
  ["mcyl", "Front brake master cylinder", "INV-0028", "Turns lever squeeze into hydraulic pressure for the front brake."],
  ["wheelF", "Front wheel & hub", "INV-0022", "19-inch wire-spoke wheel: chrome rim, 36 spokes and the hub."],
  ["wheelR", "Rear wheel & hub", "INV-0023", "18-inch wire-spoke wheel and hub with the sprocket carrier."],
  ["tires", "Tires", "INV-0025", "Front and rear tires. Age matters as much as tread depth."],
  ["brakeF", "Front brake disc", "INV-0026", "The steel rotor the caliper squeezes."],
  ["caliper", "Front brake caliper", "INV-0029", "Holds the pads and piston that clamp the disc."],
  ["hoses", "Brake hose", "INV-0030", "Carries brake fluid from master cylinder to caliper."],
  ["brakeR", "Rear disc brake", "INV-0027", "Rear disc, caliper, torque rod and the rear master cylinder."],
  ["engine", "Cylinder block", "INV-0001", "The finned block with four cylinders. Part of the engine assembly."],
  ["head", "Cylinder head & cam cover", "INV-0002", "Valves, camshafts and the polished cam cover."],
  ["cases", "Crankcase & oil pan", "INV-0003", "Holds the crankshaft and gearbox; the oil pan sits underneath."],
  ["clutch", "Clutch cover", "INV-0008", "Right-side cover over the clutch basket and plates."],
  ["alt", "Alternator cover", "INV-0034", "Left-side cover over the charging system's generator."],
  ["starter", "Starter motor", "INV-0035", "Electric starter tucked behind the cylinders."],
  ["carbs", "Carburetor set", "INV-0011", "Four slide carburetors on a shared rack. They mix fuel and air."],
  ["boots", "Intake boots", "INV-0015", "Rubber boots that join the carbs to the cylinder head."],
  ["airbox", "Airbox & filter", "INV-0014", "Holds the air filter that feeds clean air to the carbs."],
  ["exhaust", "Exhaust system", "INV-0016", "Four header pipes into four chrome mufflers."],
  ["tank", "Fuel tank", "INV-0012", "Steel tank with filler cap and knee pads."],
  ["tap", "Fuel tap (petcock)", "INV-0013", "Turns fuel on and off and filters it on the way to the carbs."],
  ["seat", "Seat", "INV-0041", "Pleated two-up seat with chrome trim and grab rail."],
  ["coverL", "Left side cover", "INV-0047", "Painted cover over the left side of the battery area."],
  ["coverR", "Right side cover", "INV-0048", "Painted cover over the right side, near the airbox."],
  ["fenders", "Fenders", "INV-0040", "Chrome front and rear fenders with stays."],
  ["swingarm", "Swingarm", "INV-0018", "Pivots at the frame and carries the rear wheel."],
  ["shocks", "Rear shocks", "INV-0021", "Spring and damper units on each side of the swingarm."],
  ["chain", "Chain & sprockets", "INV-0031", "Drives the rear wheel from the gearbox output."],
  ["headlight", "Headlight", "INV-0038", "Round chrome headlight with mounting ears."],
  ["gauges", "Gauges", "INV-0036", "Speedometer, tachometer and indicator lights."],
  ["sigF", "Front turn signals", "INV-0039", "Amber front indicators on the headlight ears."],
  ["tail", "Tail light & rear signals", "INV-0039", "Brake/tail light, rear indicators and plate bracket."],
  ["harness", "Wiring harness", "INV-0032", "The main loom that connects every electrical part."],
  ["ignition", "Ignition (coils, leads, points)", "INV-0033", "Coils, spark plug leads and caps, and the points cover."],
  ["pegs", "Footrests, mirrors & stands", "INV-0045", "Footpegs, pedals, mirrors, side stand and center stand."],
];
const PAINTS = { "Candy blue": 0x1d3f8c, "Candy red": 0x8c1a1f, "Candy green": 0x1f5e3a, "Candy gold": 0x8a5e12, "Root beer brown": 0x4a2a17, "Silver metallic": 0xaeb3b8, "Gloss black": 0x101114, "Pearl white": 0xe9e6df };
const FRAMES = { "Gloss black": 0x0c0d0f, "Satin black": 0x1c1d20, "Silver": 0xb7bcc1, "Body color": null };
const STRIPES = { gold: "Gold pinstripe", white: "White pinstripe", black: "Black pinstripe", none: "No stripe" };
const GROUP_BLURB = Object.fromEntries(PROTO.map(p => [p[0], p[3]]));

function makeTexture(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }
function gaugeTexture(kind) {
  return makeTexture(256, 256, (g, w) => {
    const c = w / 2; g.fillStyle = "#101214"; g.beginPath(); g.arc(c, c, c, 0, 7); g.fill();
    g.strokeStyle = "#2a2e33"; g.lineWidth = 6; g.beginPath(); g.arc(c, c, c - 6, 0, 7); g.stroke();
    const n = kind === "tach" ? 10 : 14, a0 = Math.PI * .75, a1 = Math.PI * 2.25;
    for (let i = 0; i <= n * 2; i++) { const a = a0 + (a1 - a0) * i / (n * 2), big = i % 2 === 0; g.strokeStyle = "#e9edf0"; g.lineWidth = big ? 4 : 2; g.beginPath(); g.moveTo(c + Math.cos(a) * (c - 18), c + Math.sin(a) * (c - 18)); g.lineTo(c + Math.cos(a) * (c - (big ? 38 : 30)), c + Math.sin(a) * (c - (big ? 38 : 30))); g.stroke();
      if (big) { g.fillStyle = "#e9edf0"; g.font = "bold 20px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(kind === "tach" ? i / 2 : i / 2 * 10), c + Math.cos(a) * (c - 58), c + Math.sin(a) * (c - 58)); } }
    g.fillStyle = "#9aa3ab"; g.font = "13px sans-serif"; g.textAlign = "center"; g.fillText(kind === "tach" ? "x1000 r/min" : "MPH", c, c + 52);
    g.save(); g.translate(c, c); g.rotate(a0 + .35); g.fillStyle = "#ff5a2a"; g.fillRect(-3, -3, c - 34, 6); g.restore(); g.fillStyle = "#30353a"; g.beginPath(); g.arc(c, c, 12, 0, 7); g.fill();
  });
}
function surfaceNoise() { if (surfaceNoise.t) return surfaceNoise.t; const t = makeTexture(256, 256, (g, w, h) => { const id = g.createImageData(w, h); for (let i = 0; i < w * h; i++) { const v = 150 + Math.random() * 70 | 0; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } g.putImageData(id, 0, 0); }); t.encoding = THREE.LinearEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return (surfaceNoise.t = t); }
function treadTexture() { const t = makeTexture(64, 256, (g, w, h) => { g.fillStyle = "#808080"; g.fillRect(0, 0, w, h); g.fillStyle = "#202020"; for (let y = 0; y < h; y += 1) { const v = y / h; if (v < .18 || v > .82) { if ((y % 16) < 5) g.fillRect(0, y, w, 1); g.fillRect(28 + Math.sin(y / 6) * 8, y, 4, 1); } } }); t.encoding = THREE.LinearEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(30, 1); t.rotation = 0; return t; }
function chainTexture() { const t = makeTexture(64, 16, (g) => { g.fillStyle = "#3c3f43"; g.fillRect(0, 0, 64, 16); g.fillStyle = "#8d9399"; for (let x = 0; x < 64; x += 16) { g.fillRect(x + 1, 3, 12, 10); g.fillStyle = "#24272a"; g.fillRect(x + 6, 0, 3, 16); g.fillStyle = "#8d9399"; } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(160, 1); return t; }
function tankTexture(hex, stripe = "gold") {
  const col = "#" + hex.toString(16).padStart(6, "0");
  return makeTexture(1024, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, "rgba(255,255,255,.10)"); grd.addColorStop(.5, "rgba(255,255,255,0)"); grd.addColorStop(1, "rgba(0,0,0,.18)"); g.fillStyle = grd; g.fillRect(0, 0, w, h);
    if (stripe === "none") return; const sc = stripe === "white" ? "#f4f2ec" : stripe === "black" ? "#16171a" : "#d8b25a";
    g.fillStyle = sc; [.47, .505].forEach(v => g.fillRect(0, h * v, w, h * .012)); g.fillStyle = stripe === "gold" ? "#f2efe8" : sc; g.fillRect(0, h * .482, w, h * .016); });
}

function buildBike(opts = {}) {
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
  const T = THREE, U = THREE.BufferGeometryUtils, V3 = (x, y, z) => new T.Vector3(x, y, z);
  const paintHex = opts.paint ?? PAINTS["Candy blue"], stripe = opts.stripe || "gold";
  const M = {
    chrome: new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .07, name: "chrome" }),
    steel: new T.MeshStandardMaterial({ color: 0xd6d9dc, metalness: .95, roughness: .22, name: "steel" }),
    rotor: new T.MeshStandardMaterial({ color: 0xa9adb1, metalness: .9, roughness: .38, name: "rotor" }),
    alu: new T.MeshStandardMaterial({ color: 0xe2e2df, metalness: 1, roughness: .18, name: "polished aluminium" }),
    cast: new T.MeshStandardMaterial({ color: 0xa9a59c, metalness: .72, roughness: .52, name: "cast aluminium" }),
    castDark: new T.MeshStandardMaterial({ color: 0x77736c, metalness: .65, roughness: .55, name: "dark casting" }),
    frame: new T.MeshPhysicalMaterial({ color: 0x0c0d0f, metalness: .25, roughness: .32, clearcoat: 1, clearcoatRoughness: .12, name: "gloss black" }),
    satin: new T.MeshStandardMaterial({ color: 0x1c1d20, metalness: .35, roughness: .6, name: "satin black" }),
    rubber: new T.MeshStandardMaterial({ color: 0x161616, metalness: 0, roughness: .93, name: "rubber" }),
    vinyl: new T.MeshPhysicalMaterial({ color: 0x141414, metalness: 0, roughness: .48, clearcoat: .35, clearcoatRoughness: .45, name: "vinyl" }),
    paint: new T.MeshPhysicalMaterial({ color: paintHex, metalness: .45, roughness: .26, clearcoat: 1, clearcoatRoughness: .03, name: "paint" }),
    tank: new T.MeshPhysicalMaterial({ color: 0xffffff, map: tankTexture(paintHex, stripe), metalness: .45, roughness: .26, clearcoat: 1, clearcoatRoughness: .03, name: "tank paint" }),
    glass: new T.MeshPhysicalMaterial({ color: 0xf2f7fb, metalness: 0, roughness: .03, transparent: true, opacity: .35, clearcoat: 1, name: "glass" }),
    amber: new T.MeshPhysicalMaterial({ color: 0xff9a1f, emissive: 0x5a2a00, roughness: .15, clearcoat: 1, transparent: true, opacity: .92, name: "amber lens" }),
    red: new T.MeshPhysicalMaterial({ color: 0xc01622, emissive: 0x3a0005, roughness: .15, clearcoat: 1, transparent: true, opacity: .93, name: "red lens" }),
    white: new T.MeshStandardMaterial({ color: 0xf4f4f2, metalness: .2, roughness: .4, name: "plate" }),
    tire: new T.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .9, metalness: 0, bumpMap: treadTexture(), bumpScale: .004, name: "tire" }),
    chainM: new T.MeshStandardMaterial({ color: 0xffffff, map: chainTexture(), metalness: .8, roughness: .45, name: "chain" }),
    speedo: new T.MeshStandardMaterial({ map: gaugeTexture("speedo"), roughness: .4, name: "speedo face" }),
    tach: new T.MeshStandardMaterial({ map: gaugeTexture("tach"), roughness: .4, name: "tach face" }),
    glow: new T.MeshStandardMaterial({ color: 0x9fd3ff, emissive: 0x3d6f9a, roughness: .2, name: "indicator" }),
    green: new T.MeshStandardMaterial({ color: 0x5fe08a, emissive: 0x1f6b39, roughness: .2, name: "indicator" }),
    reflector: new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .02, name: "reflector" }),
    zinc: new T.MeshStandardMaterial({ color: 0xc9ccc4, metalness: .95, roughness: .3, name: "zinc-plated steel" }),
  };
  { const nz = surfaceNoise(); [M.cast, M.castDark].forEach(m => { m.roughnessMap = nz; m.bumpMap = nz; m.bumpScale = .0006; }); [M.rubber, M.vinyl].forEach(m => { m.bumpMap = nz; m.bumpScale = .0003; }); M.frame.bumpMap = nz; M.frame.bumpScale = .00008; }
  const root = new T.Group(); root.name = "GS750"; const G = {};
  PROTO.forEach(([k, label, pid]) => { const g = new T.Group(); g.name = k; g.userData = { key: k, label, partId: pid }; G[k] = g; root.add(g); });
  const add = (k, geo, mat, o = {}) => { const m = new T.Mesh(geo, mat); if (o.p) m.position.copy(o.p); if (o.r) m.rotation.set(o.r[0], o.r[1], o.r[2]); if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]); m.name = o.name || ""; m.castShadow = true; m.receiveShadow = true; (o.parent || G[k]).add(m); return m; };
  const lathe = (pts, seg = 48) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(Math.max(r, 0.0001), y)), seg);
  const latheZ = (pts, seg) => lathe(pts, seg).rotateX(Math.PI / 2); // axis -> +z
  const latheX = (pts, seg) => lathe(pts, seg).rotateZ(-Math.PI / 2); // axis -> +x
  const curve = (pts, closed = false) => new T.CatmullRomCurve3(pts, closed, "centripetal");
  const tube = (pts, r, seg = 48, closed = false, rs = 12) => new T.TubeGeometry(curve(pts, closed), seg, r, rs, closed);
  const rbox = (w, h, d, r = .006, s = 3) => new T.RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const between = (a, b, r, rs = 10) => { const d = b.clone().sub(a), g = new T.CylinderGeometry(r, r, d.length(), rs, 1, true); const q = new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.clone().normalize()); g.applyQuaternion(q); const mid = a.clone().add(b).multiplyScalar(.5); g.translate(mid.x, mid.y, mid.z); return g; };
  const rodMesh = (k, a, b, r, mat, name) => add(k, between(a, b, r, 14), mat, { name });
  const merge = geos => U.mergeBufferGeometries(geos.map(g => g.index ? g.toNonIndexed() : g), false);
  const roundRectShape = (w, h, r) => { const s = new T.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
  const ZC = [-.132, -.044, .044, .132]; // cylinder centre lines (right to left)
  const WF = V3(.745, .333, 0), WR = V3(-.745, .333, 0);

  /* ---------- wheels, tires, hubs ---------- */
  function wheel(k, c, rimR, front) {
    add(k, latheZ([[rimR - .004, -.036], [rimR + .012, -.038], [rimR + .014, -.031], [rimR + .003, -.024], [rimR - .006, 0], [rimR + .003, .024], [rimR + .014, .031], [rimR + .012, .038], [rimR - .004, .036], [rimR - .014, 0], [rimR - .004, -.036]], 96), M.chrome, { p: c, name: "Chrome rim" });
    const hubR = front ? .055 : .062, fl = front ? .036 : .045;
    add(k, latheZ(front ? [[0, -.075], [.02, -.075], [.03, -.06], [.062, -.04], [.065, -.034], [.05, -.03], [.045, 0], [.05, .03], [.065, .034], [.062, .04], [.03, .06], [.02, .075], [0, .075]]
      : [[0, -.08], [.02, -.08], [.03, -.065], [.07, -.045], [.073, -.04], [.055, -.035], [.05, 0], [.058, .035], [.075, .042], [.072, .05], [.03, .07], [0, .07]], 48), M.cast, { p: c, name: front ? "Front hub" : "Rear hub" });
    const spokes = []; for (let i = 0; i < 36; i++) { const s = i % 2 ? 1 : -1, ah = i / 36 * Math.PI * 2, ar = ah + s * .62 * (i % 4 < 2 ? 1 : -1);
      spokes.push(between(V3(c.x + Math.cos(ah) * (hubR - .004), c.y + Math.sin(ah) * (hubR - .004), s * fl), V3(c.x + Math.cos(ar) * (rimR - .01), c.y + Math.sin(ar) * (rimR - .01), s * .008), .0019, 6)); }
    add(k, merge(spokes), M.steel, { name: "36 steel spokes" });
    add(k, latheZ([[0, -.1], [.012, -.1], [.012, .1], [0, .1]], 16), M.steel, { p: c, name: "Axle" });
    [-1, 1].forEach(s => add(k, new T.CylinderGeometry(.018, .018, .016, 6).rotateX(Math.PI / 2), M.chrome, { p: V3(c.x, c.y, s * .105), name: "Axle nut" }));
  }
  wheel("wheelF", WF, .243, true); wheel("wheelR", WR, .229, false);
  add("tires", new T.TorusGeometry(.287, .047, 28, 120), M.tire, { p: WF, name: "Front tire (3.25-19 size class)" });
  add("tires", new T.TorusGeometry(.28, .054, 28, 120), M.tire, { p: WR, name: "Rear tire (4.00-18 size class)" });

  /* ---------- brakes ---------- */
  add("brakeF", latheZ([[.088, -.0035], [.142, -.0035], [.142, .0035], [.088, .0035], [.088, -.0035]], 96), M.rotor, { p: V3(WF.x, WF.y, -.078), name: "Brake disc" });
  add("brakeF", latheZ([[.05, -.006], [.09, -.006], [.09, .006], [.05, .006], [.05, -.006]], 48), M.cast, { p: V3(WF.x, WF.y, -.072), name: "Disc carrier" });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add("brakeF", new T.CylinderGeometry(.006, .006, .012, 6).rotateX(Math.PI / 2), M.chrome, { p: V3(WF.x + Math.cos(a) * .07, WF.y + Math.sin(a) * .07, -.084), name: "Disc bolt" }); }
  const calP = V3(WF.x - .1, WF.y + .095, -.078);
  add("caliper", rbox(.085, .055, .05, .012), M.cast, { p: calP, r: [0, 0, .75], name: "Caliper body" });
  add("caliper", new T.CylinderGeometry(.021, .021, .02, 24).rotateX(Math.PI / 2), M.castDark, { p: V3(calP.x, calP.y, -.106), name: "Caliper piston housing" });
  add("caliper", new T.CylinderGeometry(.004, .004, .016, 8), M.chrome, { p: V3(calP.x - .012, calP.y + .034, -.078), name: "Bleed nipple" });
  const rdc = V3(WR.x, WR.y, -.088);
  add("brakeR", latheZ([[.085, -.0035], [.146, -.0035], [.146, .0035], [.085, .0035], [.085, -.0035]], 96), M.rotor, { p: rdc, name: "Rear brake disc" });
  add("brakeR", latheZ([[.05, -.006], [.088, -.006], [.088, .006], [.05, .006], [.05, -.006]], 48), M.cast, { p: V3(WR.x, WR.y, -.08), name: "Rear disc carrier" });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add("brakeR", new T.CylinderGeometry(.006, .006, .012, 6).rotateX(Math.PI / 2), M.chrome, { p: V3(WR.x + Math.cos(a) * .068, WR.y + Math.sin(a) * .068, -.094), name: "Disc bolt" }); }
  const rcal = V3(WR.x + .045, WR.y + .128, -.088);
  add("brakeR", rbox(.08, .05, .05, .012), M.cast, { p: rcal, r: [0, 0, -.35], name: "Rear caliper" });
  add("brakeR", rbox(.12, .02, .008, .004), M.castDark, { p: V3(WR.x + .02, WR.y + .07, -.115), r: [0, 0, 1.1], name: "Caliper bracket" });
  add("brakeR", tube([V3(rcal.x + .03, rcal.y - .01, -.115), V3(-.5, .4, -.13), V3(-.42, .37, -.13)], .005, 20), M.satin, { name: "Torque rod" });
  add("brakeR", tube([V3(rcal.x, rcal.y + .025, -.09), V3(-.6, .5, -.14), V3(-.3, .4, -.15), V3(-.12, .33, -.16)], .0045, 50), M.rubber, { name: "Rear brake hose" });
  add("brakeR", latheY([[0, 0], [.016, 0], [.016, .04], [.012, .046], [0, .046]]), M.cast, { p: V3(-.12, .3, -.165), name: "Rear master cylinder" });

  /* ---------- fork & steering ---------- */
  const FT = V3(.455, 1.03, 0), dUp = FT.clone().sub(WF).normalize(), ang = Math.atan2(-dUp.x, dUp.y);
  [-1, 1].forEach(s => {
    const top = V3(FT.x, FT.y, s * .105), mid = top.clone().sub(dUp.clone().multiplyScalar(.33)), bot = V3(WF.x, WF.y + .01, s * .105);
    add("fork", between(top.clone().add(dUp.clone().multiplyScalar(.01)), mid.clone().sub(dUp.clone().multiplyScalar(.04)), .0185, 24), M.chrome, { name: s > 0 ? "Left fork tube" : "Right fork tube" });
    const sl = lathe([[.0001, 0], [.029, 0], [.031, .02], [.028, .06], [.026, .3], [.0265, .33], [.021, .335], [.0001, .335]], 32);
    const m = add("fork", sl, M.cast, { p: bot, name: s > 0 ? "Left fork slider" : "Right fork slider" }); m.rotation.z = ang;
    add("fork", new T.SphereGeometry(.03, 20, 12), M.cast, { p: V3(WF.x, WF.y, s * .105), s: [1, 1, .8], name: "Axle lug" });
    add("fork", latheY([[0, 0], [.021, 0], [.021, .012], [.012, .02], [0, .02]]), M.chrome, { p: top.clone().add(dUp.clone().multiplyScalar(.01)), r: [0, 0, ang], name: "Fork cap" });
    add("fenders", tube([bot.clone().add(V3(-.03, .1, s * .02)), V3(WF.x - .02, WF.y + .2, s * .07), V3(WF.x + .05, WF.y + .29, s * .06)], .0045, 20), M.chrome, { name: "Fender stay" });
  });
  function latheY(pts) { return lathe(pts, 32); }
  [[.0, "Top triple clamp"], [.155, "Bottom triple clamp"]].forEach(([d, nm]) => { const p = FT.clone().sub(dUp.clone().multiplyScalar(d + .02)); add("stem", rbox(.075, .028, .29, .012), d ? M.cast : M.alu, { p, r: [0, 0, ang], name: nm }); });
  add("stem", new T.CylinderGeometry(.016, .016, .02, 6), M.chrome, { p: FT.clone().add(V3(-.04, .002, 0)), r: [0, 0, ang], name: "Steering stem nut" });
  [-1, 1].forEach(s => add("stem", rbox(.03, .02, .04, .006), M.chrome, { p: FT.clone().add(V3(-.035, .03, s * .045)), name: "Handlebar clamp" }));

  /* ---------- frame ---------- */
  const HT = V3(.42, .972, 0), HB = V3(.478, .833, 0);
  add("frame", between(HT.clone().add(dUp.clone().multiplyScalar(.015)), HB.clone().sub(dUp.clone().multiplyScalar(.015)), .029, 24), M.frame, { name: "Steering head" });
  [-1, 1].forEach(s => {
    add("frame", tube([V3(HT.x - .01, HT.y - .01, s * .03), V3(.25, .93, s * .065), V3(0, .875, s * .1), V3(-.27, .838, s * .115), V3(-.6, .83, s * .105), V3(-.86, .84, s * .08), V3(-.91, .842, s * .02)], .016, 80), M.frame, { name: "Top tube / seat rail" });
    add("frame", tube([V3(HB.x - .005, HB.y, s * .035), V3(.47, .65, s * .07), V3(.41, .36, s * .1), V3(.35, .2, s * .11), V3(.22, .135, s * .115), V3(-.12, .135, s * .12), V3(-.22, .2, s * .12), V3(-.25, .38, s * .12), V3(-.27, .838, s * .115)], .017, 120), M.frame, { name: "Down tube / cradle" });
    add("frame", tube([V3(-.25, .47, s * .12), V3(-.45, .63, s * .115), V3(-.66, .805, s * .108)], .014, 30), M.frame, { name: "Shock stay" });
    add("frame", rbox(.08, .07, .006, .01), M.frame, { p: V3(.3, .46, s * .105), name: "Engine mount plate" });
  });
  add("frame", between(V3(-.91, .842, -.02), V3(-.91, .842, .02), .016), M.frame, { name: "Rear loop" });
  [[-.27, .838, .115], [-.66, .805, .108], [.3, .18, .11], [-.15, .135, .12], [.0, .875, .1]].forEach(([x, y, w]) => add("frame", between(V3(x, y, -w), V3(x, y, w), .012), M.frame, { name: "Cross member" }));
  add("frame", rbox(.11, .05, .008, .01), M.frame, { p: V3(.42, .88, 0), r: [0, 0, -.6], name: "Head gusset" });

  /* ---------- swingarm, shocks, chain ---------- */
  const SP = V3(-.25, .4, 0);
  [-1, 1].forEach(s => { const a = V3(SP.x, SP.y, s * .125), b = V3(WR.x + .02, WR.y, s * .125), d = b.clone().sub(a);
    add("swingarm", rbox(d.length(), .046, .026, .009), M.frame, { p: a.clone().add(b).multiplyScalar(.5), r: [0, 0, Math.atan2(d.y, d.x)], name: s > 0 ? "Left swingarm leg" : "Right swingarm leg" });
    add("swingarm", rbox(.05, .03, .03, .006), M.chrome, { p: V3(WR.x + .045, WR.y + .002, s * .125), name: "Chain adjuster" });
    const L = V3(-.64, .372, s * .14), Up = V3(-.672, .80, s * .125), dir = Up.clone().sub(L), len = dir.length(), q = new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize());
    const sh = new T.Group(); sh.position.copy(L); sh.quaternion.copy(q); G.shocks.add(sh);
    add("shocks", new T.TorusGeometry(.016, .007, 10, 20).rotateY(Math.PI / 2), M.castDark, { parent: sh, name: "Lower eye" });
    add("shocks", lathe([[0, .012], [.02, .012], [.02, .26], [0, .26]]), M.chrome, { parent: sh, name: "Damper body" });
    add("shocks", lathe([[0, .25], [.031, .25], [.031, .33], [.027, .345], [0, .345]]), M.chrome, { parent: sh, name: "Spring cover" });
    add("shocks", lathe([[.02, .045], [.036, .045], [.036, .053], [.02, .053]]), M.chrome, { parent: sh, name: "Spring seat" });
    const hp = []; for (let i = 0; i <= 260; i++) { const t = i / 260; hp.push(V3(Math.cos(t * Math.PI * 2 * 9) * .029, .055 + t * .19, Math.sin(t * Math.PI * 2 * 9) * .029)); }
    add("shocks", tube(hp, .0042, 520, false, 8), M.chrome, { parent: sh, name: "Coil spring" });
    add("shocks", new T.TorusGeometry(.016, .007, 10, 20).rotateY(Math.PI / 2), M.castDark, { parent: sh, p: V3(0, len, 0), name: "Upper eye" });
  });
  add("swingarm", between(V3(SP.x, SP.y, -.14), V3(SP.x, SP.y, .14), .022, 20), M.frame, { name: "Pivot tube" });
  add("swingarm", between(V3(-.33, .385, -.125), V3(-.33, .385, .125), .014), M.frame, { name: "Cross brace" });
  const sprocket = (teeth, r, holes) => { const sh = new T.Shape(); for (let i = 0; i <= teeth * 4; i++) { const a = i / (teeth * 4) * Math.PI * 2, rr = (i % 4 === 1 || i % 4 === 2) ? r : r - .007; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    if (holes) for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2, h = new T.Path(); h.absarc(Math.cos(a) * r * .55, Math.sin(a) * r * .55, r * .17, 0, Math.PI * 2, true); sh.holes.push(h); }
    const h = new T.Path(); h.absarc(0, 0, r * .25, 0, Math.PI * 2, true); sh.holes.push(h); return new T.ExtrudeGeometry(sh, { depth: .006, bevelEnabled: false, curveSegments: 6 }); };
  const FS = V3(-.13, .3, .155);
  add("chain", sprocket(15, .043, false), M.steel, { p: FS, name: "Front sprocket" });
  add("chain", sprocket(41, .108, true), M.steel, { p: V3(WR.x, WR.y, .155), name: "Rear sprocket" });
  { const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; pts.push([FS.x + Math.cos(a) * .047, FS.y + Math.sin(a) * .047], [WR.x + Math.cos(a) * .112, WR.y + Math.sin(a) * .112]); }
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], hi = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1)).map(([x, y]) => V3(x, y, .158));
    add("chain", new T.TubeGeometry(new T.CatmullRomCurve3(hull, true, "catmullrom", .2), 400, .0062, 6, true), M.chainM, { name: "Drive chain" }); }
  add("chain", rbox(.12, .07, .012, .02), M.castDark, { p: V3(-.13, .31, .2), name: "Sprocket cover" });

  /* ---------- engine ---------- */
  const th = .2, B0 = V3(.11, .47, 0);
  const bank = new T.Group(); bank.position.copy(B0); bank.rotation.z = -th; root.add(bank);
  const bankB = new T.Group(); bankB.position.copy(B0); bankB.rotation.z = -th; G.engine.add(bankB);
  const bankH = new T.Group(); bankH.position.copy(B0); bankH.rotation.z = -th; G.head.add(bankH); root.remove(bank);
  const finGeo = (w, d, r) => new T.ExtrudeGeometry(roundRectShape(w, d, r), { depth: .0034, bevelEnabled: false, curveSegments: 4 }).rotateX(-Math.PI / 2);
  const fins = []; for (let i = 0; i < 10; i++) { const g = finGeo(.235 - (i % 2) * .004, .40, .035); g.translate(0, .012 + i * .0158, 0); fins.push(g); }
  add("engine", merge(fins), M.cast, { parent: bankB, name: "Cooling fins" });
  add("engine", rbox(.16, .17, .37, .01), M.castDark, { parent: bankB, p: V3(0, .085, 0), name: "Block core" });
  ZC.forEach((z, i) => add("engine", new T.CylinderGeometry(.037, .037, .168, 24), M.cast, { parent: bankB, p: V3(0, .085, z), name: "Cylinder barrel " + (i + 1) }));
  const hf = []; for (let i = 0; i < 5; i++) { const g = finGeo(.25, .41, .04); g.translate(0, .185 + i * .015, 0); hf.push(g); }
  add("head", merge(hf), M.cast, { parent: bankH, name: "Head fins" });
  add("head", rbox(.19, .09, .385, .012), M.castDark, { parent: bankH, p: V3(0, .22, 0), name: "Cylinder head" });
  add("head", rbox(.175, .05, .37, .018, 4), M.alu, { parent: bankH, p: V3(-.005, .285, 0), name: "Cam cover (polished)" });
  for (let i = 0; i < 12; i++) add("head", new T.CylinderGeometry(.0045, .0045, .008, 6), M.chrome, { parent: bankH, p: V3(i % 2 ? .07 : -.08, .313, -.16 + Math.floor(i / 2) * .064), name: "Cam cover bolt" });
  [-1, 1].forEach(s => add("head", latheY([[0, 0], [.04, 0], [.04, .005], [.028, .011], [0, .012]]).rotateX(s * Math.PI / 2), M.alu, { parent: bankH, p: V3(-.005, .285, s * .185), name: "Cam end cap" }));
  const toW = (lx, ly, z) => V3(B0.x + lx * Math.cos(th) + ly * Math.sin(th), B0.y - lx * Math.sin(th) + ly * Math.cos(th), z);
  { const s = new T.Shape(); s.moveTo(.3, .3); s.quadraticCurveTo(.325, .43, .22, .47); s.lineTo(-.1, .47); s.quadraticCurveTo(-.2, .47, -.245, .4); s.lineTo(-.255, .28); s.quadraticCurveTo(-.245, .2, -.14, .19); s.lineTo(.2, .19); s.quadraticCurveTo(.3, .2, .3, .3);
    add("cases", new T.ExtrudeGeometry(s, { depth: .38, bevelEnabled: true, bevelThickness: .014, bevelSize: .012, bevelSegments: 4, curveSegments: 18 }).translate(0, 0, -.19), M.cast, { name: "Crankcase halves" }); }
  add("cases", rbox(.36, .05, .3, .012), M.castDark, { p: V3(.04, .165, 0), name: "Oil pan" });
  for (let i = 0; i < 6; i++) add("cases", rbox(.3, .012, .004, .002), M.castDark, { p: V3(.04, .138, -.12 + i * .048), name: "Oil pan fin" });
  add("cases", latheX([[0, 0], [.042, 0], [.044, .012], [.036, .03], [0, .032]]), M.alu, { p: V3(.305, .23, 0), name: "Oil filter cover" });
  add("cases", new T.CylinderGeometry(.008, .008, .02, 8).rotateZ(Math.PI / 2), M.chrome, { p: V3(.19, .135, .05), name: "Drain plug" });
  add("cases", latheY([[0, 0], [.024, 0], [.024, .02], [.02, .03], [0, .03]]), M.castDark, { p: V3(-.17, .47, .1), name: "Oil filler cap" });
  add("alt", latheZ([[0, 0], [.104, 0], [.108, .008], [.104, .022], [.08, .032], [.03, .037], [0, .038]], 64), M.alu, { p: V3(.087, .357, .2), name: "Alternator cover" });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add("alt", new T.CylinderGeometry(.005, .005, .01, 6).rotateX(Math.PI / 2), M.chrome, { p: V3(.087 + Math.cos(a) * .09, .357 + Math.sin(a) * .09, .24), name: "Cover screw" }); }
  add("clutch", latheZ([[0, 0], [.128, 0], [.132, .01], [.127, .03], [.1, .05], [.04, .06], [0, .061]], 64).rotateX(Math.PI), M.alu, { p: V3(-.085, .335, -.2), s: [1, .88, 1], name: "Clutch cover" });
  add("ignition", latheZ([[0, 0], [.05, 0], [.052, .008], [.045, .022], [0, .026]], 40).rotateX(Math.PI), M.alu, { p: V3(.087, .357, -.205), name: "Points cover" });
  add("starter", new T.CylinderGeometry(.036, .036, .19, 28).rotateX(Math.PI / 2), M.satin, { p: V3(-.05, .515, .04), name: "Starter motor" });
  add("starter", latheZ([[0, 0], [.037, 0], [.037, .01], [.02, .02], [0, .02]]), M.chrome, { p: V3(-.05, .515, .135), name: "Starter end cap" });
  add("starter", rbox(.13, .03, .22, .01), M.alu, { p: V3(-.06, .48, 0), name: "Starter cover" });

  /* ---------- carburetors, boots, airbox ---------- */
  const CX = -.085, CY = .632;
  ZC.forEach((z, i) => { const n = i + 1;
    add("carbs", latheY([[.0001, -.035], [.029, -.035], [.031, -.02], [.031, .03], [.0001, .03]]), M.cast, { p: V3(CX, CY, z), name: `Carb ${n}: body` });
    add("carbs", latheY([[.0001, 0], [.033, 0], [.033, .01], [.026, .017], [.008, .019], [.008, .03], [.0001, .03]]), M.alu, { p: V3(CX, CY + .03, z), name: `Carb ${n}: slide cap` });
    add("carbs", latheX([[.021, -.06], [.024, -.06], [.024, .05], [.021, .05]], 32), M.cast, { p: V3(CX, CY - .005, z), name: `Carb ${n}: venturi` });
    add("carbs", rbox(.056, .04, .052, .012), M.cast, { p: V3(CX - .004, CY - .056, z), name: `Carb ${n}: float bowl` });
    add("carbs", latheX([[.022, 0], [.024, 0], [.031, -.025], [.027, -.028], [.02, -.004]], 32), M.alu, { p: V3(CX - .062, CY - .005, z), name: `Carb ${n}: bell mouth` });
    add("carbs", new T.CylinderGeometry(.004, .004, .012, 8), M.chrome, { p: V3(CX - .004, CY - .082, z), name: `Carb ${n}: drain screw` });
    add("boots", latheX([[.026, 0], [.03, .006], [.026, .012], [.03, .018], [.026, .024], [.03, .03], [.026, .036], [.026, .07]], 32), M.rubber, { p: V3(CX + .025, CY - .002, z), r: [0, 0, -.12], name: `Intake boot ${n}` });
  });
  add("carbs", rbox(.012, .01, .34, .003), M.alu, { p: V3(CX + .02, CY + .03, 0), name: "Carb rack (upper)" });
  add("carbs", rbox(.012, .01, .34, .003), M.alu, { p: V3(CX - .03, CY - .03, 0), name: "Carb rack (lower)" });
  add("carbs", between(V3(CX + .028, CY - .005, -.19), V3(CX + .028, CY - .005, .2), .0035), M.chrome, { name: "Throttle shaft" });
  add("carbs", latheZ([[0, 0], [.022, 0], [.022, .008], [0, .008]], 28), M.alu, { p: V3(CX + .028, CY - .005, .2), name: "Throttle pulley" });
  add("carbs", tube([V3(CX - .01, CY - .07, -.132), V3(CX - .01, CY - .078, 0), V3(CX - .01, CY - .07, .132)], .0035, 30), M.rubber, { name: "Fuel feed line" });
  add("airbox", rbox(.17, .17, .27, .035), M.satin, { p: V3(-.26, .655, 0), name: "Airbox housing" });
  add("airbox", rbox(.12, .012, .2, .005), M.satin, { p: V3(-.26, .745, 0), name: "Filter lid" });
  ZC.forEach(z => add("airbox", latheX([[.028, 0], [.03, -.02], [.032, -.04]], 24), M.rubber, { p: V3(CX - .085, CY - .005, z), name: "Airbox boot" }));

  /* ---------- exhaust: 4 headers, 4 mufflers ---------- */
  ZC.forEach((z, i) => { const outer = Math.abs(z) > .1, s = Math.sign(z), zo = s * (outer ? .218 : .208), lift = outer ? 0 : .085, port = toW(.098, .205, z);
    add("exhaust", latheX([[.026, 0], [.03, 0], [.03, .012], [.026, .012]], 24), M.chrome, { p: port, r: [0, 0, -th * .5], name: `Header flange ${i + 1}` });
    add("exhaust", tube([port, V3(.33, .6, z), V3(.39, .48, z * 1.05), V3(.405, .33, z * 1.1 + s * .01), V3(.34, .21 + lift * .3, zo * .93), V3(.17, .18 + lift * .6, zo), V3(0, .2 + lift, zo), V3(-.11, .235 + lift, zo)], .0185, 140, false, 16), M.chrome, { name: `Header pipe ${i + 1}` });
    const mf = new T.Group(); mf.position.set(-.11, .235 + lift, zo); mf.rotation.z = Math.atan2(.075, -.6); G.exhaust.add(mf);
    add("exhaust", latheX([[.019, 0], [.03, .03], [.046, .08], [.052, .2], [.055, .52], [.053, .56], [.045, .6], [.03, .605], [.0001, .606]], 48), M.chrome, { parent: mf, name: `Muffler ${i + 1}` });
    add("exhaust", latheX([[.012, .6], [.016, .6], [.016, .63], [.012, .63]], 20), M.satin, { parent: mf, name: `Tailpipe ${i + 1}` });
  });
  [-1, 1].forEach(s => add("exhaust", rbox(.07, .09, .006, .01), M.chrome, { p: V3(-.42, .33, s * .2), r: [0, 0, .3], name: "Muffler bracket" }));

  /* ---------- tank & petcock ---------- */
  { const g = new T.SphereGeometry(1, 96, 48), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (y < 0) { y *= .42; z *= .92 + .08 * (1 + y); } if (x < 0) { z *= 1 - .32 * -x; y *= 1 - .22 * -x; }
      const knee = Math.exp(-(((x + .42) / .2) ** 2)) * Math.exp(-((y / .45) ** 2)); z *= 1 - .09 * knee * (Math.abs(z) > .5 ? 1 : 0);
      if (y > 0 && Math.abs(z) < .35) y += .03 * (1 - Math.abs(z) / .35) * (x > -.4 ? 1 : 0);
      p.setXYZ(i, x * .29, y * .15, z * .168); }
    g.computeVertexNormals(); add("tank", g, M.tank, { p: V3(.19, .985, 0), r: [0, 0, .07], name: "Fuel tank" }); }
  add("tank", latheY([[0, 0], [.04, 0], [.042, .006], [.036, .014], [0, .016]]), M.chrome, { p: V3(.25, 1.128, 0), name: "Filler cap" });
  [-1, 1].forEach(s => add("tank", new T.CylinderGeometry(1, 1, .006, 32).rotateX(Math.PI / 2), M.rubber, { p: V3(.075, .962, s * .139), s: [.055, .03, 1], r: [0, s * -.28, 0], name: "Knee pad" }));
  add("tap", rbox(.03, .045, .03, .006), M.cast, { p: V3(.03, .88, .065), name: "Petcock body" });
  add("tap", rbox(.03, .008, .012, .003), M.satin, { p: V3(.03, .885, .085), r: [0, 0, .5], name: "Fuel lever" });
  add("tap", tube([V3(.03, .855, .065), V3(0, .78, .05), V3(-.06, .7, .02), V3(CX - .01, CY - .07, .05)], .0045, 40), M.rubber, { name: "Fuel line" });

  /* ---------- seat & side covers ---------- */
  { const s = new T.Shape(); s.moveTo(-.79, .865); s.lineTo(-.06, .865); s.quadraticCurveTo(0, .866, -.02, .905); s.lineTo(-.12, .938); s.quadraticCurveTo(-.2, .952, -.3, .953); s.lineTo(-.72, .958); s.quadraticCurveTo(-.81, .958, -.79, .865);
    add("seat", new T.ExtrudeGeometry(s, { depth: .2, bevelEnabled: true, bevelThickness: .04, bevelSize: .03, bevelSegments: 8, curveSegments: 20 }).translate(0, 0, -.1), M.vinyl, { name: "Seat cushion" }); }
  add("seat", rbox(.025, .006, .3, .003), M.satin, { p: V3(-.4, .99, 0), name: "Grab strap" });
  [-1, 1].forEach(s => add("seat", tube([V3(-.05, .862, s * .13), V3(-.4, .862, s * .133), V3(-.76, .862, s * .13)], .005, 30), M.chrome, { name: "Seat trim" }));
  add("seat", tube([V3(-.55, .885, .13), V3(-.82, .9, .12), V3(-.9, .9, 0), V3(-.82, .9, -.12), V3(-.55, .885, -.13)], .01, 60), M.chrome, { name: "Grab rail" });
  [["coverL", 1], ["coverR", -1]].forEach(([k, s]) => { const sh = new T.Shape(); sh.moveTo(-.13, .83); sh.lineTo(-.37, .83); sh.quadraticCurveTo(-.41, .82, -.4, .72); sh.quadraticCurveTo(-.36, .62, -.28, .62); sh.lineTo(-.17, .66); sh.quadraticCurveTo(-.12, .7, -.13, .83);
    add(k, new T.ExtrudeGeometry(sh, { depth: .01, bevelEnabled: true, bevelThickness: .004, bevelSize: .005, bevelSegments: 3 }).translate(0, 0, s > 0 ? .15 : -.16), M.paint, { name: "Side cover panel" });
    add(k, rbox(.085, .022, .004, .003), M.alu, { p: V3(-.26, .74, s * .168), name: "Badge plate" }); });

  /* ---------- fenders, lights, signals ---------- */
  add("fenders", new T.CylinderGeometry(.352, .352, .1, 64, 1, true, 1.5, 2.05).rotateX(Math.PI / 2), M.chrome, { p: WF, name: "Front fender", r: [0, 0, 0] }).material.side = THREE.DoubleSide;
  add("fenders", new T.CylinderGeometry(.36, .36, .13, 64, 1, true, 2.6, 1.95).rotateX(Math.PI / 2), M.chrome, { p: WR, name: "Rear fender" }).material.side = THREE.DoubleSide;
  const HL = V3(.63, .9, 0);
  add("headlight", latheX([[.0001, -.075], [.05, -.073], [.08, -.055], [.093, -.02], [.096, .03], [.094, .045]], 64), M.chrome, { p: HL, name: "Headlight bucket" });
  add("headlight", new T.TorusGeometry(.093, .007, 12, 64).rotateY(Math.PI / 2), M.chrome, { p: V3(HL.x + .047, HL.y, 0), name: "Headlight rim" });
  add("headlight", latheX([[.0001, .03], [.088, .03], [.086, .042], [.06, .05], [.0001, .053]], 64), M.reflector, { p: HL, name: "Reflector" });
  add("headlight", latheX([[.0001, .044], [.088, .044], [.08, .052], [.04, .058], [.0001, .06]], 64), M.glass, { p: HL, name: "Headlight lens" });
  [-1, 1].forEach(s => { add("headlight", tube([V3(.5, .94, s * .105), V3(.55, .93, s * .1), V3(.6, .905, s * .094)], .009, 16), M.chrome, { name: "Headlight ear" });
    add("sigF", tube([V3(.55, .93, s * .11), V3(.56, .93, s * .17), V3(.565, .93, s * .2)], .006, 12), M.chrome, { name: "Signal stalk" });
    add("sigF", latheX([[.0001, -.02], [.022, -.02], [.022, 0], [.0001, 0]], 24), M.chrome, { p: V3(.565, .93, s * .2), name: "Signal housing" });
    add("sigF", latheX([[.0001, 0], [.021, 0], [.017, .025], [.0001, .032]], 24), M.amber, { p: V3(.565, .93, s * .2), name: "Amber lens" });
    add("tail", tube([V3(-.84, .83, s * .07), V3(-.86, .83, s * .15), V3(-.865, .83, s * .19)], .006, 12), M.chrome, { name: "Rear signal stalk" });
    add("tail", latheX([[.0001, 0], [.021, 0], [.017, .025], [.0001, .032]], 24).rotateZ(Math.PI), M.amber, { p: V3(-.865, .83, s * .19), name: "Rear amber lens" }); });
  add("tail", rbox(.06, .05, .13, .012), M.chrome, { p: V3(-.9, .86, 0), name: "Tail light base" });
  add("tail", rbox(.03, .045, .125, .014), M.red, { p: V3(-.935, .862, 0), name: "Tail/brake lens" });
  add("tail", rbox(.01, .1, .18, .006), M.frame, { p: V3(-.94, .76, 0), r: [0, 0, .15], name: "Plate bracket" });
  add("tail", rbox(.004, .1, .17, .004), M.white, { p: V3(-.948, .76, 0), r: [0, 0, .15], name: "License plate (blank)" });
  add("headlight", latheZ([[0, 0], [.035, 0], [.035, .012], [.02, .02], [0, .02]]), M.satin, { p: V3(.56, .76, 0), r: [0, -.4, 0], name: "Horn" });

  /* ---------- cockpit ---------- */
  [["speedo", -1], ["tach", 1]].forEach(([k, s]) => { const pod = new T.Group(); pod.position.set(.49, 1.085, s * .064); pod.rotation.z = .55; G.gauges.add(pod);
    add("gauges", latheY([[.0001, -.045], [.04, -.045], [.052, -.02], [.053, .005], [.049, .006]]), M.chrome, { parent: pod, name: k === "tach" ? "Tachometer housing" : "Speedometer housing" });
    add("gauges", new T.CircleGeometry(.047, 48).rotateX(-Math.PI / 2), M[k], { parent: pod, p: V3(0, .001, 0), r: [0, Math.PI / 2, 0], name: k === "tach" ? "Tachometer face" : "Speedometer face" });
    add("gauges", latheY([[.0001, .012], [.047, .004], [.047, .002], [.0001, .002]]), M.glass, { parent: pod, name: "Gauge glass" });
    add("controls", tube([V3(.47, 1.06, s * .064), V3(.5, .98, s * .08), V3(.58, .7, s * .1), V3(.66, .45, s * .09)], .003, 40), M.satin, { name: k === "tach" ? "Tach cable" : "Speedo cable" }); });
  add("gauges", rbox(.05, .02, .05, .008), M.satin, { p: V3(.5, 1.075, 0), r: [0, 0, .55], name: "Indicator console" });
  [[-.014, M.green], [0, M.glow], [.014, M.amber]].forEach(([z, m]) => add("gauges", new T.SphereGeometry(.004, 10, 8), m, { p: V3(.497, 1.088, z), name: "Indicator lamp" }));
  add("gauges", latheY([[0, 0], [.013, 0], [.013, .008], [0, .008]]), M.chrome, { p: V3(.475, 1.07, 0), name: "Ignition switch" });
  add("handlebar", tube([V3(.3, 1.14, -.4), V3(.31, 1.14, -.32), V3(.37, 1.125, -.2), V3(.42, 1.095, -.08), V3(.425, 1.09, 0), V3(.42, 1.095, .08), V3(.37, 1.125, .2), V3(.31, 1.14, .32), V3(.3, 1.14, .4)], .011, 80, false, 14), M.chrome, { name: "Handlebar" });
  [-1, 1].forEach(s => { const gp = []; for (let i = 0; i <= 12; i++) gp.push([.017 + (i % 2) * .0015, i * .01]);
    add("handlebar", latheZ([[.0001, 0], ...gp, [.0001, .12]], 24), M.rubber, { p: V3(.3, 1.14, s > 0 ? .3 : -.42), name: s > 0 ? "Left grip" : "Throttle grip" });
    add("switches", rbox(.045, .04, .042, .01), M.satin, { p: V3(.315, 1.14, s * .275), name: s > 0 ? "Left switch housing" : "Right switch housing" });
    add("switches", rbox(.012, .008, .014, .003), s > 0 ? M.alu : M.red, { p: V3(.315, 1.165, s * .275), name: s > 0 ? "Turn signal switch" : "Engine stop switch" });
    add("controls", rbox(.03, .025, .03, .006), M.alu, { p: V3(.33, 1.135, s * .24), name: s > 0 ? "Clutch perch" : "Brake perch" });
    add("controls", tube([V3(.345, 1.135, s * .24), V3(.36, 1.13, s * .29), V3(.35, 1.115, s * .36), V3(.335, 1.105, s * .41)], .006, 24), M.alu, { name: s > 0 ? "Clutch lever" : "Brake lever" });
    add("pegs", tube([V3(.33, 1.15, s * .23), V3(.325, 1.22, s * .27), V3(.31, 1.28, s * .3)], .005, 16), M.chrome, { name: "Mirror stem" });
    add("pegs", latheX([[.0001, -.008], [.04, -.006], [.042, 0], [.0001, .003]], 32), M.chrome, { p: V3(.305, 1.29, s * .31), r: [0, s * .3, 0], name: "Mirror head" });
    add("pegs", new T.CircleGeometry(.038, 32).rotateY(-Math.PI / 2), M.reflector, { p: V3(.301, 1.29, s * .31), r: [0, s * .3, 0], name: "Mirror glass" });
  });
  add("mcyl", rbox(.04, .028, .045, .008), M.cast, { p: V3(.355, 1.135, -.19), name: "Master cylinder body" });
  add("mcyl", latheY([[0, 0], [.022, 0], [.022, .022], [.018, .028], [0, .028]]), M.cast, { p: V3(.35, 1.148, -.18), name: "Fluid reservoir" });
  add("controls", tube([V3(.33, 1.13, .24), V3(.4, 1.03, .2), V3(.42, .8, .17), V3(.3, .55, .2), V3(.0, .4, .22)], .004, 50), M.satin, { name: "Clutch cable" });
  add("controls", tube([V3(.31, 1.13, -.31), V3(.4, 1.06, -.25), V3(.35, .9, -.1), V3(.15, .8, -.05), V3(CX + .028, CY + .02, -.19)], .004, 50), M.satin, { name: "Throttle cable" });
  add("hoses", tube([V3(.37, 1.12, -.19), V3(.46, 1.02, -.15), V3(.55, .78, -.13), V3(.62, .55, -.11), V3(calP.x, calP.y + .03, -.098)], .0048, 60), M.rubber, { name: "Front brake hose" });
  add("hoses", latheY([[0, 0], [.007, 0], [.007, .012], [0, .012]]), M.chrome, { p: V3(calP.x, calP.y + .03, -.098), name: "Banjo bolt" });

  /* ---------- ignition, harness ---------- */
  [-1, 1].forEach(s => add("ignition", rbox(.075, .05, .045, .01), M.satin, { p: V3(.22, .845, s * .05), name: s > 0 ? "Ignition coil (cyl. 1-4)" : "Ignition coil (cyl. 2-3)" }));
  ZC.forEach((z, i) => { const cap = toW(.0, .33, z);
    add("ignition", latheY([[.0001, 0], [.011, 0], [.012, .04], [.009, .05], [.0001, .05]]), M.rubber, { p: cap, r: [0, 0, -th], name: `Plug cap ${i + 1}` });
    add("ignition", tube([cap.clone().add(V3(.01, .048, 0)), V3(cap.x + .03, .8, z * .8), V3(.22, .84, Math.sign(z) * .05)], .0035, 30), M.rubber, { name: `Plug lead ${i + 1}` }); });
  add("harness", tube([V3(.56, .9, .02), V3(.47, .95, .03), V3(.32, .89, .06), V3(.1, .855, .07), V3(-.15, .84, .075), V3(-.45, .825, .07), V3(-.75, .83, .05), V3(-.88, .85, .0)], .011, 120, false, 10), M.satin, { name: "Main harness" });
  add("harness", tube([V3(.1, .855, .07), V3(.05, .7, .1), V3(.05, .45, .2)], .006, 30), M.satin, { name: "Alternator lead" });

  /* ---------- footrests, pedals, stands ---------- */
  [-1, 1].forEach(s => { const rib = []; for (let i = 0; i <= 10; i++) rib.push([.0135 + (i % 2) * .002, i * .011]);
    add("pegs", latheZ([[.0001, 0], ...rib, [.0001, .11]], 20), M.rubber, { p: V3(-.06, .3, s > 0 ? .17 : -.28), name: s > 0 ? "Left footpeg" : "Right footpeg" });
    add("pegs", rbox(.05, .05, .02, .008), M.cast, { p: V3(-.06, .31, s * .15), name: "Footpeg bracket" });
    add("pegs", latheZ([[.0001, 0], [.011, 0], [.011, .08], [.0001, .08]], 16), M.rubber, { p: V3(-.5, .37, s > 0 ? .17 : -.25), name: "Passenger peg" });
    add("pegs", tube([V3(-.25, .2, s * .12), V3(-.33, .1, s * .11), V3(-.4, .01, s * .1)], .011, 20), M.frame, { name: "Center stand leg" }); });
  add("pegs", tube([V3(-.03, .26, .2), V3(.05, .27, .23), V3(.09, .26, .24)], .006, 12), M.alu, { name: "Shift lever" });
  add("pegs", tube([V3(-.04, .24, -.17), V3(.05, .26, -.19), V3(.1, .25, -.2)], .007, 12), M.alu, { name: "Rear brake pedal" });
  add("pegs", tube([V3(-.16, .16, .13), V3(-.24, .08, .22), V3(-.3, .01, .29)], .01, 16), M.frame, { name: "Side stand" });
  add("pegs", rbox(.05, .01, .03, .004), M.frame, { p: V3(-.3, .006, .29), name: "Side stand foot" });

  // per-group material copies so highlights and status colours never bleed between groups
  root.traverse(o => { if (o.isMesh) { o.userData.baseMat = o.material; } });
  Object.values(G).forEach(g => { const cache = new Map(); g.traverse(o => { if (!o.isMesh) return; const b = o.userData.baseMat; if (!cache.has(b)) { const c = b.clone(); c.userData.base = b; cache.set(b, c); } o.material = cache.get(b); o.userData.real = o.material; o.userData.group = g.userData.key; }); });
  root.userData.materials = M;
  return root;
}
function setPaint(root, hex, stripe = "gold", frame = "Gloss black") {
  const M = root.userData.materials; M.paint.color.setHex(hex); M.tank.map = tankTexture(hex, stripe); M.tank.needsUpdate = true;
  const fh = FRAMES[frame] === null ? hex : (FRAMES[frame] ?? 0x0c0d0f);
  root.traverse(o => { if (o.isMesh && o.userData.real) { const r = o.userData.real, b = r.userData.base; if (b === M.paint) r.color.setHex(hex); if (b === M.tank) { r.map = M.tank.map; r.needsUpdate = true; } if (b === M.frame) { r.color.setHex(fh); r.roughness = frame === "Satin black" ? .6 : .32; r.metalness = frame === "Silver" ? .6 : .25; } } });
}

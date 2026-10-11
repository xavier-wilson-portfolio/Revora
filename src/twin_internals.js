/* ============ GS750 digital twin: internal assemblies (schematic) ============
   Built only when someone asks to see inside. Positions follow the exterior model:
   cylinder bank base B0 = (0.11, 0.47), tilted forward 0.2 rad; crank axis placed 0.115 m below the base
   on the bore axis. Stroke uses the published 56.4 mm. Rod length, gear sizes, plate counts and lobe
   shapes are NOT measured; they are drawn to show how the parts relate. */
function buildInternals(root) {
  const T = THREE, M0 = root.userData.materials, V3 = (x, y, z) => new T.Vector3(x, y, z), U = T.BufferGeometryUtils;
  const M = Object.assign({}, M0, {
    forged: new T.MeshStandardMaterial({ color: 0x9a9da1, metalness: .95, roughness: .34, name: "machined steel" }),
    journal: new T.MeshStandardMaterial({ color: 0xe3e6e9, metalness: 1, roughness: .12, name: "ground journal" }),
    piston: new T.MeshStandardMaterial({ color: 0xc9c6bd, metalness: .7, roughness: .38, name: "piston alloy" }),
    ring: new T.MeshStandardMaterial({ color: 0x4a4d52, metalness: .9, roughness: .3, name: "ring steel" }),
    friction: new T.MeshStandardMaterial({ color: 0x5b4632, metalness: 0, roughness: .95, name: "friction material" }),
    pad: new T.MeshStandardMaterial({ color: 0x3a3632, metalness: .1, roughness: .92, name: "brake friction material" }),
    spring: new T.MeshStandardMaterial({ color: 0x2c2f33, metalness: .85, roughness: .38, name: "spring steel" }),
    brass: new T.MeshStandardMaterial({ color: 0xc8a24c, metalness: 1, roughness: .28, name: "brass jet" }),
    float: new T.MeshStandardMaterial({ color: 0xd8d2bf, metalness: .2, roughness: .5, name: "float" }),
    seal: new T.MeshStandardMaterial({ color: 0x1d1d1d, metalness: 0, roughness: .8, name: "seal rubber" }),
    bearing: new T.MeshStandardMaterial({ color: 0xbfc4c8, metalness: 1, roughness: .2, name: "bearing steel" }),
  });
  const th = .2, B0 = V3(.11, .47, 0), ZC = [-.132, -.044, .044, .132], R = .0282, ROD = .21, CRANK_LY = -.115;
  const toW = (lx, ly, z) => V3(B0.x + lx * Math.cos(th) + ly * Math.sin(th), B0.y - lx * Math.sin(th) + ly * Math.cos(th), z);
  const lathe = (pts, seg = 40) => new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(Math.max(r, 1e-4), y)), seg);
  const latheZ = (pts, seg) => lathe(pts, seg).rotateX(Math.PI / 2);
  const cylZ = (r, len, seg = 32) => new T.CylinderGeometry(r, r, len, seg).rotateX(Math.PI / 2);
  const rbox = (w, h, d, r = .003) => new T.RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const helix = (r, h, turns, wire) => { const pts = []; for (let i = 0; i <= turns * 24; i++) { const t = i / (turns * 24); pts.push(V3(Math.cos(t * turns * Math.PI * 2) * r, t * h, Math.sin(t * turns * Math.PI * 2) * r)); } return new T.TubeGeometry(new T.CatmullRomCurve3(pts), turns * 24, wire, 6, false); };
  const gearShape = (r, teeth, depth = .0035, hole = 0) => { const s = new T.Shape(); for (let i = 0; i <= teeth * 4; i++) { const a = i / (teeth * 4) * Math.PI * 2, rr = (i % 4 === 1 || i % 4 === 2) ? r : r - depth; i ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    if (hole) { const h = new T.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h); } return s; };
  const gearZ = (r, teeth, w, hole = 0) => new T.ExtrudeGeometry(gearShape(r, teeth, Math.min(.004, r * .12), hole), { depth: w, bevelEnabled: false, curveSegments: 4 }).translate(0, 0, -w / 2);
  const discZ = (ro, ri, w, seg = 48) => latheZ([[ri, -w / 2], [ro, -w / 2], [ro, w / 2], [ri, w / 2], [ri, -w / 2]], seg);
  const out = {};
  const grp = (key, parent = root) => { const a = TW_ASSY[key], g = new T.Group(); g.name = key; g.userData = { key, label: a.label, partId: a.part, internal: true }; parent.add(g); out[key] = g; return g; };
  const add = (g, geo, mat, o = {}) => { const m = new T.Mesh(geo, mat); if (o.p) m.position.copy(o.p); if (o.r) m.rotation.set(...o.r); if (o.q) m.quaternion.copy(o.q); m.name = o.name || ""; m.castShadow = true; m.receiveShadow = true; m.userData.internal = true; (o.parent || g).add(m); return m; };
  const bank = (g) => { const b = new T.Group(); b.position.copy(B0); b.rotation.z = -th; g.add(b); return b; };

  /* ---- crankshaft & rods ---- */
  const C = toW(0, CRANK_LY, 0), crankAngle = .35;
  { const g = grp("crank"), cs = new T.Group(); cs.position.copy(C); cs.rotation.z = -th; g.add(cs);
    const throwA = i => crankAngle + (i === 0 || i === 3 ? 0 : Math.PI); // 180° crank: 1&4 together, 2&3 opposite
    const hullShape = () => { const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; pts.push([Math.cos(a) * .036, Math.sin(a) * .036], [Math.cos(a) * .02, R + Math.sin(a) * .02]); }
      pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], hi = [];
      for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
      const h = lo.slice(0, -1).concat(hi.slice(0, -1)), s = new T.Shape(); h.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); return s; };
    const webShape = hullShape();
    const mains = [-.19, -.088, 0, .088, .19];
    mains.forEach((z, i) => add(g, cylZ(.0185, i === 0 || i === 4 ? .05 : .022), M.journal, { parent: cs, p: V3(0, 0, z + (i === 0 ? -.012 : i === 4 ? .012 : 0)), name: `Main journal ${i + 1}` }));
    ZC.forEach((z, i) => { const a = throwA(i), px = Math.sin(a) * R, py = Math.cos(a) * R;
      [-1, 1].forEach(s => { const wg = new T.ExtrudeGeometry(webShape, { depth: .011, bevelEnabled: true, bevelThickness: .0015, bevelSize: .0015, bevelSegments: 2, curveSegments: 16 }).translate(0, 0, -.0055);
        const m = add(g, wg, M.forged, { parent: cs, p: V3(0, 0, z + s * .0185), name: `Throw ${i + 1}: crank web` }); m.rotation.z = -a; });
      add(g, cylZ(.0155, .026), M.journal, { parent: cs, p: V3(px, py, z), name: `Throw ${i + 1}: crankpin` });
    });
    add(g, gearZ(.034, 20, .012, .012), M.forged, { parent: cs, p: V3(0, 0, -.012), name: "Cam chain drive sprocket" });
    add(g, gearZ(.042, 28, .014, .012), M.forged, { parent: cs, p: V3(0, 0, .016), name: "Primary drive gear (position approximate)" });
    add(g, latheZ([[.0001, 0], [.014, 0], [.012, .06], [.0001, .06]], 24), M.forged, { parent: cs, p: V3(0, 0, .2), name: "Left end (alternator rotor taper)" });
    add(g, latheZ([[.0001, 0], [.011, 0], [.011, .03], [.0001, .03]], 24), M.forged, { parent: cs, p: V3(0, 0, -.23), name: "Right end (points cam)" });
    // rods in bank-local space so they sit on the bore axis
    const bk = bank(g);
    ZC.forEach((z, i) => { const a = throwA(i), pin = V3(Math.sin(a) * R, CRANK_LY + Math.cos(a) * R, z), wy = CRANK_LY + Math.cos(a) * R + Math.sqrt(ROD * ROD - (Math.sin(a) * R) ** 2), wp = V3(0, wy, z);
      const d = wp.clone().sub(pin), len = d.length(), rod = new T.Group(); rod.position.copy(pin); rod.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize()); bk.add(rod);
      add(g, discZ(.027, .016, .022), M.forged, { parent: rod, name: `Rod ${i + 1}: big end` });
      add(g, rbox(.016, len - .05, .016, .004), M.forged, { parent: rod, p: V3(0, len / 2, 0), name: `Rod ${i + 1}: beam` });
      add(g, discZ(.013, .0085, .02), M.forged, { parent: rod, p: V3(0, len, 0), name: `Rod ${i + 1}: small end` });
      [-1, 1].forEach(s => add(g, cylZ(.0035, .03, 8), M.zinc || M.steel, { parent: rod, p: V3(s * .02, -.008, 0), r: [Math.PI / 2, 0, 0], name: `Rod ${i + 1}: cap bolt` }));
      add(g, discZ(.0275, .016, .004), M.bearing, { parent: rod, p: V3(0, 0, .013), name: `Rod ${i + 1}: bearing shell` });
      out._pistonY = out._pistonY || []; out._pistonY[i] = wy;
    });
  }
  /* ---- pistons ---- */
  { const g = grp("pistons"), bk = bank(g);
    ZC.forEach((z, i) => { const y = out._pistonY[i], pg = new T.Group(); pg.position.set(0, y, z); bk.add(pg);
      add(g, lathe([[.0001, .034], [.031, .034], [.0322, .03], [.0322, -.016], [.0315, -.018], [.026, -.018], [.026, .02], [.0001, .02]], 40), M.piston, { parent: pg, name: `Piston ${i + 1}: body` });
      [[.026, "top ring"], [.021, "second ring"], [.0155, "oil ring"]].forEach(([ry, nm]) => add(g, new T.TorusGeometry(.0322, .0013, 6, 40).rotateX(Math.PI / 2), M.ring, { parent: pg, p: V3(0, ry, 0), name: `Piston ${i + 1}: ${nm}` }));
      add(g, cylZ(.0078, .05, 20), M.journal, { parent: pg, name: `Piston ${i + 1}: wrist pin` });
      [-1, 1].forEach(s => add(g, new T.TorusGeometry(.0068, .0008, 4, 16), M.spring, { parent: pg, p: V3(0, 0, s * .026), name: `Piston ${i + 1}: circlip` }));
    });
  }
  /* ---- camshafts & valve train (bank-local) ---- */
  const CAMY = .268, CAMX = .047;
  { const g = grp("valvetrain"), bk = bank(g);
    [["Intake", -CAMX], ["Exhaust", CAMX]].forEach(([nm, x], ci) => {
      add(g, cylZ(.0105, .40, 20), M.journal, { parent: bk, p: V3(x, CAMY, 0), name: `${nm} camshaft: shaft` });
      const lobe = new T.Shape(); lobe.absarc(0, 0, .016, Math.PI * .72, Math.PI * 2.28, false); lobe.quadraticCurveTo(.0, .029, Math.cos(Math.PI * .72) * .016, Math.sin(Math.PI * .72) * .016);
      ZC.forEach((z, i) => { const m = add(g, new T.ExtrudeGeometry(lobe, { depth: .014, bevelEnabled: false, curveSegments: 18 }).translate(0, 0, -.007), M.journal, { parent: bk, p: V3(x, CAMY, z), name: `${nm} camshaft: lobe ${i + 1}` }); m.rotation.z = (i % 2 ? Math.PI : 0) + ci * .9; });
      add(g, gearZ(.034, 24, .007, .01), M.forged, { parent: bk, p: V3(x, CAMY, .012), name: `${nm} camshaft: sprocket` });
      ZC.forEach((z, i) => { const vx = x * .62, ang = (x < 0 ? -1 : 1) * .17;
        const vt = new T.Group(); vt.position.set(vx, CAMY - .03, z); vt.rotation.z = -ang; bk.add(vt);
        add(g, latheY([[.0001, 0], [.0145, 0], [.0145, .02], [.0001, .02]]), M.journal, { parent: vt, p: V3(0, -.012, 0), name: `${nm} valve ${i + 1}: tappet bucket` });
        add(g, cylZ(.012, .0025, 24).rotateX(Math.PI / 2), M.forged, { parent: vt, p: V3(0, .0095, 0), name: `${nm} valve ${i + 1}: shim` });
        add(g, helix(.0105, .03, 6, .0013), M.spring, { parent: vt, p: V3(0, -.047, 0), name: `${nm} valve ${i + 1}: springs` });
        add(g, latheY([[.004, 0], [.0115, 0], [.009, .005], [.004, .005]]), M.forged, { parent: vt, p: V3(0, -.018, 0), name: `${nm} valve ${i + 1}: retainer` });
        add(g, latheY([[.0001, 0], [x < 0 ? .0155 : .0135, 0], [.003, .006], [.0028, .085], [.0001, .085]], 28), M.forged, { parent: vt, p: V3(0, -.1, 0), name: `${nm} valve ${i + 1}: valve` });
      });
    });
    function latheY(pts) { return lathe(pts, 28); }
  }
  /* ---- cam chain ---- */
  { const g = grp("camchain"), bk = bank(g);
    const circles = [[0, CRANK_LY, .036], [-CAMX, CAMY, .036], [CAMX, CAMY, .036]], pts = [];
    circles.forEach(([x, y, r]) => { for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } });
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], hi = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    const hull = lo.slice(0, -1).concat(hi.slice(0, -1)).map(([x, y]) => V3(x, y, .012));
    add(g, new T.TubeGeometry(new T.CatmullRomCurve3(hull, true, "catmullrom", .1), 300, .0045, 6, true), M.chainM, { parent: bk, name: "Cam chain" });
    add(g, rbox(.008, .2, .018, .003), M.seal, { parent: bk, p: V3(.046, .08, .012), r: [0, 0, -.05], name: "Front chain guide" });
    add(g, rbox(.008, .2, .018, .003), M.seal, { parent: bk, p: V3(-.046, .08, .012), r: [0, 0, .05], name: "Tensioner blade" });
    add(g, rbox(.03, .02, .02, .004), M.cast, { parent: bk, p: V3(-.075, .1, .012), name: "Cam chain tensioner body" });
  }
  /* ---- clutch pack (right side, mainshaft) ---- */
  const MS = V3(-.085, .335, 0);
  { const g = grp("clutchpack"), cg = new T.Group(); cg.position.copy(MS); g.add(cg);
    add(g, latheZ([[.06, 0], [.112, 0], [.112, .055], [.106, .055], [.106, .006], [.06, .006]], 64), M.cast, { parent: cg, p: V3(0, 0, -.183), name: "Clutch basket" });
    add(g, gearZ(.118, 64, .012, .06), M.forged, { parent: cg, p: V3(0, 0, -.123), name: "Primary driven gear" });
    for (let i = 0; i < 15; i++) { const f = i % 2 === 0; add(g, f ? discZ(.103, .07, .0032) : discZ(.098, .062, .0018), f ? M.friction : M.forged, { parent: cg, p: V3(0, 0, -.135 - i * .0036), name: f ? `Drive (friction) plate ${i / 2 + 1}` : `Driven (steel) plate ${(i + 1) / 2}` }); }
    add(g, latheZ([[.012, 0], [.064, 0], [.064, .05], [.012, .05]], 40), M.cast, { parent: cg, p: V3(0, 0, -.183), name: "Clutch sleeve hub" });
    add(g, discZ(.1, .02, .008), M.cast, { parent: cg, p: V3(0, 0, -.19), name: "Pressure plate" });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(g, helix(.0075, .028, 6, .0012).rotateX(-Math.PI / 2), M.spring, { parent: cg, p: V3(Math.cos(a) * .045, Math.sin(a) * .045, -.17), name: `Clutch spring ${i + 1} (count not verified)` }); }
    add(g, cylZ(.006, .02, 12), M.forged, { parent: cg, p: V3(0, 0, -.2), name: "Clutch push piece" });
  }
  /* ---- gearbox ---- */
  { const g = grp("gearbox"), CS = V3(-.13, .3, 0), d = MS.clone().sub(CS).length();
    add(g, cylZ(.011, .3, 20), M.journal, { p: MS.clone().add(V3(0, 0, .02)), name: "Input shaft (drive shaft)" });
    add(g, cylZ(.012, .3, 20), M.journal, { p: CS.clone().add(V3(0, 0, .02)), name: "Output shaft (countershaft)" });
    [.3, .4, .5, .58, .64].forEach((k, i) => { const rm = d * k * .55 + .006, rc = d - rm + .006, z = -.09 + i * .042;
      add(g, gearZ(rm, Math.round(rm * 700), .013, .011), M.forged, { p: MS.clone().add(V3(0, 0, z)), name: `Gear pair ${i + 1}: input-shaft gear` });
      add(g, gearZ(rc, Math.round(rc * 700), .013, .012), M.forged, { p: CS.clone().add(V3(0, 0, z)), name: `Gear pair ${i + 1}: output-shaft gear` });
    });
  }
  /* ---- oil pump ---- */
  { const g = grp("oilpump"), P = V3(.02, .215, -.12);
    add(g, cylZ(.03, .045, 32), M.cast, { p: P, name: "Oil pump body" });
    add(g, gearZ(.022, 7, .01, .004), M.forged, { p: P.clone().add(V3(0, 0, -.026)), name: "Inner rotor" });
    add(g, discZ(.028, .022, .01), M.forged, { p: P.clone().add(V3(0, 0, -.026)), name: "Outer rotor" });
    add(g, gearZ(.026, 38, .008, .005), M.forged, { p: P.clone().add(V3(0, 0, -.05)), name: "Oil pump driven gear" });
  }
  /* ---- carburetor 1 internals (rightmost carb) ---- */
  { const g = grp("carbguts"), CX = -.085, CY = .632, z = ZC[0], cp = V3(CX, CY, z), cg = new T.Group(); cg.position.copy(cp); g.add(cg);
    add(g, lathe([[.0001, 0], [.0135, 0], [.0135, .034], [.0001, .034]], 32), M.journal, { parent: cg, p: V3(0, -.004, 0), name: "Throttle slide" });
    add(g, helix(.009, .028, 5, .001), M.spring, { parent: cg, p: V3(0, .03, 0), name: "Slide return spring" });
    add(g, lathe([[.0001, 0], [.0011, 0], [.0009, .04], [.0001, .041]], 12), M.journal, { parent: cg, p: V3(0, -.044, 0), name: "Jet needle" });
    add(g, lathe([[.0018, 0], [.0034, 0], [.0034, .022], [.0018, .022]], 16), M.brass, { parent: cg, p: V3(0, -.05, 0), name: "Needle jet" });
    add(g, lathe([[.0012, 0], [.0038, 0], [.0038, .006], [.0012, .006]], 6), M.brass, { parent: cg, p: V3(0, -.058, 0), name: "Main jet" });
    add(g, lathe([[.0008, 0], [.0024, 0], [.0024, .016], [.0008, .016]], 12), M.brass, { parent: cg, p: V3(.014, -.06, 0), name: "Pilot jet" });
    [-1, 1].forEach(s => add(g, rbox(.024, .012, .014, .004), M.float, { parent: cg, p: V3(-.004, -.062, s * .013), name: s > 0 ? "Float (left pontoon)" : "Float (right pontoon)" }));
    add(g, lathe([[.0001, 0], [.0016, 0], [.0016, .008], [.0001, .011]], 12), M.brass, { parent: cg, p: V3(-.016, -.05, 0), name: "Float needle" });
  }
  /* ---- right fork leg internals ---- */
  { const g = grp("forkguts"), WF = V3(.745, .333, 0), FT = V3(.455, 1.03, 0), dUp = FT.clone().sub(WF).normalize(), q = new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), dUp), base = V3(WF.x, WF.y + .01, -.105);
    const at = (k) => base.clone().add(dUp.clone().multiplyScalar(k));
    add(g, helix(.0135, .34, 26, .0022), M.spring, { q, p: at(.35), name: "Fork spring" });
    add(g, lathe([[.0001, 0], [.0085, 0], [.0085, .26], [.012, .27], [.012, .29], [.0001, .29]], 20), M.journal, { q, p: at(.06), name: "Damper rod (fork cylinder)" });
    add(g, helix(.0095, .04, 5, .0015), M.spring, { q, p: at(.33), name: "Rebound spring" });
    add(g, lathe([[.004, 0], [.012, 0], [.009, .02], [.004, .02]], 20), M.cast, { q, p: at(.035), name: "Oil lock piece" });
    add(g, new T.TorusGeometry(.021, .0035, 8, 32).rotateX(Math.PI / 2), M.seal, { q, p: at(.335), name: "Fork oil seal" });
  }
  /* ---- front caliper internals ---- */
  { const g = grp("calguts"), WF = V3(.745, .333, 0), cp = V3(WF.x - .1, WF.y + .095, 0);
    add(g, cylZ(.019, .018, 28), M.journal, { p: V3(cp.x, cp.y, -.098), name: "Caliper piston" });
    add(g, new T.TorusGeometry(.0195, .0018, 6, 28), M.seal, { p: V3(cp.x, cp.y, -.102), name: "Piston seal" });
    add(g, new T.TorusGeometry(.021, .003, 6, 28), M.seal, { p: V3(cp.x, cp.y, -.09), name: "Piston boot" });
    [-.0705, -.0855].forEach((z, i) => { const m = add(g, rbox(.058, .036, .008, .006), M.pad, { p: V3(cp.x, cp.y, z), r: [0, 0, .75], name: i ? "Inner brake pad" : "Outer brake pad" }); });
  }
  /* ---- front axle stack ---- */
  { const g = grp("axleF"), W = V3(.745, .333, 0);
    [-1, 1].forEach(s => { add(g, discZ(.021, .0102, .012, 32), M.bearing, { p: V3(W.x, W.y, s * .05), name: s > 0 ? "Left hub bearing" : "Right hub bearing" });
      add(g, discZ(.02, .012, .006, 28), M.seal, { p: V3(W.x, W.y, s * .064), name: s > 0 ? "Left dust seal" : "Right dust seal" });
      add(g, discZ(.016, .0102, .022, 24), M.forged, { p: V3(W.x, W.y, s * .084), name: s > 0 ? "Left axle spacer" : "Right axle spacer" }); });
    add(g, discZ(.013, .0102, .088, 24), M.forged, { p: V3(W.x, W.y, 0), name: "Hub centre spacer" });
  }
  delete out._pistonY;
  return out;
}

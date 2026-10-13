/* ============ 3D parts model: cam chain, guides and tensioner, GS750B 1977 (CMSNL BLCK0003) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the same as the crankshaft model (DG-EN-02): crank axis = X (+X toward the right / clutch side), crank axis
   through the origin, +Y straight up the cylinder bores (forward cylinder tilt ignored), +Z forward (exhaust side).
   The cam chain runs up the tunnel between cylinders 2 and 3, in the plane X = 0.
   Sprocket positions follow the other engine models: crank sprocket on the crank axis (DG-EN-02, 22 teeth, r 26), cam sprockets
   r 41 on cam centres 77.5 mm ahead of and behind the bore axis (DG-EN-01). DG-EN-01 measures height from the combustion
   chamber roof; that roof is put 177 mm above the crank axis here (rod 113 + throw 28.2 + piston and gasket allowance), so
   the cam centres sit at Y = 282. The sprockets themselves are on other pages and are not drawn.
   Chain path: around the crank sprocket at the bottom, up the front (exhaust side, tight side) run, over the exhaust and
   intake cam sprockets, down the rear (slack side) run, which the tensioner pushes in slightly. 120 links spaced evenly
   round that path; with these centres that gives a pitch close to the 7.77 mm of a 219-size cam chain.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Identity and numbering: CMSNL cam chain page (refs 1-24).
   Geometry: APPROXIMATE. Guide, idler and adjuster shapes and sizes are typical for a 1970s Suzuki four, not measured
   from a GS750. The fastener sizes in the names are read from the Suzuki part numbers (e.g. 01517-06308 = 6 x 30). */
(() => {
  const R0 = 24, RC = 39, CY = 282, CZ = 77.5;            // pitch radii (crank, cam) and cam centre position
  const C0 = [0, 0], CE = [CY, CZ], CI = [CY, -CZ];       // circle centres as [y, z]
  const BOW = 6;                                          // how far the tensioner pushes the rear run in
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const len = a => Math.hypot(a[0], a[1]), unit = a => mul(a, 1 / len(a)), r3 = v => +v.toFixed(3);
  const pol = (c, r, a) => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; // angle measured from +Y toward +Z

  // outer tangent line from circle A to circle B on the side given by sgn (+1 = +Z side)
  const tangent = (A, rA, B, rB, sgn) => {
    const D = sub(B, A), d = len(D), u = unit(D), c = (rA - rB) / d, s = Math.sqrt(1 - c * c);
    const n1 = [u[0] * c - u[1] * s, u[0] * s + u[1] * c], n2 = [u[0] * c + u[1] * s, -u[0] * s + u[1] * c];
    const nn = (n1[1] * sgn > n2[1] * sgn) ? n1 : n2;
    return { a: add(A, mul(nn, rA)), b: add(B, mul(nn, rB)), n: nn };
  };
  const tF = tangent(C0, R0, CE, RC, 1), tR = tangent(C0, R0, CI, RC, -1);
  const ang = p => Math.atan2(p[1], p[0]);

  // ---- sample the loop densely, going round: front run up, over the cams, rear run down, under the crank ----
  const S = [];
  const line = (a, b) => { const n = Math.ceil(len(sub(b, a)) / 1); for (let i = 0; i < n; i++) S.push(add(a, mul(sub(b, a), i / n))); };
  const arc = (c, r, a0, a1) => { while (a1 > a0) a1 -= Math.PI * 2; const n = Math.ceil(r * (a0 - a1) / 1); for (let i = 0; i < n; i++) S.push(pol(c, r, a0 + (a1 - a0) * i / n)); };
  const rearMid = mul(add(tR.a, tR.b), .5), rearCtl = add(rearMid, mul(tR.n, -2 * BOW)); // control point pulled toward the inside (+Z)
  const bez = (a, c, b, t) => add(add(mul(a, (1 - t) * (1 - t)), mul(c, 2 * t * (1 - t))), mul(b, t * t));
  line(tF.a, tF.b);
  arc(CE, RC, ang(tF.n), 0);
  line(pol(CE, RC, 0), pol(CI, RC, 0));
  arc(CI, RC, 0, ang(tR.n));
  for (let i = 0; i < 300; i++) S.push(bez(tR.b, rearCtl, tR.a, i / 300));
  arc(C0, R0, ang(tR.n), ang(tF.n));
  const cum = [0]; for (let i = 1; i <= S.length; i++) cum.push(cum[i - 1] + len(sub(S[i % S.length], S[i - 1])));
  const L = cum[S.length], N = 120, PITCH = L / N;
  const at = s => { s = ((s % L) + L) % L; let i = 0; while (cum[i + 1] < s) i++; const f = (s - cum[i]) / (cum[i + 1] - cum[i]); return add(S[i], mul(sub(S[(i + 1) % S.length], S[i]), f)); };
  const rearY = y => { // point on the rear run at height y, and its outward normal (toward -Z)
    let best = null; for (let t = 0; t <= 1; t += .001) { const p = bez(tR.b, rearCtl, tR.a, t); if (!best || Math.abs(p[0] - y) < Math.abs(best.p[0] - y)) best = { p, t }; }
    const p2 = bez(tR.b, rearCtl, tR.a, Math.min(1, best.t + .002)), p1 = bez(tR.b, rearCtl, tR.a, Math.max(0, best.t - .002)), tg = unit(sub(p2, p1));
    const n = [tg[1], -tg[0]]; return { p: best.p, n: n[1] < 0 ? n : mul(n, -1), tg };
  };

  // ---- chain: one roller (with pin ends) per joint, inner and outer plate pairs alternating ----
  const PL = [];
  for (let a = -40; a <= 220; a += 20) PL.push([3.6 * Math.cos(a * Math.PI / 180), PITCH / 2 + 3.6 * Math.sin(a * Math.PI / 180)]);
  PL.push([-2.7, 0]);
  for (let a = 140; a <= 400; a += 20) PL.push([3.6 * Math.cos(a * Math.PI / 180), -PITCH / 2 + 3.6 * Math.sin(a * Math.PI / 180)]);
  PL.push([2.7, 0]);
  const plate = x0 => ({ type: "extrude", pts: PL.map(p => p.map(r3)), depth: 1, bevel: 0, rot: [0, 90, 0], at: [x0, 0, 0] });
  const roller = { type: "lathe", pts: [[0, -5.4], [1.6, -5.4], [1.6, -2.4], [2.6, -2.4], [2.6, 2.4], [1.6, 2.4], [1.6, 5.4], [0, 5.4]], rot: [0, 0, -90], mat: "dark" };
  const links = [];
  for (let k = 0; k < N; k++) {
    const p = at(k * PITCH), q = at((k + 1) * PITCH), m = mul(add(p, q), .5), d = sub(q, p), a = Math.atan2(d[1], d[0]) * 180 / Math.PI;
    const xs = k % 2 ? [2.4, -3.4] : [3.5, -4.5]; // inner link plates hug the rollers, outer link plates sit outside them
    links.push({ type: "group", items: [plate(xs[0]), plate(xs[1])], rot: [r3(a), 0, 0], at: [0, r3(m[0]), r3(m[1])] });
    links.push({ ...roller, at: [0, r3(p[0]), r3(p[1])] });
  }

  // ---- outlines in the chain plane: (y, z) points -> extrude, w wide across X, centred on x0 ----
  const yz = (pts, w, x0 = 0, mat) => ({ type: "extrude", pts: pts.map(p => [r3(-p[1]), r3(p[0])]), depth: w, bevel: .5, rot: [0, 90, 0], at: [x0 - w / 2, 0, 0], ...(mat ? { mat } : {}) });
  const quad = (p, t, n, s0, s1, o0, o1) => [add(add(p, mul(t, s0)), mul(n, o0)), add(add(p, mul(t, s1)), mul(n, o0)), add(add(p, mul(t, s1)), mul(n, o1)), add(add(p, mul(t, s0)), mul(n, o1))];

  // front guide: straight along the front run, rubber face, steel backbone, foot at the bottom, tab at the top for the holder
  const fT = unit(sub(tF.b, tF.a)), fN = tF.n, fLen = len(sub(tF.b, tF.a));
  const f0 = add(tF.a, mul(fT, fLen * .1)), fL = fLen * .78;          // guide from 10 % to 88 % of the run
  const fTop = add(f0, mul(fT, fL));
  const guide2 = { type: "group", items: [
    yz(quad(f0, fT, fN, 0, fL, 4.4, 9), 15, 0, "rubber"),
    yz(quad(f0, fT, fN, 0, fL, 9, 15), 6),
    yz(quad(f0, fT, fN, -10, 6, 4.4, 15), 8),                          // foot (sits in the crankcase seat)
    yz(quad(fTop, fT, fN, -6, 6, 9, 26), 8),                           // top tab
  ] };
  const tabTop = add(add(fTop, mul(fT, 6)), mul(fN, 17.5));            // centre of the tab's top edge
  // guide holder: plate over the tab with a lip down its outer face, two screws down into the tunnel wall
  const hY = r3(tabTop[0] + .5), hZ = r3(tabTop[1] + 11);           // plate is 22 deep in Z, centred over the tab
  const holderG = { type: "group", at: [0, hY, hZ], items: [
    { type: "extrude", pts: [[-15, 0], [15, 0], [15, 22], [-15, 22]], holes: [[-10.5, 11, 3.3], [10.5, 11, 3.3]], depth: 4, bevel: .4, rot: [-90, 0, 0] },
    { type: "box", size: [10, 10, 4], r: .6, at: [0, -5, -.5] } ] };  // lip down the outer face of the tab
  const screw = (L, head = 4, hr = 5, r = 3) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, 0], [r, 0], [r, L], [0, L]] },
    { type: "lathe", pts: [[0, L], [hr, L], [hr, L + head * .6], [hr * .7, L + head], [0, L + head]] },
    { type: "box", size: [hr * 1.6, 1, 1], r: .2, at: [0, L + head - .2, 0], mat: "black" } ] });
  const screws4 = { type: "pair", at: [[-10.5, hY + 4 - 16, hZ - 11], [10.5, hY + 4 - 16, hZ - 11]].map(v => v.map(r3)), item: screw(16) };

  // rear guide: follows the bowed rear run, pivot eye at the bottom, pad on the back where the tensioner shoe fits
  const rr = [], ro = [], rb = [], rbo = [];
  const RY0 = 30, RY1 = 250;
  for (let y = RY0; y <= RY1 + .01; y += 10) { const g = rearY(y); rr.push(add(g.p, mul(g.n, 4.4))); ro.push(add(g.p, mul(g.n, 9))); rb.push(add(g.p, mul(g.n, 9))); rbo.push(add(g.p, mul(g.n, 15))); }
  const piv = rearY(RY0 - 4), pivC = add(piv.p, mul(piv.n, 16));       // pivot eye centre, just outside the backbone at the bottom
  const PUSH_Y = 150, pg = rearY(PUSH_Y), padBack = add(pg.p, mul(pg.n, 15));
  const guide9 = { type: "group", items: [
    yz([...rr, ...ro.slice().reverse()], 15, 0, "rubber"),
    yz([...rb, ...rbo.slice().reverse()], 6),
    yz(quad(add(pivC, [-2, 0]), [1, 0], [0, 1], -9, 12, -8, 8).map(p => p), 6),     // web from the backbone down to the eye
    { type: "lathe", pts: [[3.2, 0], [8, 0], [8, 10], [3.2, 10]], rot: [0, 0, -90], at: [-5, r3(pivC[0]), r3(pivC[1])] }, // pivot eye
  ] };
  // tensioner shoe on the back of the rear guide; the push rod bears on it
  const shoeZ0 = padBack[1], shoeZ1 = shoeZ0 - 5;
  const shoe = { type: "group", items: [
    { type: "box", size: [12, 34, 5], r: 1, at: [0, PUSH_Y, r3(shoeZ0 - 2.5)] },
    { type: "lathe", pts: [[0, 0], [5, 0], [5, 1.2], [0, 1.2]], rot: [-90, 0, 0], at: [0, PUSH_Y, r3(shoeZ1)], mat: "dark" }, // wear pad for the rod
  ] };
  const zScrew = (L, y, zHead) => ({ type: "group", items: screw(L, 3.5, 4.4, 2.6).items, rot: [-90, 0, 0], at: [0, r3(y), r3(zHead + L)] });
  // screws 23 and 24 go in from the back through the shoe into the guide backbone (one above and one below the rod)
  const sc23 = zScrew(12, PUSH_Y + 11, shoeZ1), sc24 = zScrew(16, PUSH_Y - 11, shoeZ1);

  // pivot bolt 10 (6 x 12) and its gasket, in along -X through the eye into the crankcase boss
  const xBolt = (L, af, xHead, y, z, hh = 4) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -L], [3, -L], [3, 0], [0, 0]] },
    { type: "hex", af, h: hh, y: 0 },
    { type: "lathe", pts: [[3, 0], [af * .62, 0], [af * .62, .8], [3, .8]] } ], rot: [0, 0, -90], at: [xHead, r3(y), r3(z)] });
  const bolt10 = xBolt(12, 10, 6.2, pivC[0], pivC[1]);
  const gasket11 = { type: "ring", ro: 6.5, ri: 3.2, h: 1.2, rot: [0, 0, -90], at: [5, r3(pivC[0]), r3(pivC[1])] };

  // ---- idler on top of the chain between the cams ----
  const IR = 20, IY = CY + RC + 17.5, IZ = 0;
  const idler = { type: "group", items: [
    { type: "gear", r: IR, teeth: 16, h: 7, toothH: 3.4, bore: 12, rot: [0, 0, -90], at: [-3.5, IY, IZ] },
    { type: "lathe", pts: [[12, 0], [14, 0], [14, 10], [12, 10]], rot: [0, 0, -90], at: [-5, IY, IZ] } ] };
  const cushion = { type: "lathe", pts: [[8, 0], [12, 0], [12, 10], [8, 10]], rot: [0, 0, -90], at: [-5, IY, IZ] };
  const spacer = { type: "lathe", pts: [[3.2, 0], [8, 0], [8, 14], [3.2, 14]], rot: [0, 0, -90], at: [-7, IY, IZ] };
  const bolt8 = xBolt(30, 10, 7, IY, IZ);

  // ---- tensioner adjuster on the back of the cylinder block, push rod along +Z onto the shoe ----
  const ZB = r3(shoeZ1 - 16);                                            // block rear face (approximate)
  const AY = PUSH_Y;
  const flangePts = [[-24, -12], [24, -12], [24, 12], [-24, 12]], flangeHoles = [[-17, 0, 4.2], [17, 0, 4.2], [0, 0, 6.5]];
  const body = { type: "group", items: [
    { type: "extrude", pts: flangePts, holes: flangeHoles, depth: 6, bevel: .6, at: [0, AY, ZB - 7] },
    { type: "lathe", pts: [[4.3, 0], [11, 0], [11, 44], [9.5, 46], [4.3, 46]], rot: [-90, 0, 0], at: [0, AY, ZB - 7] }, // barrel, runs back from the flange
    { type: "lathe", pts: [[3.2, 0], [7, 0], [7, 8], [3.2, 8]], at: [0, AY + 9, ZB - 30] },                              // lock screw boss on top
  ] };
  const gasket22 = { type: "extrude", pts: flangePts, holes: flangeHoles, depth: 1, bevel: 0, at: [0, AY, ZB - 1], mat: "brass" };
  const rodLen = r3(shoeZ1 - 1.2 - (ZB - 30));                          // from inside the barrel to the wear pad on the shoe
  const rod = { type: "lathe", pts: [[0, 0], [4, 0], [4, rodLen - 1.5], [2.5, rodLen], [0, rodLen]], rot: [90, 0, 0], at: [0, AY, ZB - 30] };
  const spring16 = { type: "spring", R: 3, wire: .9, h: 19.5, turns: 7, rot: [-90, 0, 0], at: [0, AY, ZB - 30.2] };
  const nut21 = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [4.2, 0], [4.2, 4], [0, 4]] },
    { type: "hex", af: 14, h: 6, y: 4 } ], rot: [-90, 0, 0], at: [0, AY, ZB - 50] };      // cap nut closes the back of the barrel
  const oring20 = { type: "torus", R: 5.2, r: .9, rot: [90, 0, 0], at: [0, AY, ZB - 53.5] };
  const lockScrew = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [3, 0], [3, 34], [0, 34]] },
    { type: "box", size: [5, .8, 1], r: .2, at: [0, 33.8, 0], mat: "black" } ], at: [0, AY + 4, ZB - 26] };
  const washer18 = { type: "ring", ro: 6.2, ri: 3.2, h: 1.2, at: [0, AY + 17, ZB - 26] };
  const nut19 = { type: "hex", af: 10, h: 5, y: 0, hole: 3, at: [0, AY + 18.2, ZB - 26] };
  const zBolt = (L, x) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, 0], [4, 0], [4, L], [0, L]] },
    { type: "hex", af: 12, h: 5.5, y: -5.5 },
    { type: "lathe", pts: [[4, -.8], [8.4, -.8], [8.4, 0], [4, 0]] } ], rot: [90, 0, 0], at: [x, AY, ZB - 7] });
  const bolts13 = { type: "group", items: [zBolt(20, -17), zBolt(16, 17)] };

  const Z = [0, 0, 0], ex = (x, y, z) => [x, y, z];
  const UP = 400, BOD = -110;                                            // guides lift straight up out of the tunnel; adjuster comes off backward
  const P = [
    { id: "chain", ref: "1", name: "Cam chain, 120 links (endless)", mat: "steel", stage: 0, A: Z, E: Z, dir: [0, -1, 0], geom: { type: "group", items: links } },
    { id: "guide2", ref: "2", name: "Front cam chain guide", mat: "steel", stage: 1, A: Z, E: ex(0, UP, 0), dir: [0, -1, 0], geom: guide2 },
    { id: "shoe", ref: "12", name: "Cam chain tensioner (shoe on the rear guide)", mat: "steel", parent: "guide9", stage: 2, A: Z, E: ex(0, UP, -45), dir: [0, 0, 1], geom: shoe },
    { id: "sc23", ref: "23", name: "Screw (tensioner shoe, upper)", mat: "zinc", small: true, parent: "shoe", stage: 2, A: Z, E: ex(0, UP, -95), dir: [0, 0, 1], geom: sc23 },
    { id: "sc24", ref: "24", name: "Screw (tensioner shoe, lower)", mat: "zinc", small: true, parent: "shoe", stage: 2, A: Z, E: ex(0, UP, -95), dir: [0, 0, 1], geom: sc24 },
    { id: "guide9", ref: "9", name: "Rear cam chain guide (pivoting, tensioner side)", mat: "steel", stage: 3, A: Z, E: ex(0, UP, 0), dir: [0, -1, 0], geom: guide9 },
    { id: "gasket11", ref: "11", name: "Gasket (guide pivot bolt)", mat: "brass", small: true, parent: "bolt10", stage: 3, A: Z, E: ex(40, 0, 0), dir: [-1, 0, 0], geom: gasket11 },
    { id: "bolt10", ref: "10", name: "Bolt 6 x 12 (rear guide pivot)", mat: "zinc", small: true, stage: 3, A: Z, E: ex(70, 0, 0), dir: [-1, 0, 0], geom: bolt10 },
    { id: "holder3", ref: "3", name: "Cam chain guide holder", mat: "steel", stage: 4, A: Z, E: ex(0, UP + 70, 0), dir: [0, -1, 0], geom: holderG },
    { id: "screw4", ref: "4", name: "Screws 6 x 20 (guide holder)", mat: "zinc", small: true, parent: "holder3", stage: 4, A: Z, E: ex(0, UP + 110, 0), dir: [0, -1, 0], count: 2, geom: screws4 },
    { id: "idler", ref: "5", name: "Cam chain idler", mat: "steel", stage: 5, A: Z, E: ex(60, 0, 0), dir: [-1, 0, 0], geom: idler },
    { id: "cushion", ref: "6", name: "Idler cushion", mat: "rubber", parent: "idler", stage: 5, A: Z, E: ex(95, 0, 0), dir: [-1, 0, 0], geom: cushion },
    { id: "spacer7", ref: "7", name: "Spacer (idler)", mat: "steel", parent: "idler", stage: 5, A: Z, E: ex(130, 0, 0), dir: [-1, 0, 0], geom: spacer },
    { id: "bolt8", ref: "8", name: "Bolt 6 x 30 (idler)", mat: "zinc", small: true, stage: 5, A: Z, E: ex(175, 0, 0), dir: [-1, 0, 0], geom: bolt8 },
    { id: "adj", ref: "14", name: "Tensioner adjuster body", mat: "alu", stage: 8, A: Z, E: ex(0, 0, BOD), dir: [0, 0, 1], geom: body },
    { id: "rod", ref: "15", name: "Push rod", mat: "steel", parent: "adj", stage: 6, A: Z, E: ex(0, 0, BOD - 95), dir: [0, 0, 1], geom: rod },
    { id: "spring16", ref: "16", name: "Spring (push rod)", mat: "spring", parent: "adj", stage: 6, A: Z, E: ex(0, 0, BOD - 140), dir: [0, 0, 1], geom: spring16 },
    { id: "oring20", ref: "20", name: "O-ring (cap nut)", mat: "rubber", small: true, parent: "nut21", stage: 6, A: Z, E: ex(0, 0, BOD - 158), dir: [0, 0, 1], geom: oring20 },
    { id: "nut21", ref: "21", name: "Cap nut (back of the adjuster)", mat: "zinc", small: true, parent: "adj", stage: 6, A: Z, E: ex(0, 0, BOD - 185), dir: [0, 0, 1], geom: nut21 },
    { id: "lockscrew", ref: "17", name: "Lock screw (push rod)", mat: "steel", small: true, parent: "adj", stage: 7, A: Z, E: ex(0, 110, BOD), dir: [0, -1, 0], geom: lockScrew },
    { id: "washer18", ref: "18", name: "Washer (lock screw)", mat: "steel", small: true, parent: "adj", stage: 7, A: Z, E: ex(0, 40, BOD), dir: [0, -1, 0], geom: washer18 },
    { id: "nut19", ref: "19", name: "Locknut (lock screw)", mat: "zinc", small: true, parent: "adj", stage: 7, A: Z, E: ex(0, 62, BOD), dir: [0, -1, 0], geom: nut19 },
    { id: "gasket22", ref: "22", name: "Tensioner adjuster gasket", mat: "brass", small: true, stage: 8, A: Z, E: ex(0, 0, -55), dir: [0, 0, 1], geom: gasket22 },
    { id: "bolts13", ref: "13", name: "Bolts 8 x 20 and 8 x 16 (adjuster to block)", mat: "zinc", small: true, parent: "adj", stage: 8, A: Z, E: ex(0, 0, BOD - 275), dir: [0, 0, 1], count: 2, geom: bolts13 },
  ];

  D3_MODELS["CMS-BLCK0003"] = {
    id: "CMS-BLCK0003", title: "Cam chain", units: "mm", page: "BLCK0003",
    accuracy: `Approximate geometry. Part identity and numbering come from the CMSNL cam chain page. The chain path uses the same sprocket positions as the crankshaft and camshaft models; its pitch here works out at about ${PITCH.toFixed(2)} mm. The guide, idler and adjuster shapes, and how the shoe, cap nut and screws 23 and 24 fit, are a best reading of the parts list, not measured from a GS750. Use the factory service manual for every dimension.`,
    view: { dir: [1.35, .55, .95], up: [0, 1, 0] },
    lockView: true, // fixed angle: zoom in/out and move only, no rotating
    notModelled: "Refs 13-1 and 13-2 are two bolt lengths; one of each is shown holding the adjuster. Refs 14-1/14-2 and 15-1/15-2 are early and late versions of the same adjuster and push rod, so one of each is drawn. The crank and cam sprockets are on other pages and are not drawn; neither are the crankcase, cylinder block and head the guides and bolts fix into.",
    stages: [
      { t: "Front guide", d: "With the chain hanging up the tunnel, drop the front guide down the exhaust side until its foot sits in the crankcase seat." },
      { t: "Shoe onto the rear guide", d: "Screw the tensioner shoe onto the back of the rear guide with screws 23 and 24." },
      { t: "Rear guide", d: "Lower the rear guide down the intake side and line its eye up with the pivot. Fit the pivot bolt with a new gasket. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Guide holder", d: "After the head is on, fit the holder over the top tab of the front guide and fit its two screws." },
      { t: "Idler", d: "Press the cushion into the idler, slide the spacer through it, then set the idler on top of the chain between the cams and fit the bolt. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Build the adjuster", d: "Oil the push rod and slide it into the barrel, then the spring. Fit a new O-ring to the cap nut and screw it into the back of the barrel." },
      { t: "Lock screw", d: "Screw the lock screw into the top boss, put on the washer and run the locknut down loosely." },
      { t: "Adjuster onto the block", d: "Fit a new gasket and bolt the adjuster to the back of the cylinder block. Set the chain tension and lock the screw; procedure: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();

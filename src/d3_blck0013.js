/* ============ 3D parts model: crankcase left-hand covers, GS750B 1977 (CMSNL BLCK0013) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the engine frame of the crankshaft and transmission models (DG-EN-02, CMS-BLCK0074): crank axis = X,
   +X toward the right (clutch) side, +Y up, +Z forward, crank axis through the origin. Everything on this page sits on the
   left (-X) side. The left crankcase joint face is taken as the plane X = -188 (just outboard of the left crank oil seal in DG-EN-02).
   Layout follows the CMSNL picture: the magneto (alternator) cover on the crank end with the starter clutch lobe up and to the
   rear, the engine sprocket cover behind it with the clutch release boss on the countershaft line, and the starter motor cover
   on top of the crankcase behind the cylinders. Countershaft end taken at (Y -20, Z -150), sprocket at (Y -50, Z -206):
   approximate, not measured. The starter motor cover is long along X, as drawn.
   Screw sizes in the names are read from the Suzuki part numbers (e.g. 02112-06458 = 6 x 45). Everything else is
   APPROXIMATE: outlines are traced from the catalogue picture and scaled to typical 1970s 750 proportions.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset. */
const D3_BLCK0013 = (() => {
  const r3 = v => +(+v).toFixed(2);
  const XC = -188;                                   // left crankcase joint face
  const rad = d => d * Math.PI / 180;

  // ---- 2D outline helpers (points are [a, b] pairs in the plane of the part) ----
  const circle = (ca, cb, r, n = 48) => Array.from({ length: n }, (_, i) => [ca + r * Math.cos(i / n * 2 * Math.PI), cb + r * Math.sin(i / n * 2 * Math.PI)]);
  const hull = P => { const p = P.slice().sort((u, v) => u[0] - v[0] || u[1] - v[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = []; p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
    return lo.slice(0, -1).concat(up.slice(0, -1)); };                                     // counter-clockwise
  const dens = (P, step = 6) => { const o = []; P.forEach((a, i) => { const b = P[(i + 1) % P.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }); return o; };
  const offset = (P, d) => P.map((p, i) => { // CCW polygon, d > 0 grows it
    const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length];
    const e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]], l1 = Math.hypot(...e1) || 1, l2 = Math.hypot(...e2) || 1;
    const n1 = [e1[1] / l1, -e1[0] / l1], n2 = [e2[1] / l2, -e2[0] / l2]; let n = [n1[0] + n2[0], n1[1] + n2[1]]; const ln = Math.hypot(...n) || 1; n = [n[0] / ln, n[1] / ln];
    const k = Math.min(2, 1 / Math.max(.5, n[0] * n1[0] + n[1] * n1[1])); return [p[0] + n[0] * d * k, p[1] + n[1] * d * k]; });
  const inside = (P, q) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j];
    if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  // a flat band (gasket, cover wall) along an outline, as two C-shaped halves so it needs no outline holes
  const band = (P, out, inn, holes = []) => { const O = offset(P, out), I = offset(P, -inn), n = P.length, h = Math.floor(n / 2);
    const A = [...O.slice(0, h + 1), ...I.slice(0, h + 1).reverse()], B = [...O.slice(h), O[0], I[0], ...I.slice(h).reverse()];
    return [A, B].map(pts => ({ pts, holes: holes.filter(q => inside(pts, q)) })); };

  // ---- placing outlines in 3D ----
  // side outlines are [z, y] pairs, pushed along +X from x0 by w
  const side = (pts, x0, w, holes = [], bevel = 0, mat) => ({ type: "extrude", pts: pts.map(([z, y]) => [r3(-z), r3(y)]), holes: holes.map(([z, y, r]) => [r3(-z), r3(y), r]),
    depth: w, bevel, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  const sideBand = (P, out, inn, x0, w, holes = [], mat) => ({ type: "group", items: band(P, out, inn, holes).map(b => side(b.pts, x0, w, b.holes.map(q => [q[0], q[1], q[2]]), 0, mat)) });
  // top outlines are [x, z] pairs, pushed up +Y from y0 by h
  const top = (pts, y0, h, bevel = 0, holes = []) => ({ type: "extrude", pts: pts.map(([x, z]) => [r3(x), r3(-z)]), holes: holes.map(([x, z, r]) => [r3(x), r3(-z), r]), depth: h, bevel, rot: [-90, 0, 0], at: [0, y0, 0] });
  // lathe turned on an X-direction axis: profile [r, h] with h growing toward -X (outward) from x0
  const xl = (pts, x0, z, y, mat) => ({ type: "lathe", pts, rot: [0, 0, 90], at: [r3(x0), r3(y), r3(z)], ...(mat ? { mat } : {}) });
  const tubeX = (ro, ri, xIn, xOut, z, y, mat) => xl([[ri, 0], [ro, 0], [ro, xIn - xOut], [ri, xIn - xOut]], xIn, z, y, mat);
  // pan-head cross-point screw: head outward (-X) from x = 0, shank along +X for L
  const screwX = (L, r = 3, hr = 6) => ({ type: "group", rot: [0, 0, 90], items: [
    { type: "lathe", pts: [[0, -L], [r - .4, -L], [r, -L + .6], [r, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [hr, 0], [hr, 1.6], [hr * .8, 3.6], [hr * .4, 4.2], [0, 4.2]] },
    { type: "box", size: [hr * 1.1, 1.2, 1.2], r: .2, at: [0, 3.9, 0], mat: "black" },
    { type: "box", size: [1.2, 1.2, hr * 1.1], r: .2, at: [0, 3.9, 0], mat: "black" } ] });
  const pol = (cz, cy, R, deg) => [r3(cz + R * Math.cos(rad(deg))), r3(cy + R * Math.sin(rad(deg)))];   // deg measured from +Z (front) toward +Y (up)

  // ================= magneto (alternator) cover, ref 1 =================
  const MR = 80, LB = [-90, 62], LR = 35;                                        // main outline radius; starter clutch lobe centre [z, y] and radius
  const HM = dens(hull([...circle(0, 0, MR, 72), ...circle(LB[0], LB[1], LR, 40)]));
  const MF = XC - 1;                                                             // cover flange face (gasket 1 mm)
  const WALL = 40, FACE = MF - WALL - 4;                                         // outer face plane of the cover
  // screws: [z, y] and length; heads sit on lugs so each screw has about 15 mm of thread in the case
  const S5 = [pol(0, 0, 84, 4), pol(LB[0], LB[1], 40, 90)], S6 = [pol(0, 0, 84, 55), pol(0, 0, 84, 118), pol(LB[0], LB[1], 40, 229), pol(0, 0, 84, 186)], S7 = [224, 270, 315].map(a => pol(0, 0, 84, a));
  const head = L => XC + 15 - L;                                                 // x of the screw head seat
  const DOW = [pol(0, 0, 78, 152), pol(0, 0, 78, 296)];                          // dowel pins
  const lugs = (pts, L) => pts.map(([z, y]) => tubeX(7, 3.3, MF, head(L), z, y));
  const cover1 = { type: "group", items: [
    sideBand(HM, 0, 4, MF - WALL, WALL),                                         // side wall
    side(HM, FACE, 4, [], 1.5),                                                  // outer face
    xl([[0, 0], [62, 0], [62, 6], [59, 14], [55, 18], [46.5, 18], [46.5, 16.5], [0, 16.5]], FACE, 0, 0),   // round dome over the rotor end, emblem recess
    xl([[0, 0], [29, 0], [29, 2], [27, 4], [0, 4]], FACE, LB[0], LB[1]),          // raised cap over the starter clutch
    ...lugs(S5, 45), ...lugs(S6, 40), ...lugs(S7, 35),
    ...DOW.map(([z, y]) => tubeX(7, 4, MF, MF - 12, z, y)),                      // dowel bosses
  ] };
  const gasket3 = sideBand(HM, 9, 3, MF, 1, [...S5, ...S6, ...S7].map(([z, y]) => [z, y, 3.3]).concat(DOW.map(([z, y]) => [z, y, 4.1])));
  const pins4 = { type: "group", items: DOW.map(([z, y]) => ({ type: "cyl", r: 4, h: 18, axis: "x", at: [XC - 10, y, z] })) };
  const DF = FACE - 16.5;                                                        // floor of the emblem recess
  const emblem2 = { type: "group", items: [
    xl([[0, 0], [46, 0], [46, 1.6], [45, 2.6], [0, 2.6]], DF, 0, 0),
    { type: "box", size: [.8, 13, 64], r: .3, at: [DF - 2.8, 0, 0], mat: "black" },     // the SUZUKI lettering band
    { type: "box", size: [.8, 1.2, 76], r: .3, at: [DF - 2.8, 10, 0], mat: "black" },
    { type: "box", size: [.8, 1.2, 76], r: .3, at: [DF - 2.8, -10, 0], mat: "black" } ] };
  const scr = (pts, L) => ({ type: "array", pos: pts.map(([z, y]) => [r3(head(L)), y, z]), item: screwX(L) });

  // ================= engine sprocket cover, ref 8 =================
  // outline traced from the picture (px, py) and scaled 0.65 mm per pixel about the clutch release boss
  const CS = [-150, -20], DS = [-206, -50];                                      // countershaft end (release boss) and sprocket centre, [z, y]
  const pic = (px, py) => [r3(CS[0] - (px - 757) * .65), r3(CS[1] - (py - 390) * .65)];
  const HS = dens(hull([[765, 282], [912, 268], [950, 295], [968, 350], [968, 420], [950, 470], [915, 505], [870, 515], [740, 505], [680, 500], [675, 440], [690, 430], [730, 330]].map(q => pic(...q))));
  const SF = -258, SW = 22;                                                      // outer face plane, wall depth
  const S10 = [pic(738, 497), pic(860, 506), pic(938, 382)], S11 = [pol(CS[0], CS[1], 33, 115), pol(CS[0], CS[1], 33, 250)], S12 = [pic(805, 284), pic(890, 274)];
  const PIN9 = pic(880, 488);
  const SPB = SF + SW + 4;                                                       // inner end of the screw 10 bosses, where the spacers start
  const cover8 = { type: "group", items: [
    side(HS, SF, 4, [[CS[0], CS[1], 9]], 1.5),                                   // outer face, hole for the release adjuster
    sideBand(HS, 0, 3.5, SF + 4, SW),                                            // side wall
    tubeX(24, 9, SF + 34, SF - 8, CS[0], CS[1]),                                 // clutch release boss (stands 8 mm proud of the face)
    ...S10.map(([z, y]) => tubeX(7.5, 3.3, SPB, SF, z, y)),
    ...S11.map(([z, y]) => tubeX(7, 3.3, SF + 30, SF, z, y)),
    ...S12.map(([z, y]) => tubeX(7, 3.3, SF + 10, SF, z, y)),
    tubeX(12, 4.6, -220, SF, PIN9[0], PIN9[1]),                                  // socket for the cushion on pin 9
    { type: "box", size: [1, 14, 26], r: .5, at: [SF - .5, pic(708, 470)[1], pic(708, 470)[0]], mat: "dark" },   // label plate
  ] };
  const spacer = pts => ({ type: "group", items: pts.map(([z, y]) => tubeX(6, 3.3, XC, SPB, z, y)) });
  // rubber pads under the spacer feet: 16 links the two lower spacers, 14 sits under the rear spacer with an arm up the case
  const pad = (a, b, w) => dens(hull([...circle(a[0], a[1], w, 20), ...circle(b[0], b[1], w, 20)]));
  const gasket16 = side(pad(S10[0], S10[1], 9), XC - 2, 2, [[S10[0][0], S10[0][1], 6.2], [S10[1][0], S10[1][1], 6.2]], 0);
  const g14b = [S10[2][0] + 6, S10[2][1] + 34];
  const gasket14 = side(pad(S10[2], g14b, 9), XC - 2, 2, [[S10[2][0], S10[2][1], 6.2], [g14b[0], g14b[1], 3.4]], 0);
  const pin9 = { type: "cyl", r: 4.5, h: 20, axis: "x", at: [XC - 14, PIN9[1], PIN9[0]] };
  const cushion17 = tubeX(10, 4.5, -201, -220, PIN9[0], PIN9[1]);
  const CAPX = SF - 8;                                                           // outer face of the release boss
  const S19 = pol(CS[0], CS[1], 17, 300);
  const cap18 = { type: "group", items: [
    side(dens(hull([...circle(CS[0], CS[1], 13, 32), ...circle(S19[0], S19[1], 6, 16)])), CAPX - 2.5, 2.5, [[S19[0], S19[1], 2.7]], .5),
    xl([[0, 0], [8.6, 0], [8.6, 5], [0, 5]], CAPX + 5, CS[0], CS[1], "black"),   // plug into the adjuster hole
  ] };
  const screw19 = { ...screwX(25, 2.5, 5), at: [CAPX - 2.5, S19[1], S19[0]] };

  // ================= starter motor cover, ref 20 (on top of the crankcase behind the cylinders) =================
  const YT = 102, SH = 26;                                                       // crankcase top face under the cover, skirt height
  const rr = (x0, x1, z0, z1, r) => { const p = []; [[x1 - r, z1 - r, 0], [x0 + r, z1 - r, 90], [x0 + r, z0 + r, 180], [x1 - r, z0 + r, 270]].forEach(([cx, cz, a0]) => {
    for (let k = 0; k <= 8; k++) { const a = rad(a0 + k * 90 / 8); p.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } }); return p; };
  const HT = dens(rr(-182, -22, -125, -55, 30));
  const B22 = [[-172, -90], [-32, -90]];                                         // bolt positions [x, z]
  const BH = YT + SH + 3.5;                                                      // top of the cover = bolt washer seat
  const cover20 = { type: "group", items: [
    ...band(HT.map(([x, z]) => [x, -z]), 0, 3).map(b => ({ type: "extrude", pts: b.pts.map(([x, mz]) => [r3(x), r3(mz)]), depth: SH, bevel: 0, rot: [-90, 0, 0], at: [0, YT + 1, 0] })),
    top(HT, YT + SH - 3 + 1, 4, 1.5, B22.map(([x, z]) => [x, z, 2.8])),
    top(dens(rr(-165, -40, -113, -67, 18)), YT + SH + 2, 2, 1),                 // raised centre panel
    ...B22.map(([x, z]) => ({ type: "lathe", pts: [[2.8, 0], [7, 0], [7, 8], [2.8, 8]], at: [x, BH - 9.5, z] })),   // bolt bosses under the top
  ] };
  const gasket21 = { type: "group", items: band(HT.map(([x, z]) => [x, -z]), 3, 3).map(b => ({ type: "extrude", pts: b.pts.map(([x, mz]) => [r3(x), r3(mz)]), depth: 1, bevel: 0, rot: [-90, 0, 0], at: [0, YT, 0] })) };
  const washer23 = { type: "array", pos: B22.map(([x, z]) => [x, BH + .6, z]), item: { type: "lathe", pts: [[2.7, 0], [5.6, 0], [5.6, 1.2], [2.7, 1.2]] } };
  const bolt22 = { type: "array", pos: B22.map(([x, z]) => [x, BH + 1.8, z]), item: { type: "group", items: [
    { type: "lathe", pts: [[0, -10], [2.5, -10], [2.5, 0], [0, 0]] }, { type: "hex", af: 8, h: 3.5, y: 0 } ] } };

  // ================= parts =================
  const Z = [0, 0, 0], X = d => [d, 0, 0], Y = d => [0, d, 0], IN = [1, 0, 0], DOWN = [0, -1, 0];
  const P = [
    { id: "emblem2", ref: "2", name: "Emblem (SUZUKI badge, magneto cover)", mat: "chrome", parent: "cover1", stage: 1, A: Z, E: X(-75), dir: IN, geom: emblem2 },
    { id: "pins4", ref: "4", name: "Dowel pins (magneto cover)", mat: "steel", small: true, count: 2, stage: 2, A: Z, E: X(-8), dir: IN, geom: pins4 },
    { id: "gasket3", ref: "3", name: "Magneto cover gasket", mat: "brass", small: true, stage: 2, A: Z, E: X(-30), dir: IN, geom: gasket3 },
    { id: "cover1", ref: "1", name: "Magneto cover (left crankcase cover)", mat: "alu", shell: true, stage: 3, A: Z, E: X(-50), dir: IN, geom: cover1 },
    { id: "screw7", ref: "7", name: "Screws 6 x 35 (magneto cover, bottom)", mat: "zinc", small: true, count: 3, parent: "cover1", stage: 4, A: Z, E: X(-165), dir: IN, geom: scr(S7, 35) },
    { id: "screw6", ref: "6", name: "Screws 6 x 40 (magneto cover)", mat: "zinc", small: true, count: 4, parent: "cover1", stage: 4, A: Z, E: X(-215), dir: IN, geom: scr(S6, 40) },
    { id: "screw5", ref: "5", name: "Screws 6 x 45 (magneto cover, front and lobe)", mat: "zinc", small: true, count: 2, parent: "cover1", stage: 4, A: Z, E: X(-270), dir: IN, geom: scr(S5, 45) },
    { id: "pin9", ref: "9", name: "Pin (sprocket cover locating)", mat: "steel", small: true, stage: 5, A: Z, E: X(-20), dir: IN, geom: pin9 },
    { id: "cushion17", ref: "17", name: "Cushion, engine sprocket cover (rubber, on pin 9)", mat: "rubber", small: true, parent: "pin9", stage: 5, A: Z, E: X(-85), dir: IN, geom: cushion17 },
    { id: "gasket16", ref: "16", name: "Gasket (pad under the two lower spacers)", mat: "rubber", small: true, stage: 5, A: Z, E: X(-10), dir: IN, geom: gasket16 },
    { id: "gasket14", ref: "14", name: "Gasket (pad under the rear spacer)", mat: "rubber", small: true, stage: 5, A: Z, E: X(-10), dir: IN, geom: gasket14 },
    { id: "spacer13", ref: "13", name: "Spacers (sprocket cover, lower)", mat: "steel", small: true, count: 2, stage: 5, A: Z, E: X(-45), dir: IN, geom: spacer(S10.slice(0, 2)) },
    { id: "spacer15", ref: "15", name: "Spacer (sprocket cover, rear)", mat: "steel", small: true, stage: 5, A: Z, E: X(-45), dir: IN, geom: spacer(S10.slice(2)) },
    { id: "cover8", ref: "8", name: "Engine sprocket cover", mat: "alu", shell: true, stage: 6, A: Z, E: X(-95), dir: IN, geom: cover8 },
    { id: "screw12", ref: "12", name: "Screws 6 x 25 (sprocket cover, top tabs)", mat: "zinc", small: true, count: 2, parent: "cover8", stage: 7, A: Z, E: X(-190), dir: IN, geom: scr0(S12, 25) },
    { id: "screw11", ref: "11", name: "Screws 6 x 45 (sprocket cover, by the release boss)", mat: "zinc", small: true, count: 2, parent: "cover8", stage: 7, A: Z, E: X(-250), dir: IN, geom: scr0(S11, 45) },
    { id: "screw10", ref: "10", name: "Screws 6 x 85 (sprocket cover, through the spacers)", mat: "zinc", small: true, count: 3, parent: "cover8", stage: 7, A: Z, E: X(-350), dir: IN, geom: scr0(S10, 85) },
    { id: "cap18", ref: "18", name: "Cap, clutch release adjuster", mat: "black", parent: "cover8", stage: 8, A: Z, E: X(-110), dir: IN, geom: cap18 },
    { id: "screw19", ref: "19", name: "Screw 5 x 25 (release adjuster cap)", mat: "zinc", small: true, parent: "cap18", stage: 8, A: Z, E: X(-140), dir: IN, geom: screw19 },
    { id: "gasket21", ref: "21", name: "Starter motor cover gasket", mat: "rubber", small: true, stage: 9, A: Z, E: Y(40), dir: DOWN, geom: gasket21 },
    { id: "cover20", ref: "20", name: "Starter motor cover", mat: "chrome", shell: true, stage: 9, A: Z, E: Y(90), dir: DOWN, geom: cover20 },
    { id: "washer23", ref: "23", name: "Washers (starter motor cover bolts)", mat: "steel", small: true, count: 2, parent: "cover20", stage: 10, A: Z, E: Y(170), dir: DOWN, geom: washer23 },
    { id: "bolt22", ref: "22", name: "Bolts 5 x 10 (starter motor cover)", mat: "zinc", small: true, count: 2, parent: "cover20", stage: 10, A: Z, E: Y(200), dir: DOWN, geom: bolt22 },
  ];
  // sprocket cover screws: heads on the outer face (SF), so the thread reaches the case bosses
  function scr0(pts, L) { return { type: "array", pos: pts.map(([z, y]) => [SF, y, z]), item: screwX(L) }; }

  return {
    id: "CMS-BLCK0013", title: "Crankcase left-hand covers", units: "mm", page: "BLCK0013",
    accuracy: "Approximate geometry. Part identity, numbering and layout follow the CMSNL crankcase LH cover picture; outlines are traced from that picture and scaled to typical 1970s 750 proportions, not measured from a GS750. Screw sizes come from the Suzuki part numbers. What the gaskets 14 and 16, the spacers and the cushion 17 behind the sprocket cover look like, and the starter cover bolt count, are a best reading of the picture. Use the factory service manual for every dimension.",
    view: { dir: [-1, .65, .75], up: [0, 1, 0] },
    notModelled: "Ref 2-2 is a second emblem part number (another badge style); one emblem is drawn as ref 2. Ref 8-1 and 8-2 are the early and late sprocket cover, drawn once. Ref 20-1 and 20-2 are two starter cover versions, drawn once. The crankcase, alternator, sprocket, chain and clutch release parts these covers close over are on other pages and are not drawn.",
    stages: [
      { t: "Emblem", d: "Press the SUZUKI emblem into the recess in the magneto cover dome." },
      { t: "Dowels and gasket", d: "Tap the two dowel pins into the crankcase face and hang a new magneto cover gasket on them. Clean the joint faces first." },
      { t: "Magneto cover", d: "Offer the cover up over the alternator and slide it onto the dowels. Mind the stator wiring grommet so it doesn't get pinched." },
      { t: "Magneto cover screws", d: "Fit the two 6 x 45 screws in the deep lugs, the four 6 x 40 and the three 6 x 35 along the bottom. Snug them in a criss-cross order. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Sprocket cover spacers", d: "Fit pin 9 with its rubber cushion, lay the rubber pads on the case and stand the three spacers in them." },
      { t: "Sprocket cover", d: "With the chain and clutch release in place, fit the sprocket cover over the spacers and the cushion." },
      { t: "Sprocket cover screws", d: "Fit the three long 6 x 85 screws through the spacers, the two 6 x 45 by the release boss and the two 6 x 25 in the top tabs. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Release adjuster cap", d: "Set the clutch release play first (procedure: VERIFY IN FACTORY SERVICE MANUAL), then fit the cap over the adjuster and its screw." },
      { t: "Starter motor cover", d: "Lay the gasket on the crankcase top behind the cylinders and set the cover over the starter motor." },
      { t: "Starter cover bolts", d: "Fit the bolts with their washers. Small bolts in alloy, so go easy. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();
D3_MODELS["CMS-BLCK0013"] = D3_BLCK0013;

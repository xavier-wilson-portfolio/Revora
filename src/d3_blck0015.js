/* ============ 3D parts model: crankcase RH cover (clutch cover and contact breaker cover), GS750B 1977 (CMSNL BLCK0015) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: the same as the crankshaft and clutch models (DG-EN-02 / DG-EN-03): crank axis = X through the origin
   (+X toward the right / clutch side), +Y up, +Z forward. The covers sit on the +X side of the engine.
   The right crankcase gasket face is taken as the plane X = 180. The clutch (transmission input shaft) axis is put
   120 mm behind and 15 mm above the crank axis. The contact breaker (points) cover sits on the crank axis, in front of
   the clutch, on a raised ring of the clutch cover's front lobe.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Identity and numbering: CMSNL crankcase RH cover page (refs 1-11); layout read from the CMSNL picture.
   Geometry: APPROXIMATE. Outline, depths, screw positions and counts are typical for a 1970s Suzuki four, not measured
   from a GS750. Screw sizes are read from the Suzuki part numbers (02112-06557 = 6 x 55, 02112-06208 = 6 x 20,
   02112-05308 = 5 x 30). The O-ring size (2.2 x 32) is from the catalogue description. */
const D3_BLCK0015 = (() => {
  const r3 = v => +v.toFixed(3), D2R = Math.PI / 180;
  const X0 = 180, DEPTH = 40, XF = X0 + DEPTH;            // gasket face, cover wall depth, outer face of the cover body
  const C = [-120, 15], RC = 100;                         // clutch axis [z, y] and outline radius round it
  const K = [0, 0], RK = 66;                              // crank axis and outline radius of the front lobe
  const RCi = 84, RKi = 51;                               // inside edge of the gasket band
  const pol = (c, r, a) => [r3(c[0] + r * Math.cos(a * D2R)), r3(c[1] + r * Math.sin(a * D2R))]; // [z, y]

  // convex hull (z, y) of two circles -> cover outline
  const hull2 = (rc, rk, n = 72) => {
    const P = [];
    for (let i = 0; i < n; i++) { P.push(pol(C, rc, i * 360 / n)); P.push(pol(K, rk, i * 360 / n)); }
    P.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of P.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  const OUT = hull2(RC, RK), IN = hull2(RCi, RKi);
  // (z, y) outline -> extrude in the YZ plane, pushed out along +X from x0 by depth
  const yz = (pts, depth, x0, holes = [], bevel = .8, mat) => ({ type: "extrude", pts: pts.map(p => [r3(-p[0]), p[1]]), holes: holes.map(h => [r3(-h[0]), h[1], h[2]]), depth, bevel, rot: [0, 90, 0], at: [x0, 0, 0], ...(mat ? { mat } : {}) });
  // lathe turned onto the X axis (local y -> world +X), local y = 0 at x0, centred on [z, y]
  const latheX = (pts, x0, c, mat) => ({ type: "lathe", pts, rot: [0, 0, -90], at: [x0, c[1], c[0]], ...(mat ? { mat } : {}) });

  // ---- fastener and dowel positions ([z, y]) ----
  const S4 = [80, 115, 150, 180, 210, 280, 310].map(a => pol(C, 92, a)).concat([75, 20, -30, -80].map(a => pol(K, 58, a)));
  const EARS = [pol(C, 104, 200), pol(C, 104, 250)];     // thin flange ears for the two short screws (ref 5)
  const DOW = [pol(C, 92, 97), pol(C, 92, 245)];         // two dowel pins
  const F = [-45, 58];                                   // oil filler hole
  const W = [-40, -50];                                  // oil level window
  const S11 = [90, 210, 330].map(a => pol(K, 45, a));    // points cover screws

  // ---- 1: clutch cover ----
  const OUTF = hull2(RC + 2.5, RK + 2.5);                 // slightly wider flange at the gasket face
  const coverHoles = [...S4.map(p => [...p, 3.3]), ...DOW.map(p => [...p, 5.1]), [K[0], K[1], 40]];
  const cover = { type: "group", items: [
    yz(OUTF, 7, X0, coverHoles, .6),                                             // flange
    yz(OUT, DEPTH - 1, X0 + 1, coverHoles.filter(h => h[2] !== 5.1), 1.6),       // dowel holes are blind (flange only)                                 // wall and outer face
    ...EARS.map(e => ({ type: "group", items: [                                  // ears for screws 5
      latheX([[3.3, 0], [10, 0], [10, 8], [3.3, 8]], X0, e),
      { type: "box", size: [8, 14, 14], r: 1, at: [X0 + 4, r3((e[1] + C[1]) / 2 + (e[1] - C[1]) * .38), r3((e[0] + C[0]) / 2 + (e[0] - C[0]) * .38)] } ] })),
    latheX([[0, 0], [64, 0], [64, 6], [60, 20], [52, 29], [30, 32], [0, 32]], XF - .5, C),  // clutch dome
    latheX([[0, 32], [14, 32], [14, 34], [0, 34]], XF - .5, C),                // centre spot on the dome
    latheX([[40, 0], [48, 0], [48, 6.5], [40, 6.5]], XF - .5, K),             // raised ring for the points cover
    latheX([[15.6, 0], [22, 0], [22, 6.5], [15.6, 6.5]], XF - .5, F),         // filler boss
    latheX([[9, 0], [13, 0], [13, 3.5], [11, 4.5], [9, 4.5]], XF - .5, W),     // oil level window rim
    latheX([[0, 0], [9, 0], [9, 2.5], [0, 2.5]], XF - .5, W, "dark"),          // window glass
    ...S4.map(p => latheX([[3.3, 0], [7.5, 0], [7.5, 1.5], [3.3, 1.5]], XF - .5, p)), // spot faces under the screw heads
  ] };

  // ---- 2: gasket (band between the outer and inner outlines, joined by a hairline slit) ----
  const ia = IN.reduce((b, p, i) => p[0] < IN[b][0] ? i : b, 0), oa = OUT.reduce((b, p, i) => p[0] < OUT[b][0] ? i : b, 0);
  const oRot = OUT.slice(oa).concat(OUT.slice(0, oa)), iRot = IN.slice(ia).concat(IN.slice(0, ia)).reverse();
  const band = [...oRot, oRot[0].map((v, k) => k ? r3(v + .2) : v), [iRot[iRot.length - 1][0], r3(iRot[iRot.length - 1][1] + .2)], ...iRot.slice(0, -1), iRot[iRot.length - 1]];
  const gasket2 = yz(band, .8, X0 - .8, [...S4.map(p => [...p, 3.4]), ...DOW.map(p => [...p, 5.2])], 0, "brass");

  // ---- 3: dowel pins, half in the crankcase, half in the cover ----
  const dowels = { type: "group", items: DOW.map(p => latheX([[0, 0], [5, 0], [5, 16], [4.4, 16.6], [0, 16.6]], X0 - 8, p)) };

  // ---- screws: pan head, cross slot, shank along -X from the head seat at xh ----
  const screwG = (L, r, hr, hh) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -L], [r, -L], [r, 0], [hr, 0], [hr, hh * .55], [hr * .75, hh], [0, hh]] },
    { type: "box", size: [hr * 1.3, 1.4, 1], r: .2, at: [0, hh - .3, 0], mat: "black" },
    { type: "box", size: [1, 1.4, hr * 1.3], r: .2, at: [0, hh - .3, 0], mat: "black" } ], rot: [0, 0, -90] });
  const screwsAt = (pts, xh, L, r, hr, hh) => ({ type: "array", pos: pts.map(p => [xh, p[1], p[0]]), item: screwG(L, r, hr, hh) });
  const screws4 = screwsAt(S4, XF + 1, 55, 3, 5.5, 4);          // heads on the spot faces
  const screws5 = screwsAt(EARS, X0 + 8, 20, 3, 5.5, 4);         // heads on the ears

  // ---- 6, 7: oil filler cap and its O-ring ----
  const XB = XF + 6;                                             // top of the filler boss
  const cap = latheX([[0, -12], [15.2, -12], [15.2, -1], [14, 0], [14, 2.2], [20, 2.2], [20, 5], [18, 7.5], [10, 9], [0, 9]], XB, F);
  const capWing = { type: "box", size: [8, 30, 6], r: 2, at: [XB + 11.5, F[1], F[0]] };
  const capG = { type: "group", items: [cap, { ...capWing }] };
  const oring7 = { type: "torus", R: 17.1, r: 1.1, rot: [0, 0, 90], at: [XB + 1.1, F[1], F[0]] };

  // ---- 8, 9, 10, 11: contact breaker cover, emblem, gasket, screws ----
  const XP = XB;                                                 // top of the raised ring = points gasket seat
  const ringPts = n => Array.from({ length: n }, (_, i) => pol(K, 48, i * 360 / n));
  const gasket10 = yz(ringPts(64), .8, XP, [[K[0], K[1], 40], ...S11.map(p => [...p, 2.9])], 0, "brass");
  const XC8 = XP + .8, H8 = 21;
  const cover8 = { type: "group", items: [
    latheX([[44, 0], [48, 0], [48, H8 - 3], [46, H8], [0, H8], [0, H8 - 2.5], [44, H8 - 2.5]], XC8, K),
    ...S11.map(p => latheX([[2.7, H8 - 1], [6, H8 - 1], [6, H8], [2.7, H8]], XC8, p)),
  ] };
  const XE = XC8 + H8;
  // emblem: oval badge with raised "GS" letters (letters run toward +Z, which is left-to-right seen from the right side)
  const L = (u, v, w, h) => ({ type: "box", size: [1.2, h, w], r: .3, at: [XE + 2, v, u] });
  const emblem = { type: "group", items: [
    { type: "lathe", pts: [[0, 0], [24, 0], [24, 1], [22.5, 1.6], [0, 1.6]], rot: [0, 0, -90], at: [XE, 0, 0] },
    { type: "group", mat: "black", items: [
      L(-9, 9, 10, 2.4), L(-13, 0, 2.4, 18), L(-9, -9, 10, 2.4), L(-5, -4.5, 2.4, 9), L(-6.5, -1, 5, 2.4),        // G
      L(9, 9, 10, 2.4), L(5, 4.5, 2.4, 9), L(9, 0, 10, 2.4), L(13, -4.5, 2.4, 9), L(9, -9, 10, 2.4) ] } ] };     // S
  const screws11 = screwsAt(S11, XE, 30, 2.5, 4.6, 3.5);

  // ---- exploded positions: everything comes off along +X; the points cover set also moves forward, the cap moves up ----
  const Z = [0, 0, 0];
  const PF = 140;                                                // forward offset of the points cover set
  const parts = [
    { id: "dowels", ref: "3", name: "Dowel pins (cover locating)", mat: "steel", small: true, count: 2, stage: 1, A: Z, E: [26, 0, 0], dir: [-1, 0, 0], geom: dowels },
    { id: "gasket2", ref: "2", name: "Clutch cover gasket", mat: "brass", small: true, stage: 1, A: Z, E: [62, 0, 0], dir: [-1, 0, 0], geom: gasket2 },
    { id: "cover1", ref: "1", name: "Clutch cover", mat: "alu", shell: true, stage: 2, A: Z, E: [120, 0, 0], dir: [-1, 0, 0], geom: cover },
    { id: "screws4", ref: "4", name: "Screws 6 x 55 (clutch cover)", mat: "zinc", small: true, count: S4.length, parent: "cover1", stage: 3, A: Z, E: [215, 0, 0], dir: [-1, 0, 0], geom: screws4 },
    { id: "screws5", ref: "5", name: "Screws 6 x 20 (clutch cover ears)", mat: "zinc", small: true, count: 2, parent: "cover1", stage: 3, A: Z, E: [300, 0, 0], dir: [-1, 0, 0], geom: screws5 },
    { id: "gasket10", ref: "10", name: "Contact breaker cover gasket", mat: "brass", small: true, parent: "cover1", stage: 4, A: Z, E: [60, 0, PF], dir: [-1, 0, 0], geom: gasket10 },
    { id: "cover8", ref: "8", name: "Contact breaker cover", mat: "alu", shell: true, parent: "cover1", stage: 4, A: Z, E: [95, 0, PF], dir: [-1, 0, 0], geom: cover8 },
    { id: "emblem9", ref: "9", name: "Emblem (contact breaker cover)", mat: "chrome", parent: "cover8", stage: 4, A: Z, E: [130, 0, PF], dir: [-1, 0, 0], geom: emblem },
    { id: "screws11", ref: "11", name: "Screws 5 x 30 (contact breaker cover)", mat: "zinc", small: true, count: 3, parent: "cover8", stage: 5, A: Z, E: [175, 0, PF], dir: [-1, 0, 0], geom: screws11 },
    { id: "oring7", ref: "7", name: "O-ring 2.2 x 32 (filler cap)", mat: "rubber", small: true, parent: "cap6", stage: 6, A: Z, E: [115, 95, 0], dir: [-1, 0, 0], geom: oring7 },
    { id: "cap6", ref: "6", name: "Oil filler cap", mat: "dark", parent: "cover1", stage: 6, A: Z, E: [150, 95, 0], dir: [-1, 0, 0], geom: capG },
  ];

  return {
    id: "CMS-BLCK0015", title: "Crankcase RH cover", units: "mm", page: "BLCK0015",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL crankcase RH cover page and the layout follows the CMSNL picture. The cover outline, depths, screw positions and screw counts are typical for a 1970s Suzuki four, not measured from a GS750. Screw sizes are read from the Suzuki part numbers and the O-ring size from the catalogue description. Use the factory service manual for every dimension.",
    view: { dir: [1.45, .5, .55], up: [0, 1, 0] },
    notModelled: "Ref 2 has two catalogue rows (2-1 replaced by 2-2), ref 8 has two (8-1 replaced by 8-2) and ref 9 has two (9-1 replaced by 9-2); one of each is drawn. The crankcase, clutch and contact breaker parts behind the covers are on other pages and aren't drawn, so the dowels and screws go into nothing visible. The number of screws 4 and 5 and their positions are a best guess from the picture.",
    stages: [
      { t: "Dowels and gasket", d: "Clean both faces. Tap the two dowel pins into the crankcase and hang a new gasket on them." },
      { t: "Clutch cover", d: "Offer the cover up square over the clutch and push it onto the dowels until it sits flat on the gasket." },
      { t: "Cover screws", d: "Fit the long screws round the cover and the two short ones in the ears. Tighten them a little at a time in a criss-cross order. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Points cover", d: "Lay a new gasket on the raised ring at the front of the clutch cover and put the contact breaker cover on it, emblem facing out." },
      { t: "Points cover screws", d: "Fit the three screws and tighten them evenly. Don't overdo it, they go into aluminium." },
      { t: "Filler cap", d: "Fit a new O-ring to the filler cap, fill with oil to the window and screw the cap in by hand. Oil grade and amount: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts,
  };
})();
D3_MODELS["CMS-BLCK0015"] = D3_BLCK0015;

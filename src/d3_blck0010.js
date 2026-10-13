/* ============ 3D parts model: clutch release, GS750B 1977 (CMSNL BLCK0010) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame: X along the clutch push rod, which runs through the hollow transmission input shaft. +X points out of the
   LEFT side of the engine (toward the release mechanism), +Y up, +Z forward. X = 0 is the outer face of the left
   crankcase where the push rod comes out of the input shaft bearing bore.
   Each part is drawn in an "axial" local frame (local Y = push rod axis, pointing outboard) and turned onto world X with
   rot [0, 0, -90]; in that frame local -X is world +Y and local Z is world Z. A is where the part's local origin sits.
   Arrangement (best reading of the catalogue list, not confirmed against the factory drawing):
   - Rod holder (2) and oil seal 8 x 47 x 8 (3) sit in the 47 mm bearing bore outside the input shaft's left bearing,
     held in by the retainer plate (4) and its bolts (5).
   - The release is a ball screw: the outer guide (6) is bolted to the outside of the engine sprocket cover (12, with
     gasket 13 under its flange); the inner guide (11) turns inside it on three balls (14) running in helical grooves,
     so turning it with the arm (7) screws it inward. The adjusting screw (8) runs through the centre of the inner guide
     and presses on the end of the push rod; locknut (9) and washer (10) lock the screw and clamp the arm on.
     Spring (16) sits in the outer guide and pushes the inner guide back out. Oil seal 8 x 20 x 7 (15) is in the nose of
     the outer guide around the push rod.
   Geometry: APPROXIMATE. Seal sizes are from the catalogue descriptions (8 x 47 x 8, 8 x 20 x 7) and the washer from
   ref 10 (8.5 x 26 x 1.2). Push rod length, guide, arm and fastener sizes are typical, not measured from a GS750. */
(() => {
  const r3 = v => +v.toFixed(3);
  const AX = items => ({ type: "group", rot: [0, 0, -90], items });              // axial frame -> world X
  const RG = (ro, ri, h, o = {}) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], ...o });
  const circ = (cx, cy, r, n = 32) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);
  const hull = P => { // convex hull (monotone chain), for plate outlines made of round lobes
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.slice().reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1)).map(q => q.map(r3)); };
  // plate in the axial frame: outline in extrude XY (px, py) maps to axial (x = px, z = -py); thickness t along the axis from y0
  const plate = (pts, holes, t, y0 = 0, o = {}) => ({ type: "extrude", pts, holes, depth: t, bevel: .3, rot: [-90, 0, 0], at: [0, y0, 0], ...o });
  // point on the axial (x, z) plane at angle phi (deg) and radius R, in extrude coordinates
  const pxy = (R, phi) => [r3(R * Math.cos(phi * Math.PI / 180)), r3(-R * Math.sin(phi * Math.PI / 180))];
  const axz = (R, phi) => [r3(R * Math.cos(phi * Math.PI / 180)), r3(R * Math.sin(phi * Math.PI / 180))];

  // ---------- key stations along X (installed) ----------
  const X_ROD = 30;                 // push rod outer tip; adjusting screw tip meets it here
  const X_HOLD = -18, X_SEAL3 = -8, X_RET = 0;
  const X_NOSE = 22;                // inboard end of the outer guide nose
  const FL0 = 24.8, FL1 = 28.8;     // outer guide flange, local y
  const X_GASK = X_NOSE + FL0 - .8; // gasket under the flange = outer face of the sprocket cover
  const STEP = 8.6;                 // outer guide bore step (spring seat), local y
  const X_IG = 38, IG_L = 17.5;     // inner guide inboard end, length
  const X_ARM = X_IG + 13.5, ARM_T = 4;
  const X_W10 = X_ARM + ARM_T, X_N9 = X_W10 + 1.2;
  const X_SCR = X_ROD, SCR_L = 37;

  // ---------- geometry ----------
  const rod = AX([{ type: "lathe", pts: [[0, -280], [3.4, -280], [4, -279.4], [4, -.8], [3.3, 0], [0, 0]] }]);

  const holder = AX([{ type: "lathe", pts: [[4.2, 0], [12, 0], [12, 3], [23.4, 3], [23.4, 9.4], [22.8, 10], [4.2, 10]] }]);

  const seal3 = AX([
    { type: "lathe", pts: [[20, 0], [23.5, 0], [23.5, 8], [9, 8], [9, 7], [20, 7]], mat: "steel" },   // metal case
    { type: "lathe", pts: [[19.5, .5], [20, .5], [20, 7], [9, 7], [8, 4.5], [4, 3], [4, 2], [9, 1.5], [19.5, 1.5]] },
    { type: "torus", R: 7, r: .6, at: [0, 2.6, 0], mat: "spring" } ]);

  const retPts = hull([...circ(0, 0, 27), ...circ(0, 34, 8, 20), ...circ(0, -34, 8, 20)]);
  const retainer = AX([plate(retPts, [[0, 0, 12], [0, 34, 3.3], [0, -34, 3.3]], 2)]);

  const hexBolt = (L, af = 10, hh = 4.5, r = 3) => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -L], [r - .5, -L], [r, -L + .5], [r, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [af * .68, 0], [af * .68, .9], [0, .9]] },             // flange
    { type: "hex", af, h: hh - .9, y: .9 } ] });
  const bolts5 = AX([{ type: "pair", pos: [[0, 0, -34], [0, 0, 34]], item: hexBolt(14) }]); // retainer ears: world Z = -/+ 34

  const seal15 = AX([
    { type: "lathe", pts: [[8.6, 0], [10, 0], [10, 7], [8.6, 7]], mat: "steel" },
    { type: "lathe", pts: [[8.1, .5], [8.6, .5], [8.6, 6.5], [6, 6.5], [4, 4], [4, 3], [6, 1], [8.1, 1]] },
    { type: "torus", R: 5.2, r: .5, at: [0, 3.3, 0], mat: "spring" } ]);

  // outer guide: nose (holds seal 15), barrel with the ball grooves, flange with three screw holes
  const SCR_PHI = [100, 220, 340], SCR_R = 25.5;           // axial angle 0 = local +x = world -Y; arm points at 160
  const flangePts = circ(0, 0, 32, 64).map(q => q.map(r3));
  const flangeHoles = [[0, 0, 19], ...SCR_PHI.map(f => [...pxy(SCR_R, f), 3.3])];
  const outer6 = AX([
    { type: "lathe", pts: [[10, 0], [13, 0], [13, 8], [19, 8], [19, FL0 + .5], [15.5, FL0 + .5], [15.5, STEP], [10, STEP]] },
    plate(flangePts, flangeHoles, FL1 - FL0, FL0, { bevel: .4 }),
    { type: "lathe", pts: [[15.5, FL0], [19, FL0], [19, FL1], [15.5, FL1]] },
    { type: "lathe", pts: [[15.45, 12], [15.6, 12], [15.6, 22], [15.45, 22]], mat: "black" } ]);
  const gasket13 = AX([plate(flangePts, [[0, 0, 19.5], ...SCR_PHI.map(f => [...pxy(SCR_R, f), 3.3])], .8, 0, { bevel: 0 })]);

  const panScrew = L => ({ type: "group", items: [
    { type: "lathe", pts: [[0, -L], [2.6, -L], [3, -L + .4], [3, 0], [0, 0]] },
    { type: "lathe", pts: [[0, 0], [5, 0], [5, 1.6], [4, 3.6], [0, 3.8]] },
    { type: "box", size: [6, .8, 1.1], r: .2, at: [0, 3.7, 0], mat: "black" },
    { type: "box", size: [1.1, .8, 6], r: .2, at: [0, 3.7, 0], mat: "black" } ] });
  const screws12 = AX([{ type: "array", pos: SCR_PHI.map(f => { const [x, z] = axz(SCR_R, f); return [x, 0, z]; }), item: panScrew(16) }]);

  // inner guide: spindle with three helical ball grooves, threaded centre bore, short neck where the arm fits
  const BALL_Y = 6.5, BALL_R = 3.2, BALL_RAD = 13.6;      // ball station (local y on the inner guide), ball size, ball circle
  const groove = phi0 => ({ type: "tube", r: 1.4, mat: "black", pts: Array.from({ length: 9 }, (_, i) => {
    const y = 1.5 + i * 1.25, a = (phi0 + (y - BALL_Y) * 6) * Math.PI / 180; return [r3(Math.cos(a) * 11.5), r3(y), r3(Math.sin(a) * 11.5)]; }) });
  const BALL_PHI = [40, 160, 280];
  const inner11 = AX([
    { type: "lathe", pts: [[3.6, 0], [11.4, 0], [12, .6], [12, 13.5], [9, 13.5], [9, IG_L], [3.6, IG_L]] },
    ...BALL_PHI.map(groove),
    { type: "box", size: [18.2, 4, 1.2], r: .1, at: [0, 15.5, 8.6], mat: "steel" },           // flats on the neck for the arm
    { type: "box", size: [18.2, 4, 1.2], r: .1, at: [0, 15.5, -8.6], mat: "steel" } ]);
  const balls14 = AX([{ type: "array", pos: BALL_PHI.map(f => { const [x, z] = axz(BALL_RAD, f); return [x, 0, z]; }), item: { type: "sphere", r: BALL_R } }]);

  const spring16 = AX([{ type: "spring", R: 7.6, wire: 1.2, h: X_IG - (X_NOSE + STEP), turns: 3.2 }]);

  // arm: hub on the inner guide neck, lever up and slightly forward to the cable end
  const ARM_PHI = 160, ARM_LEN = 52;
  const ae = pxy(ARM_LEN, ARM_PHI);
  const armPts = hull([...circ(0, 0, 15, 40), ...circ(ae[0], ae[1], 7, 24)]);
  const arm7 = AX([
    plate(armPts, [[0, 0, 9.1], [ae[0], ae[1], 3.2]], ARM_T),
    { type: "lathe", pts: [[3.2, -1.5], [7, -1.5], [7, 0], [3.2, 0]], at: [axz(ARM_LEN, ARM_PHI)[0], 0, axz(ARM_LEN, ARM_PHI)[1]] } ]);  // boss for the cable nipple

  const washer10 = AX([RG(13, 4.25, 1.2)]);
  const nut9 = AX([{ type: "hex", af: 12, h: 6.5, hole: 4 }]);
  const screw8 = AX([
    { type: "lathe", pts: [[0, 0], [2.5, 0], [4, 1.2], [4, SCR_L], [0, SCR_L]] },
    { type: "box", size: [6.4, 1.6, 1.2], r: .2, at: [0, SCR_L - .7, 0], mat: "black" } ]);   // screwdriver slot

  // ---------- exploded layout: everything slides out along +X in fitting order ----------
  // [id, installed origin X, local min, local max] -> exploded origin so the parts follow each other with a gap
  const GAP = 20;
  let cur = X_ROD + 12;
  const place = (lo, hi) => { const o = cur - lo; cur = o + hi + GAP; return r3(o); };
  const eX = {};
  eX.holder = place(0, 10); eX.seal3 = place(0, 8); eX.ret = place(0, 2.6); eX.bolts5 = place(-14, 4.5);
  cur += 12;
  eX.seal15 = place(0, 7); eX.gasket13 = place(0, 1); eX.outer6 = place(0, FL1 + .4); eX.screws12 = place(-16, 3.8);
  eX.spring16 = place(0, X_IG - X_NOSE - STEP); eX.balls14 = place(-BALL_R, BALL_R); eX.inner11 = place(0, IG_L);
  eX.arm7 = place(-1.5, ARM_T + .3); eX.washer10 = place(0, 1.2); eX.nut9 = place(0, 7); eX.screw8 = place(0, SCR_L);
  const at = x => [r3(x), 0, 0];
  const IN = [-1, 0, 0];

  const P = [
    { id: "rod", ref: "1", name: "Clutch push rod", mat: "steel", stage: 0, A: at(X_ROD), E: at(X_ROD), dir: IN, geom: rod },
    { id: "holder", ref: "2", name: "Push rod holder", mat: "steel", stage: 1, A: at(X_HOLD), E: at(eX.holder), dir: IN, geom: holder },
    { id: "seal3", ref: "3", name: "Oil seal 8 x 47 x 8 (push rod)", mat: "rubber", small: true, parent: "holder", stage: 1, A: at(X_SEAL3), E: at(eX.seal3), dir: IN, geom: seal3 },
    { id: "ret", ref: "4", name: "Push rod oil seal retainer", mat: "steel", stage: 2, A: at(X_RET), E: at(eX.ret), dir: IN, geom: retainer },
    { id: "bolts5", ref: "5", name: "Bolts (seal retainer)", mat: "zinc", small: true, parent: "ret", stage: 2, A: at(X_RET + 2), E: at(eX.bolts5), dir: IN, count: 2, geom: bolts5 },
    { id: "seal15", ref: "15", name: "Oil seal 8 x 20 x 7 (release nose)", mat: "rubber", small: true, parent: "outer6", stage: 3, A: at(X_NOSE), E: at(eX.seal15), dir: [1, 0, 0], geom: seal15 },
    { id: "outer6", ref: "6", name: "Clutch release outer guide", mat: "alu", stage: 5, A: at(X_NOSE), E: at(eX.outer6), dir: IN, shell: true, geom: outer6 },
    { id: "spring16", ref: "16", name: "Spring (release return)", mat: "spring", parent: "outer6", stage: 3, A: at(X_NOSE + STEP), E: at(eX.spring16), dir: IN, geom: spring16 },
    { id: "balls14", ref: "14", name: "Clutch release balls", mat: "chrome", small: true, parent: "inner11", stage: 4, A: at(X_IG + BALL_Y), E: at(eX.balls14), dir: IN, count: 3, geom: balls14 },
    { id: "inner11", ref: "11", name: "Clutch release inner guide", mat: "steel", parent: "outer6", stage: 4, A: at(X_IG), E: at(eX.inner11), dir: IN, geom: inner11 },
    { id: "gasket13", ref: "13", name: "Gasket (ball guide flange)", mat: "brass", small: true, parent: "outer6", stage: 5, A: at(X_GASK), E: at(eX.gasket13), dir: IN, geom: gasket13 },
    { id: "screws12", ref: "12", name: "Screws (outer guide to sprocket cover)", mat: "zinc", small: true, parent: "outer6", stage: 5, A: at(X_NOSE + FL1), E: at(eX.screws12), dir: IN, count: 3, geom: screws12 },
    { id: "arm7", ref: "7", name: "Clutch release arm", mat: "steel", parent: "inner11", stage: 6, A: at(X_ARM), E: at(eX.arm7), dir: IN, geom: arm7 },
    { id: "washer10", ref: "10", name: "Washer 8.5 x 26 x 1.2", mat: "steel", small: true, parent: "arm7", stage: 6, A: at(X_W10), E: at(eX.washer10), dir: IN, geom: washer10 },
    { id: "nut9", ref: "9", name: "Locknut 8 mm (adjusting screw)", mat: "zinc", small: true, parent: "washer10", stage: 7, A: at(X_N9), E: at(eX.nut9), dir: IN, geom: nut9 },
    { id: "screw8", ref: "8", name: "Clutch adjusting screw", mat: "steel", small: true, parent: "inner11", stage: 7, A: at(X_SCR), E: at(eX.screw8), dir: IN, geom: screw8 },
  ];

  D3_MODELS["CMS-BLCK0010"] = {
    id: "CMS-BLCK0010", title: "Clutch release", units: "mm", page: "BLCK0010",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL clutch release page; the two seal sizes and the washer size come from the catalogue descriptions. The layout (rod holder and seal in the input shaft bearing bore, a ball-screw release bolted to the sprocket cover, adjusting screw through the middle) is the most likely reading of the parts list, not checked against the factory drawing. Which guide is bolted down and which one turns, where seal 15 and spring 16 sit, and the ball count are best guesses. Push rod length and every other size are typical, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [.38, .5, 1], up: [0, 1, 0] },
    notModelled: "Ref 1 has two catalogue rows: the early one-piece push rod (1-1) was replaced by a rod assembly (1-2); one rod is drawn. The input shaft, crankcase, engine sprocket cover, clutch cable and the clutch push piece on the right side are on other pages and are not drawn, so the screws and bolts thread into nothing visible. Ball count (3) and the flats on the inner guide neck are assumptions.",
    stages: [
      { t: "Rod holder and seal", d: "With the push rod in the input shaft, slide the holder over the rod into the bearing bore, then press in a new 8 x 47 x 8 oil seal, lip facing in." },
      { t: "Seal retainer", d: "Fit the retainer plate over the seal and tighten its two bolts. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Prepare the outer guide", d: "Press the small 8 x 20 x 7 seal into the nose of the outer guide and drop the spring into its bore." },
      { t: "Balls and inner guide", d: "Grease the grooves, set the three balls in place and screw the inner guide into the outer guide. Check it turns freely." },
      { t: "Release onto the cover", d: "Put a new gasket under the flange and screw the outer guide to the sprocket cover with its three screws. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Arm and washer", d: "Fit the release arm onto the flats of the inner guide, pointing up toward the cable, then the washer." },
      { t: "Adjusting screw", d: "Run the adjusting screw in until it touches the push rod, back it off to set the free play and lock it with the nut. Procedure and free play: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: P,
  };
})();

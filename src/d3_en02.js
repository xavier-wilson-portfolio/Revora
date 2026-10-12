/* ============ 3D parts model: crankshaft, rods and pistons, GS750B 1977 (CMSNL BLCK0016) ============
   Mechanical data only. Units: millimetres.
   World frame: crank axis = X (+X toward the right-hand / primary drive and clutch side, -X toward the left / alternator side),
   +Y straight up the cylinder bores (the forward cylinder tilt is ignored), +Z forward. Crank axis passes through the origin.
   Cylinders are numbered 1-4 from the left. Crank shown with pistons 1 and 4 at top dead centre, 2 and 3 at bottom dead centre
   (180-degree crank: 1-4 throws up together, 2-3 down together).
   Published figures used: bore 65 mm, stroke 56.4 mm (throw 28.2 mm). Catalogue part names give: big-end bearing 28 x 38 x 19.8,
   big-end thrust washers 28 x 48 x 2 and 28 x 48 x 1, right main bearing 30 x 72 x 19, right oil seal 30 x 72 x 11, circlips 30 and
   32 mm, piston pin circlip 16 mm. Everything else (cylinder spacing, rod length, web size, how the pressed crank splits into its
   pieces, roller main bearing sizes) is APPROXIMATE, modelled to typical proportions, not measured from a GS750.
   Every part's local origin is the world origin (A = [0,0,0]); its geometry is laid out in world coordinates. */
(() => {
  const XC = [-124, -52, 52, 124];                 // cylinder centre lines (approximate spacing, wider gap at the cam chain)
  const THROW = 56.4 / 2, ROD = 113;               // throw from the published stroke; rod centre distance approximate
  const PY = [THROW, -THROW, -THROW, THROW];       // crank pin heights: 1 and 4 up, 2 and 3 down
  const PIN = PY.map(y => y + ROD);                // piston pin heights
  const WEB_R = 56, WEB_T = 14, GAP = 22.8;        // web radius and thickness; gap = rod 19.8 + washers 2 + 1
  const X = [0, 0, -90];                            // turns a Y-axis lathe / ring onto the crank (X) axis

  // ---- geometry helpers (all return plain geometry specs) ----
  const cylX = (r, x0, x1, y = 0, mat) => ({ type: "cyl", r, h: x1 - x0, axis: "x", at: [x0, y, 0], ...(mat ? { mat } : {}) });
  const web = x0 => ({ type: "lathe", pts: [[0, 0], [WEB_R - 2, 0], [WEB_R, 2], [WEB_R, WEB_T - 2], [WEB_R - 2, WEB_T], [0, WEB_T]], rot: X, at: [x0, 0, 0] });
  // plain rings built as lathes (the viewer's ring type passes its sweep angle in the wrong argument and draws nothing)
  const ringX = (ro, ri, h, x0, y = 0, mat) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], rot: X, at: [x0, y, 0], ...(mat ? { mat } : {}) });
  const ringY = (ro, ri, h, y, mat) => ({ type: "lathe", pts: [[ri, 0], [ro, 0], [ro, h], [ri, h]], at: [0, y, 0], ...(mat ? { mat } : {}) });
  const clipX = (R, r, x, y = 0) => ({ type: "clip", R, r, gap: .5, rot: X, at: [x, y, 0] });
  const ring = (n, R) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [0, R * Math.cos(a), R * Math.sin(a)]; });
  const roller = xc => ({ type: "group", items: [ // roller main bearing (size not given in the catalogue; ~32 x 62 x 16 assumed)
    ringX(31, 27, 16, xc - 8), ringX(20, 16, 16, xc - 8),
    { type: "array", pos: ring(12, 23.5), item: cylX(3.2, xc - 7, xc + 7, 0, "dark") } ] });
  const needle = (xc, y) => ({ type: "group", items: [ // caged needle big-end bearing 28 x 38 x 19.8
    ringX(18.2, 15.6, 19.8, xc - 9.9, y, "brass"),
    { type: "array", pos: ring(14, 16.6).map(p => [0, p[1] + y, p[2]]), item: cylX(2.3, xc - 9.6, xc + 9.6, 0, "chrome") } ] });
  const conrod = (xc, y) => ({ type: "group", items: [ // one-piece rod: big eye on the pin, small eye at the piston pin
    ringX(26, 19, 19.8, xc - 9.9, y),
    ringX(13, 8, 17, xc - 8.5, y + ROD),
    { type: "extrude", pts: [[-12.5, 19], [12.5, 19], [7, 104], [-7, 104]], depth: 13, bevel: .6, rot: [0, 90, 0], at: [xc - 6.5, y, 0] },
    { type: "extrude", pts: [[-6, 34], [6, 34], [3.6, 92], [-3.6, 92]], depth: 15.4, bevel: 0, rot: [0, 90, 0], at: [xc - 7.7, y, 0], mat: "dark" } ] });
  const seal = (ri, ro, w, x0) => ({ type: "lathe", pts: [[ri + .4, 0], [ro, 0], [ro, w], [ri + 3, w], [ri, w - 2.2], [ri + 1.6, w / 2], [ri, 2]], rot: X, at: [x0, 0, 0] });

  // ---- big-end sets: inner washer (1 mm) toward the crank centre, bearing, rod, outer washer (2 mm) ----
  // (which side each thickness goes is not shown in the catalogue; it is a guess)
  const bigEnd = (c, parent, stage, s) => { // s = -1 left half, +1 right half
    const xc = XC[c], y = PY[c], inner = xc - s * GAP / 2, n = c + 1, d = [-s, 0, 0];
    const w4x = s < 0 ? [inner - 1, inner] : [inner, inner + 1], w3x = s < 0 ? [xc - GAP / 2, xc - GAP / 2 + 2] : [xc + GAP / 2 - 2, xc + GAP / 2];
    return [
      { id: `w4_${n}`, ref: "4", name: `Big-end thrust washer, 1 mm (cylinder ${n})`, mat: "steel", small: true, parent, stage, dir: d, xr: w4x,
        geom: ringX(24, 14, 1, w4x[0], y) },
      { id: `brg5_${n}`, ref: "5", name: `Big-end needle bearing (cylinder ${n})`, mat: "brass", parent, stage, dir: d, xr: [xc - 9.9, xc + 9.9],
        geom: needle(xc, y) },
      { id: `rod_${n}`, ref: "2", name: `Connecting rod (cylinder ${n})`, mat: "steel", parent, stage, dir: d, xr: [xc - 9.9, xc + 9.9],
        geom: conrod(xc, y) },
      { id: `w3_${n}`, ref: "3", name: `Big-end thrust washer, 2 mm (cylinder ${n})`, mat: "steel", small: true, parent, stage, dir: d, xr: w3x,
        geom: ringX(24, 14, 2, w3x[0], y) },
    ];
  };

  // web faces (x of the inboard face of each web): throw n spans XC[n] +- GAP/2
  const wL = c => XC[c] - GAP / 2 - WEB_T, wR = c => XC[c] + GAP / 2; // x0 of the left / right web of cylinder c

  // ---- parts in installed position; xr = installed X range (used to lay out the exploded line) ----
  const centre = [
    { id: "tcshaft", ref: "12", name: "Timing chain drive shaft (centre shaft and cam chain sprocket)", mat: "steel", stage: 0,
      geom: { type: "group", items: [
        cylX(16, wR(1), wL(2) + WEB_T),
        cylX(19, -9, -4), cylX(19, 4, 9),
        { type: "gear", r: 26, teeth: 22, h: 8, toothH: 3.6, bore: 15, rot: X, at: [-4, 0, 0] } ] } },
  ];
  const left = [ // from the centre outward, in fitting order
    { id: "brg18_cl", ref: "18", name: "Main bearing, centre left", mat: "steel", parent: "tcshaft", stage: 1, xr: [-25, -9], geom: roller(-17) },
    { id: "web9_l", ref: "9", name: "Middle crank web with crank pin 2", mat: "steel", parent: "tcshaft", stage: 2, xr: [wL(1), wR(1) + WEB_T],
      geom: { type: "group", items: [web(wR(1)), cylX(14, wL(1), wR(1), PY[1])] } },
    ...bigEnd(1, "web9_l", 3, -1),
    { id: "crank8_l", ref: "8", name: "Crankshaft piece, cylinder 2 left web with journal", mat: "steel", parent: "web9_l", stage: 4, xr: [wR(0), wL(1) + WEB_T],
      geom: { type: "group", items: [web(wL(1)), cylX(16, wR(0), wL(1))] } },
    { id: "brg18_ml", ref: "18", name: "Main bearing, between cylinders 1 and 2", mat: "steel", parent: "crank8_l", stage: 5, xr: [-96, -80], geom: roller(-88) },
    { id: "web11", ref: "11", name: "Crank web with crank pin 1", mat: "steel", parent: "crank8_l", stage: 6, xr: [wL(0), wR(0) + WEB_T],
      geom: { type: "group", items: [web(wR(0)), cylX(14, wL(0), wR(0), PY[0])] } },
    ...bigEnd(0, "web11", 7, -1),
    { id: "crank10", ref: "10", name: "Crankshaft, left end piece (web and alternator shaft)", mat: "steel", parent: "web11", stage: 8, xr: [-240, wL(0) + WEB_T],
      geom: { type: "group", items: [web(wL(0)),
        { type: "lathe", pts: [[0, -240], [6, -240], [6, -226], [11, -226], [14, -186], [15, -186], [15, -171], [16, -171], [16, wL(0)], [0, wL(0)]], rot: X }] } },
    { id: "brg18_l", ref: "18", name: "Main bearing, left end", mat: "steel", parent: "crank10", stage: 9, xr: [-168, -152], geom: roller(-160) },
    { id: "clip15", ref: "15", name: "Circlip, 32 mm (left main bearing)", mat: "spring", small: true, parent: "crank10", stage: 9, xr: [-170.4, -168.6], geom: clipX(16.4, .9, -169.5) },
    { id: "seal22", ref: "22", name: "Oil seal, left end", mat: "rubber", parent: "crank10", stage: 13, xr: [-183, -175], geom: seal(15, 25, 8, -183) },
  ];
  const right = [
    { id: "brg18_cr", ref: "18", name: "Main bearing, centre right", mat: "steel", parent: "tcshaft", stage: 1, xr: [9, 25], geom: roller(17) },
    { id: "web9_r", ref: "9", name: "Middle crank web with crank pin 3", mat: "steel", parent: "tcshaft", stage: 2, xr: [wL(2), wR(2) + WEB_T],
      geom: { type: "group", items: [web(wL(2)), cylX(14, wL(2) + WEB_T, wR(2) + WEB_T, PY[2])] } },
    ...bigEnd(2, "web9_r", 3, 1),
    { id: "crank8_r", ref: "8", name: "Crankshaft piece, cylinder 3 right web with journal", mat: "steel", parent: "web9_r", stage: 4, xr: [wR(2), wL(3) + WEB_T],
      geom: { type: "group", items: [web(wR(2)), cylX(16, wR(2) + WEB_T, wL(3) + WEB_T)] } },
    { id: "brg18_mr", ref: "18", name: "Main bearing, between cylinders 3 and 4", mat: "steel", parent: "crank8_r", stage: 5, xr: [80, 96], geom: roller(88) },
    { id: "web7", ref: "7", name: "Crank web with crank pin 4", mat: "steel", parent: "crank8_r", stage: 6, xr: [wL(3), wR(3) + WEB_T],
      geom: { type: "group", items: [web(wL(3)), cylX(14, wL(3) + WEB_T, wR(3) + WEB_T, PY[3])] } },
    ...bigEnd(3, "web7", 7, 1),
    { id: "crank6", ref: "6", name: "Crankshaft, right end piece (web and drive-side shaft)", mat: "steel", parent: "web7", stage: 8, xr: [wR(3), 232],
      geom: { type: "group", items: [web(wR(3)),
        { type: "lathe", pts: [[0, wR(3) + WEB_T], [17, wR(3) + WEB_T], [17, 172], [15, 172], [15, 210], [12, 210], [12, 230], [10, 232], [0, 232]], rot: X }] } },
    { id: "gear16", ref: "16", name: "Primary drive gear", mat: "steel", parent: "crank6", stage: 10, xr: [150, 166],
      geom: { type: "gear", r: 40, teeth: 31, h: 16, toothH: 4, bore: 17, holes: [[26, 0, 4.3]], rot: X, at: [150, 0, 0] } },
    { id: "bolt17", ref: "17", name: "Bolt (primary drive gear)", mat: "zinc", small: true, parent: "gear16", stage: 10, xr: [142, 171.5],
      geom: { type: "group", rot: [0, 0, 90], at: [166, -26, 0], items: [
        { type: "lathe", pts: [[0, 0], [4, 0], [4, 24], [0, 24]] }, { type: "hex", af: 12, h: 5, y: -5.5 } ] } },
    { id: "brg13", ref: "13", name: "Main bearing, right end (ball, 30 x 72 x 19)", mat: "steel", parent: "crank6", stage: 11, xr: [174, 193],
      geom: { type: "group", items: [ringX(36, 31, 19, 174), ringX(20, 15, 19, 174),
        { type: "array", pos: ring(10, 25.5), item: { type: "sphere", r: 5.6, at: [183.5, 0, 0], mat: "chrome" } }] } },
    { id: "clip14", ref: "14", name: "Circlip, 30 mm (right main bearing)", mat: "spring", small: true, parent: "crank6", stage: 11, xr: [193.6, 195.4], geom: clipX(15.4, .9, 194.5) },
    { id: "seal21", ref: "21", name: "Oil seal, right end (30 x 72 x 11)", mat: "rubber", parent: "crank6", stage: 13, xr: [197, 208], geom: seal(15, 36, 11, 197) },
  ];

  // ---- exploded line: each half pulled outward along the crank axis in fitting order, nothing touching ----
  const GAPX = 12;
  const lay = (list, s) => { let cur = s < 0 ? -45 : 45;
    list.forEach(p => { const [a, b] = p.xr; const shift = s < 0 ? (cur - GAPX) - b : (cur + GAPX) - a; p.E = [shift, 0, 0]; cur = s < 0 ? a + shift : b + shift; p.dir = p.dir || [-s, 0, 0]; }); };
  lay(left, -1); lay(right, 1);

  const mains = [-160, -88, -17, 17, 88];
  const extra = [
    { id: "cring19", ref: "19", name: "C-rings (main bearing outer races)", mat: "spring", small: true, parent: "tcshaft", stage: 12, count: 5, E: [0, -140, 0], dir: [0, 1, 0],
      geom: { type: "array", pos: mains.map(x => [x, 0, 0]), item: { type: "torus", R: 31, r: .9, rot: X } } },
    { id: "pin20", ref: "20", name: "Locating pins (main bearing outer races)", mat: "steel", small: true, parent: "tcshaft", stage: 12, count: 5, E: [0, -190, 0], dir: [0, 1, 0],
      geom: { type: "array", pos: mains.map(x => [x, -37.5, 0]), item: { type: "cyl", r: 2.5, h: 7 } } },
    { id: "rings24", ref: "24", name: "Piston ring sets (top, second, oil)", mat: "spring", parent: "pistons", stage: 14, count: 4, E: [0, 330, 0], dir: [0, -1, 0],
      geom: { type: "array", pos: XC.map((x, i) => [x, PIN[i], 0]), item: { type: "group", items: [
        ringY(32.5, 29.5, 1.5, 24.5),
        ringY(32.5, 29.5, 1.5, 19.5, "dark"),
        ringY(32.5, 29.5, 3, 13.5, "dark") ] } } },
    { id: "pistons", ref: "23", name: "Pistons (65 mm standard bore)", mat: "alu", shell: true, parent: "tcshaft", stage: 15, count: 4, E: [0, 220, 0], dir: [0, -1, 0],
      geom: { type: "array", pos: XC.map((x, i) => [x, PIN[i], 0]), item: { type: "group", items: [
        { type: "lathe", pts: [[0,  23],  [29.6,  23],  [29.6,  -26],  [32.4,  -26],  [32.4,  13.5],  [29.3,  13.5],  [29.3,  16.5],  [32.3,  16.5],  [32.3,  19.5],  [29.3,  19.5],  [29.3,  21],  [32.3,  21],  [32.3,  24.5],  [29.3,  24.5],  [29.3,  26],  [32.3,  26],  [32.3,  29.5],  [30.5,  31],  [0,  31]] },
        ringX(12, 8, 59.2, -29.6),
        cylX(8.2, 32.1, 32.9, 0, "black"), cylX(8.2, -32.9, -32.1, 0, "black") ] } } },
    { id: "pins25", ref: "25", name: "Piston pins", mat: "chrome", parent: "pistons", stage: 15, count: 4, E: [-60, 470, 0], dir: [1, 0, 0],
      geom: { type: "array", pos: XC.map((x, i) => [x, PIN[i], 0]), item: ringX(8, 5, 52, -26) } },
    { id: "clips26", ref: "26", name: "Piston pin circlips", mat: "spring", small: true, parent: "pistons", stage: 16, count: 8, E: [0, 580, 0], dir: [0, -1, 0],
      geom: { type: "array", pos: XC.map((x, i) => [x, PIN[i], 0]), item: { type: "group", items: [clipX(7.8, .8, -27), clipX(7.8, .8, 27)] } } },
  ];
  // centre shaft carries the base: give everything A = origin
  const parts = [...centre, ...left, ...right, ...extra].map(p => { const { xr, ...q } = p; return { A: [0, 0, 0], E: [0, 0, 0], dir: [0, 1, 0], ...q }; });

  D3_MODELS["DG-EN-02"] = {
    id: "DG-EN-02", title: "Crankshaft, connecting rods and pistons", units: "mm", page: "BLCK0016",
    accuracy: "Approximate geometry. Part identity and numbering come from the CMSNL crankshaft page. Bore (65 mm) and stroke (56.4 mm) are published figures and the bearing, washer, seal and circlip sizes come from the catalogue part names; cylinder spacing, rod length, web size, roller main bearing size and how the pressed crank divides into its pieces are typical proportions, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [.95, .6, 1.35], up: [0, 1, 0] },
    notModelled: "Ref 1 (crankshaft assembly) is the complete pressed crank, not a separate piece, so it isn't drawn on its own. Refs 23-2/23-3 and 24-2/24-3 are the 0.5 and 1.0 mm oversize pistons and ring sets, drawn as the standard 23 and 24. The rods, big-end bearings and thrust washers are drawn one per cylinder because the two halves of the crank explode in opposite directions. Where each crank piece starts and ends, and which side the 1 mm and 2 mm thrust washers go, are reasonable guesses.",
    stages: [
      { t: "Centre main bearings", d: "Slide the two centre main bearings onto the timing chain drive shaft, one each side of the cam chain sprocket. Crank rebuilding is press work for a specialist shop." },
      { t: "Middle webs", d: "Press the two middle webs, each carrying a crank pin, onto the ends of the centre shaft with the pins in line. Alignment: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Big ends, cylinders 2 and 3", d: "On each pin fit a thrust washer, the caged needle bearing, the rod over the bearing and the second washer." },
      { t: "Webs 2 and 3 outer", d: "Press the crankshaft pieces onto crank pins 2 and 3. Big-end side clearance and web alignment: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Main bearings 1-2 and 3-4", d: "Slide a main bearing onto each journal between cylinders 1 and 2 and between 3 and 4." },
      { t: "Webs with pins 1 and 4", d: "Press the webs carrying crank pins 1 and 4 onto the journals, with those pins 180 degrees from pins 2 and 3." },
      { t: "Big ends, cylinders 1 and 4", d: "Thrust washer, needle bearing, rod and second washer onto pins 1 and 4." },
      { t: "End pieces", d: "Press the left and right end pieces onto pins 1 and 4, then true the whole crank. Runout limit: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Left main bearing", d: "Fit the left end main bearing on the alternator-side shaft and lock it with the 32 mm circlip." },
      { t: "Primary drive gear", d: "Fit the primary drive gear against the right web and fit its bolt. Thread locker and torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Right main bearing", d: "Press the 30 x 72 ball bearing onto the right end shaft and lock it with the 30 mm circlip." },
      { t: "C-rings and locating pins", d: "Fit a C-ring in the groove of each roller main bearing outer race and the locating pins, so the races sit in the case halves the right way." },
      { t: "Oil seals", d: "Fit new oil seals on both ends of the crank, lips facing in. Lube the lips first." },
      { t: "Rings onto pistons", d: "Fit the oil ring, second ring and top ring to each piston, marks facing up. End gaps and stagger: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Pistons and pins", d: "Set each piston over its rod's small end, arrow on the crown facing the exhaust, and push the piston pin through." },
      { t: "Piston pin circlips", d: "Fit new circlips at both ends of every pin, gap away from the cutout. Cover the crankcase opening so nothing drops in." },
    ],
    parts,
  };
})();

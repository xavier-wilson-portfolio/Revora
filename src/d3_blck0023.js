/* ============ 3D parts model: frame, GS750B 1977 (CMSNL BLCK0023) ============
   Mechanical data only (no rendering code). Units: millimetres.
   World frame (same origin as d3_blck0057.js and d3_blck0008.js): origin on the swing arm pivot axis at the middle of
   the pivot tube, +X to the rider's LEFT, +Y up, +Z forward. The frame is close to symmetric, so the swing arm and shock
   models line up with it whichever side they call +X.
   Fixed points taken from those models: frame pivot bosses start at |x| = 134 (outside the swing arm thrust washers) and
   end at |x| = 152 (shaft head and nut washer); upper shock studs at Y = 331, Z = -383, shock eye centre |x| = 137,
   the stud boss faces at |x| = 123 (left) and 119.8 (right) where the inner shock washers stop.
   Every part's geometry is laid out in world coordinates, so every A is [0, 0, 0] and E is the exploded offset.
   Layout of the mounting plates and fasteners follows the CMSNL picture: front plates 2 on lugs low on the down tubes
   (two bolts 3 with lock washers 4 each), plate 5 on a tab on the right cradle rail (bolts 6, washers 7), plates 8
   ("No. 3") on lugs on the rear down tubes above the swing arm pivot (bolts 9 8 x 40, washers 10), the frame handle 11
   on the left seat rail (bolt 12, washer 13), the tool holder 14 and tool set 15 between the seat rails.
   Real figures used: bolt sizes 8 x 65 (ref 3), 8 x 16 (refs 6 and 12) and 8 x 40 (ref 9) read from the catalogue part
   numbers and description. Everything else (tube sizes and routing, head angle about 27 degrees, plate shapes, lug and
   tray positions) is a typical 1970s 750 double-cradle proportion, not measured from a GS750. */
const D3_BLCK0023 = (() => {
  const r2 = v => Math.round(v * 100) / 100;
  // flat outline drawn in the side view as [z, y] points, extruded across X from x0 by w
  const side = (pts, w, x0, holes, extra) => ({ type: "extrude", pts: pts.map(([z, y]) => [r2(-z), r2(y)]), holes: (holes || []).map(([z, y, r]) => [r2(-z), r2(y), r]),
    depth: w, bevel: .5, rot: [0, 90, 0], at: [r2(x0), 0, 0], ...(extra || {}) });
  // outline round a set of circles [z, y, r] (convex hull), for gusset plates and mounting plates
  const hull = (cs, n = 20) => {
    const p = cs.flatMap(([a, b, r]) => Array.from({ length: n }, (_, k) => { const t = k / n * Math.PI * 2; return [a + r * Math.cos(t), b + r * Math.sin(t)]; }))
      .sort((u, v) => u[0] - v[0] || u[1] - v[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    p.forEach(q => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    p.slice().reverse().forEach(q => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); });
    return [...lo.slice(0, -1), ...up.slice(0, -1)].map(([a, b]) => [r2(a), r2(b)]);
  };
  const M = (s, pts) => pts.map(([x, y, z]) => [r2(s * x), y, z]);           // mirror a left-side point list to side s
  const tube = (pts, r, extra) => ({ type: "tube", pts, r, ...(extra || {}) });
  const xbar = (x, y, z, r) => tube([[-x, y, z], [0, y, z], [x, y, z]], r);  // straight cross tube

  // ring along X from |x| = x0 running outward (o = 1) or inward (o = -1) on side s
  const wX = (s, x0, o, ro, ri, h, y, z, extra) => { const a = s * x0, b = s * (x0 + o * h); return { type: "ringX", ro, ri, h, at: [r2(Math.min(a, b)), y, z], ...(extra || {}) }; };
  // anything built along +Y, turned to run along X from |x| = x0 in direction d (1 outward, -1 inward) on side s
  const onX = (s, x0, d, y, z, items) => ({ type: "group", rot: [0, 0, s * d > 0 ? -90 : 90], at: [r2(s * x0), y, z], items });
  // 8 mm hex bolt: head outboard of |x| = x0, shank running inboard for L
  const bolt8 = (s, x0, y, z, L) => onX(s, x0, -1, y, z, [
    { type: "hex", af: 12, h: 5.5, y: -5.5 },
    { type: "lathe", pts: [[0, -.3], [4, -.3], [4, L - .6], [3.4, L], [0, L]] } ]);

  // ---- main tubes (left side; the right is the mirror) ----
  // head tube axis: bottom at (y 420, z 760), leaning back about 27 degrees, 150 long
  const downCradle = [[24, 430, 745], [49.2, 220, 693.4], [70.8, 40, 649], [86.4, -90, 617], [96, -160, 590], [105, -182, 540], [112, -185, 450],
    [125, -185, 250], [135, -180, 150], [143, -155, 75], [145, -100, 38], [145, 0, 35], [140, 120, 20], [126, 250, -2], [112, 380, -25], [100, 455, -40]];
  const topRail = [[18, 545, 696], [55, 525, 560], [88, 490, 300], [100, 462, 60], [100, 455, -40], [97, 442, -250], [92, 428, -480], [80, 421, -600], [45, 420, -648], [0, 420, -660]];
  const subRail = [[126, 250, -2], [115, 300, -200], [110, 331, -383], [88, 420, -540]];

  // front plate 2 lugs on the down tubes, plate 8 lugs on the rear down tubes (z, y)
  const L2 = [[649, 40], [617, -90]], E2 = [565, -20];
  const L8 = [[19, 130, 151], [2, 230, 140]], E8 = [75, 180];             // [z, y, outer |x| of the lug boss]
  const P5 = { x: 116, y: -171, z: 390 };                                   // tab on top of the right cradle rail

  const sideFrame = s => [
    tube(M(s, downCradle), 14),
    tube(M(s, topRail), 14),
    tube(M(s, subRail), 11),
    // swing arm pivot: gusset plate and boss (|x| 134..152)
    side(hull([[0, 0, 30], [36, -70, 13], [36, 75, 13]]), 8, s > 0 ? 134 : -142, [[0, 0, 7.2]]),
    wX(s, 134, 1, 20, 7.2, 18, 0, 0),
    // upper shock stud and its boss
    { type: "cyl", r: 12, h: s > 0 ? 13 : 9.8, axis: "x", at: [s > 0 ? 110 : -119.8, 331, -383] },
    { type: "cyl", r: 6, h: 45, axis: "x", at: [s > 0 ? 123 : -165, 331, -383], mat: "steel" },
    // front plate lugs (through bosses across the down tube)
    ...L2.map(([z, y]) => ({ type: "cyl", r: 9, h: 55, axis: "x", at: [s > 0 ? 45 : -100, y, z] })),
    // rear plate lugs
    ...L8.map(([z, y, xo]) => ({ type: "cyl", r: 10, h: xo - 118, axis: "x", at: [s > 0 ? 118 : -xo, y, z] })),
    // footrest / stand lug low on the rear of the cradle
    side(hull([[40, -150, 10], [5, -190, 12]]), 6, s > 0 ? 147 : -153, [[5, -190, 5]]),
    // tool holder ledges inside the seat rails
    ...[-300, -440].map(z => ({ type: "group", items: [
      { type: "box", size: [16, 4, 20], r: .8, at: [s * 82, 404, z] },
      { type: "box", size: [6, 20, 20], r: .8, at: [s * 87, 415, z] } ] })),
  ];

  const frame = { type: "group", items: [
    ...sideFrame(1), ...sideFrame(-1),
    // steering head
    { type: "group", rot: [-27, 0, 0], at: [0, 420, 760], items: [
      { type: "lathe", pts: [[21.5, 0], [29, 0], [29, 8], [27.5, 10], [27.5, 140], [29, 142], [29, 150], [21.5, 150]] },
      { type: "box", size: [16, 14, 14], r: 2, at: [0, 20, 32] } ] },      // steering stop lug
    // cross tubes
    xbar(49.2, 220, 693.4, 10), xbar(88, 490, 300, 10), xbar(120.6, 300, -11, 12), xbar(139, -168, 105, 12), xbar(112, 317, -300, 10),
    // head gussets under the top tubes
    side(hull([[690, 540, 6], [600, 522, 6], [735, 455, 6]]), 4, 16), side(hull([[690, 540, 6], [600, 522, 6], [735, 455, 6]]), 4, -20),
    // tab for plate 5 on the right cradle rail
    { type: "box", size: [44, 5, 70], r: 1, at: [-P5.x, P5.y + 2.5, P5.z] },
    // frame handle tabs on the left seat rail
    side([[-410, 395], [-430, 395], [-430, 428], [-410, 428]], 8, 100, [[-420, 405, 4.2]]),
    side([[-552, 395], [-568, 395], [-568, 426], [-552, 426]], 8, 94, [[-560, 405, 4.2]]),
    // battery carrier: tray and two straps to the sub rails
    { type: "box", size: [140, 3, 150], r: 1, at: [0, 293.5, -110] },
    { type: "box", size: [3, 40, 150], r: 1, at: [68.5, 313, -110] }, { type: "box", size: [3, 40, 150], r: 1, at: [-68.5, 313, -110] },
    { type: "box", size: [140, 30, 3], r: 1, at: [0, 307, -186.5] },
    { type: "box", size: [248, 4, 22], r: 1, at: [0, 280, -60] }, { type: "box", size: [236, 4, 22], r: 1, at: [0, 292, -160] },
    { type: "box", size: [6, 16, 22], r: 1, at: [121, 274, -60] }, { type: "box", size: [6, 16, 22], r: 1, at: [-121, 274, -60] },
    // rear fender / tail light mounting tabs on the rear loop
    { type: "box", size: [60, 4, 30], r: 1, at: [0, 414, -640] },
  ] };

  // ---- mounting plates ----
  const plate2 = s => side(hull([[L2[0][0], L2[0][1], 16], [L2[1][0], L2[1][1], 16], [E2[0], E2[1], 18]]), 6, s > 0 ? 100 : -106,
    [[L2[0][0], L2[0][1], 4.3], [L2[1][0], L2[1][1], 4.3], [E2[0], E2[1], 5.2]]);
  const plate8 = s => side(hull([[L8[0][0], L8[0][1], 15], [L8[1][0], L8[1][1], 15], [E8[0], E8[1], 17]]), 6, s > 0 ? 112 : -118,
    [[L8[0][0], L8[0][1], 4.3], [L8[1][0], L8[1][1], 4.3], [E8[0], E8[1], 5.2]]);
  const plate5 = { type: "group", items: [
    { type: "box", size: [40, 5, 60], r: 1, at: [-P5.x, P5.y + 7.5, P5.z] },                                     // flange on the tab
    side(hull([[P5.z, -115, 20], [P5.z - 26, -164, 3], [P5.z + 26, -164, 3]]), 5, -101, [[P5.z, -115, 5.2]]),     // ear up to the engine
  ] };

  // ---- fasteners ----
  const bolts3 = s => ({ type: "group", items: L2.map(([z, y]) => bolt8(s, 108, y, z, 65)) });
  const lw4 = s => ({ type: "group", items: L2.map(([z, y]) => wX(s, 106, 1, 7.5, 4.2, 2, y, z, { split: true })) });
  const bolts9 = s => ({ type: "group", items: L8.map(([z, y, xo]) => bolt8(s, xo + 2, y, z, 40)) });
  const lw10 = s => ({ type: "group", items: L8.map(([z, y, xo]) => wX(s, xo, 1, 7.5, 4.2, 2, y, z, { split: true })) });
  const B6Z = [P5.z - 20, P5.z + 20], TOP5 = P5.y + 10;                    // bolt 6 positions and the top of plate 5's flange
  const bolts6 = { type: "group", items: B6Z.map(z => ({ type: "group", rot: [180, 0, 0], at: [-P5.x, TOP5 + 2, z], items: [
    { type: "hex", af: 12, h: 5.5, y: -5.5 },
    { type: "lathe", pts: [[0, -.3], [4, -.3], [4, 15.4], [3.4, 16], [0, 16]] } ] })) };
  const lw7 = { type: "group", items: B6Z.map(z => ({ type: "ring", ro: 7.5, ri: 4.2, h: 2, split: true, at: [-P5.x, TOP5, z] })) };

  // ---- frame handle (left seat rail): bent bar, front tab bolted, rear peg in the frame tab ----
  const grip = { type: "group", items: [
    tube([[110, 405, -428], [125, 400, -448], [140, 396, -490], [131, 398, -536], [112, 404, -556]], 8),
    { type: "box", size: [5, 22, 26], r: 1.5, at: [110.5, 405, -420] },
    { type: "box", size: [5, 22, 20], r: 1.5, at: [104.5, 405, -560] },
    { type: "cyl", r: 4, h: 8, axis: "x", at: [94, 405, -560] },
  ] };
  const bolt12 = bolt8(1, 115, 405, -420, 16);
  const w13 = wX(1, 113, 1, 9, 4.2, 2, 405, -420);

  // ---- tool holder tray and tool set ----
  const holder = { type: "group", items: [
    { type: "box", size: [152, 3, 180], r: 1, at: [0, 361.5, -370] },
    { type: "box", size: [3, 46, 180], r: 1, at: [74.5, 383, -370] }, { type: "box", size: [3, 46, 180], r: 1, at: [-74.5, 383, -370] },
    { type: "box", size: [152, 46, 3], r: 1, at: [0, 383, -281.5] }, { type: "box", size: [152, 46, 3], r: 1, at: [0, 383, -458.5] },
    { type: "box", size: [8, 3, 180], r: .8, at: [80, 407.5, -370] }, { type: "box", size: [8, 3, 180], r: .8, at: [-80, 407.5, -370] },
  ] };
  const toolset = { type: "group", items: [
    { type: "box", size: [128, 30, 150], r: 10, at: [0, 378, -370] },
    { type: "box", size: [128, 3, 60], r: 1.5, at: [0, 394.5, -330] },                 // flap folded over
    { type: "cyl", r: 5, h: 4, axis: "y", at: [0, 395, -310], mat: "chrome" },        // press stud
  ] };

  const ex = (dx, dy = 0, dz = 0) => [dx, dy, dz], Z = [0, 0, 0];

  return {
    id: "CMS-BLCK0023", title: "Frame", units: "mm", page: "BLCK0023",
    accuracy: "Approximate geometry. Part identity, numbering and the layout of the plates and fasteners follow the CMSNL frame page and its picture. Bolt sizes (8 x 65, 8 x 16, 8 x 40) are read from the catalogue part numbers. Tube routing and sizes, head angle, plate shapes and where the lugs, tabs and trays sit are typical 1970s 750 double-cradle proportions placed on the same pivot and shock points as the swing arm and shock models, not measured from a GS750. Use the factory service manual for every dimension.",
    view: { dir: [1.2, .95, .6], up: [0, 1, 0] },
    notModelled: "Every ref is drawn. Refs 1-1/1-2/1-3, 14-1/14-2 and 15-1/15-2 are earlier and later part numbers for the same frame, tool holder and tool set, so one of each is shown. Refs 2-1 and 2-2 are taken to be the left and right front plates. The picture shows plate 5 on one side only, so one is drawn, on the right cradle rail; check your frame. Bolt counts per plate (two each) and the frame handle having one bolt with a peg at the other end are a best reading of the picture. The engine through-bolts, battery, seat and side covers are on other pages and aren't drawn. The battery carrier, stand lugs and other tabs are drawn as part of the frame.",
    stages: [
      { t: "Rear engine plates", d: "With the engine in the frame, set the two No. 3 plates inside the rear down tubes so they line up with the lugs and the engine's rear upper mount." },
      { t: "Rear plate bolts", d: "Fit the 8 x 40 bolts with lock washers from outside through the lugs into the plates. Leave them finger tight until all mounts are in." },
      { t: "Front engine plates", d: "Hold the front plates against the outside of the lugs low on each down tube, lined up with the engine's front mount." },
      { t: "Front plate bolts", d: "Fit the long bolts with lock washers through the plates and lugs, two on each side." },
      { t: "Lower plate", d: "Sit the lower plate on its tab on the right cradle rail with the ear up against the crankcase mount." },
      { t: "Lower plate bolts", d: "Fit the two short bolts with lock washers down through the plate into the tab. Now tighten every engine mount bolt, then the engine through-bolts. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
      { t: "Tool holder", d: "Drop the tool holder in between the seat rails so its edges rest on the ledges." },
      { t: "Tool set", d: "Put the tool set in the holder. It should sit below the edges so the seat closes on it." },
      { t: "Frame handle", d: "Push the peg on the back of the handle into the rear tab on the left seat rail, then bolt the front end to its tab with the washer. Torque: VERIFY IN FACTORY SERVICE MANUAL." },
    ],
    parts: [
      { id: "frame", ref: "1", name: "Frame", mat: "black", stage: 0, A: Z, E: Z, dir: [0, 1, 0], geom: frame },
      // rear plates (No. 3)
      { id: "p8L", ref: "8", name: "Engine mounting plate No. 3 (left)", mat: "black", parent: "frame", stage: 1, A: Z, E: ex(0, 480), dir: [0, -1, 0], geom: plate8(1) },
      { id: "p8R", ref: "8", name: "Engine mounting plate No. 3 (right)", mat: "black", parent: "frame", stage: 1, A: Z, E: ex(0, 480), dir: [0, -1, 0], geom: plate8(-1) },
      { id: "lw10L", ref: "10", name: "Lock washers, rear plate (left)", mat: "spring", small: true, parent: "p8L", stage: 2, A: Z, E: ex(240), dir: [-1, 0, 0], count: 2, geom: lw10(1) },
      { id: "b9L", ref: "9", name: "Bolts 8 x 40, rear plate (left)", mat: "zinc", small: true, parent: "p8L", stage: 2, A: Z, E: ex(300), dir: [-1, 0, 0], count: 2, geom: bolts9(1) },
      { id: "lw10R", ref: "10", name: "Lock washers, rear plate (right)", mat: "spring", small: true, parent: "p8R", stage: 2, A: Z, E: ex(-240), dir: [1, 0, 0], count: 2, geom: lw10(-1) },
      { id: "b9R", ref: "9", name: "Bolts 8 x 40, rear plate (right)", mat: "zinc", small: true, parent: "p8R", stage: 2, A: Z, E: ex(-300), dir: [1, 0, 0], count: 2, geom: bolts9(-1) },
      // front plates
      { id: "p2L", ref: "2", name: "Front engine mounting plate (left)", mat: "black", parent: "frame", stage: 3, A: Z, E: ex(200), dir: [-1, 0, 0], geom: plate2(1) },
      { id: "p2R", ref: "2", name: "Front engine mounting plate (right)", mat: "black", parent: "frame", stage: 3, A: Z, E: ex(-200), dir: [1, 0, 0], geom: plate2(-1) },
      { id: "lw4L", ref: "4", name: "Lock washers, front plate (left)", mat: "spring", small: true, parent: "p2L", stage: 4, A: Z, E: ex(300), dir: [-1, 0, 0], count: 2, geom: lw4(1) },
      { id: "b3L", ref: "3", name: "Bolts 8 x 65, front plate (left)", mat: "zinc", small: true, parent: "p2L", stage: 4, A: Z, E: ex(400), dir: [-1, 0, 0], count: 2, geom: bolts3(1) },
      { id: "lw4R", ref: "4", name: "Lock washers, front plate (right)", mat: "spring", small: true, parent: "p2R", stage: 4, A: Z, E: ex(-300), dir: [1, 0, 0], count: 2, geom: lw4(-1) },
      { id: "b3R", ref: "3", name: "Bolts 8 x 65, front plate (right)", mat: "zinc", small: true, parent: "p2R", stage: 4, A: Z, E: ex(-400), dir: [1, 0, 0], count: 2, geom: bolts3(-1) },
      // lower plate on the right cradle rail
      { id: "p5", ref: "5", name: "Lower engine mounting plate", mat: "black", parent: "frame", stage: 5, A: Z, E: ex(-220), dir: [1, 0, 0], geom: plate5 },
      { id: "lw7", ref: "7", name: "Lock washers, lower plate", mat: "spring", small: true, parent: "p5", stage: 6, A: Z, E: ex(-220, 85), dir: [0, -1, 0], count: 2, geom: lw7 },
      { id: "b6", ref: "6", name: "Bolts 8 x 16, lower plate", mat: "zinc", small: true, parent: "p5", stage: 6, A: Z, E: ex(-220, 115), dir: [0, -1, 0], count: 2, geom: bolts6 },
      // tool holder and tool set
      { id: "holder", ref: "14", name: "Tool holder", mat: "black", parent: "frame", stage: 7, A: Z, E: ex(0, 260), dir: [0, -1, 0], geom: holder },
      { id: "tools", ref: "15", name: "Tool set (in its roll)", mat: "dark", parent: "holder", stage: 8, A: Z, E: ex(0, 380), dir: [0, -1, 0], geom: toolset },
      // frame handle
      { id: "grip", ref: "11", name: "Frame handle", mat: "chrome", parent: "frame", stage: 9, A: Z, E: ex(250), dir: [-1, 0, 0], geom: grip },
      { id: "w13", ref: "13", name: "Washer, frame handle bolt", mat: "zinc", small: true, parent: "grip", stage: 9, A: Z, E: ex(300), dir: [-1, 0, 0], geom: w13 },
      { id: "b12", ref: "12", name: "Bolt 8 x 16, frame handle", mat: "zinc", small: true, parent: "grip", stage: 9, A: Z, E: ex(345), dir: [-1, 0, 0], geom: bolt12 },
    ],
  };
})();
D3_MODELS["CMS-BLCK0023"] = D3_BLCK0023;
